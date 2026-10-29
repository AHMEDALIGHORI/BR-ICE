"""Verify encoding contracts using ffprobe; no third-party Python packages."""
from pathlib import Path
import subprocess,json,os,struct
root=Path(__file__).resolve().parent.parent
probe=os.environ.get('FFPROBE') or str(root/'work/tools/node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe')
if not Path(probe).is_file():probe='ffprobe'
results=[]
for f in sorted((root/'media').glob('*/*.mp4')):
    d=json.loads(subprocess.check_output([probe,'-v','quiet','-show_streams','-show_format','-of','json',str(f)]))
    video=next(s for s in d['streams'] if s['codec_type']=='video')
    assert video['codec_name']=='h264',f
    assert all(s['codec_type']!='audio' for s in d['streams']),f
    assert video['width']==(720 if f.stem.endswith('-m') else 1280),f
    with f.open('rb') as fp:
        atoms=[]
        while True:
            header=fp.read(8)
            if len(header)<8:break
            size,atom=struct.unpack('>I4s',header);atoms.append(atom.decode('ascii'))
            if size==1:size=struct.unpack('>Q',fp.read(8))[0];size-=8
            if size<8:break
            fp.seek(size-8,1)
    assert atoms.index('moov')<atoms.index('mdat'),f
    max_gap=None
    if f.parent.name=='scrub':
        frames=json.loads(subprocess.check_output([probe,'-v','quiet','-select_streams','v:0','-show_frames','-show_entries','frame=key_frame,pict_type','-of','json',str(f)]))['frames']
        keys=[i for i,v in enumerate(frames) if v['key_frame']]
        max_gap=max(b-a for a,b in zip(keys,keys[1:]))
        assert max_gap<=2,(f,max_gap)
        assert not any(v['pict_type']=='B' for v in frames),f
    results.append({'clip':str(f.relative_to(root)),'width':video['width'],'height':video['height'],'duration':float(d['format']['duration']),'keyframeGap':max_gap,'faststart':True,'audio':False})
total=sum(f.stat().st_size for f in (root/'media').rglob('*') if f.is_file())
report={'totalBytes':total,'under55MB':total<55_000_000,'clips':results}
(root/'work/media/verification.json').write_text(json.dumps(report,indent=2))
# Confirm manifest dimensions match actual processed streams.
manifest=json.loads((root/'media/manifest.json').read_text())
for r in results:
    key=Path(r['clip']).stem
    if key in manifest['clips']:
        assert manifest['clips'][key]['width']==r['width'],key
        assert manifest['clips'][key]['height']==r['height'],key
print(json.dumps({'videos':len(results),'scrub':sum(r['keyframeGap'] is not None for r in results),'mediaMB':round(total/1e6,2),'allPassed':True}))
