#!/usr/bin/env bash
# BR-ICE media pipeline. Run from Git Bash, macOS, or Linux.
set -euo pipefail
cd "$(dirname "$0")/.."
FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
if ! command -v "$FFMPEG" >/dev/null 2>&1 && [[ -f work/tools/node_modules/ffmpeg-static/ffmpeg.exe ]]; then FFMPEG="$PWD/work/tools/node_modules/ffmpeg-static/ffmpeg.exe"; fi
if ! command -v "$FFPROBE" >/dev/null 2>&1 && [[ -f work/tools/node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe ]]; then FFPROBE="$PWD/work/tools/node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe"; fi
declare -A SRC=(
 [pint]='Ice_cream_pint_floating_opening_'
 [sugar-cube]='Sugar_cube_reveals_monk_fruit_'
 [vanilla]='Ice_cream_cone_breaking_apart_'
 [chocolate]='Chocolate_ice_cream_cone_exploding_'
 [mango]='Mango_ice_cream_cone_exploding_'
 [pistachio]='Pistachio_ice_cream_exploding_'
 [strawberry]='Ice_cream_cone_bursting_open_'
 [caramel]='Ice_cream_cone_exploding_'
 [milk]='Milk_pouring_forming_ice_cream_'
 [scoop-curl]='Scooping_vanilla_bean_ice_cream_'
 [floating]='Ice_cream_scoops_floating_'
)
mkdir -p media/{scrub,loop,poster,img/social} work/media
echo '{"clips":{' > work/media/manifest.next.json
comma=''
for name in pint sugar-cube vanilla chocolate mango pistachio strawberry caramel milk scoop-curl floating; do
 files=(assets/"${SRC[$name]}"*.mp4)
 [[ -f "${files[0]}" && ${#files[@]} -eq 1 ]] || { echo "Missing or ambiguous source for $name" >&2; exit 1; }
 src="${files[0]}"
 read -r width height < <("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$src" | tr x ' ' | tr -d '\r')
 duration=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$src" | tr -d '\r')
 # The supplied box was measured at 1920x1080. Scale it to actual input dimensions.
 dx=$((1690*width/1920)); dy=$((850*height/1080)); dw=$((180*width/1920)); dh=$((170*height/1080))
 clean="delogo=x=$dx:y=$dy:w=$dw:h=$dh"
 [[ "${DELOGO:-1}" == 0 ]] && clean='null'
 if [[ "$name" == milk || "$name" == scoop-curl || "$name" == floating ]]; then
   kind=loop
   "$FFMPEG" -hide_banner -loglevel error -y -i "$src" -map 0:v:0 -vf "$clean,crop=iw-8:ih-8:4:4,scale=1280:-2" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -an -movflags +faststart "media/loop/$name.mp4"
 else
   kind=scrub
   for size in 1280 720; do
     crf=25; suffix=''; rate=4M; buffer=8M; [[ $size == 720 ]] && { crf=27; suffix=-m; rate=1500k; buffer=3M; }
     "$FFMPEG" -hide_banner -loglevel error -y -i "$src" -map 0:v:0 -vf "$clean,crop=iw-8:ih-8:4:4,scale=$size:-2" -c:v libx264 -preset slow -crf "$crf" -maxrate "$rate" -bufsize "$buffer" -pix_fmt yuv420p -x264-params 'keyint=2:min-keyint=1:scenecut=0:bframes=0' -an -movflags +faststart "media/scrub/$name$suffix.mp4"
   done
 fi
 clip="media/$kind/$name.mp4"
 read -r outwidth outheight < <("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$clip" | tr x ' ' | tr -d '\r')
 "$FFMPEG" -hide_banner -loglevel error -y -i "$clip" -frames:v 1 -q:v 2 "media/poster/$name.jpg"
 last=$(awk -v d="$duration" 'BEGIN {printf "%.4f",d-0.05}')
 "$FFMPEG" -hide_banner -loglevel error -y -i "$clip" -ss "$last" -frames:v 1 -q:v 2 "media/poster/$name-end.jpg"
 rgb=$("$FFMPEG" -v error -i "$src" -vf 'crop=40:40:0:ih-40,scale=1:1:flags=area,format=rgb24' -frames:v 1 -f rawvideo - | od -An -tx1 | tr -d ' \n\r')
 endrgb=$("$FFMPEG" -v error -i "media/poster/$name-end.jpg" -vf 'crop=40:40:0:ih-40,scale=1:1:flags=area,format=rgb24' -frames:v 1 -f rawvideo - | od -An -tx1 | tr -d ' \n\r')
 printf '%s"%s":{"file":"%s","duration":%s,"width":%s,"height":%s,"sourceWidth":%s,"sourceHeight":%s,"background":"#%s","endBackground":"#%s"}' "$comma" "$name" "$clip" "$duration" "$outwidth" "$outheight" "$width" "$height" "$rgb" "$endrgb" >> work/media/manifest.next.json
 comma=,
 echo "$name: first background #$rgb; end background #$endrgb"
 case "$name" in vanilla|chocolate|mango|pistachio|strawberry|caramel)
   "$FFMPEG" -v error -y -i "media/poster/$name.jpg" -vf 'crop=ih:ih:(iw-ih)/2:0,scale=720:720' -quality 86 "media/img/$name.webp";; esac
done
echo '}}' >> work/media/manifest.next.json
mv work/media/manifest.next.json media/manifest.json
"$FFMPEG" -v error -y -i media/poster/pint-end.jpg -vf 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630' -quality 86 media/img/share.webp
bytes=$(find media -type f -print0 | xargs -0 wc -c | tail -1 | awk '{print $1}')
awk -v b="$bytes" 'BEGIN {printf "Media total: %.2f MB\n", b/1000000; if(b>55000000) print "WARNING: above the 55 MB target; preserve keyframe settings."}'
