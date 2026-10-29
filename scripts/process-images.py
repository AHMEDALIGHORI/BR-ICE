"""Resize supplied photography; raw assets are never modified. Requires Pillow."""
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parent.parent
mapping={
 'tokyo': 'Woman_holding_strawberry_ice_cream_',
 'paris':'paris.png_', 'newyork':'newyork.png_', 'mumbai':'mumbai.png_',
 'lisbon':'lisbon.png_', 'coast':'Couple_holding_ice_cream_on_', 'picnic':'picnic.png_',
 'pasture':'Cows_grazing_on_alpine_pasture_', 'lineup':'Six_ice_cream_tubs_displayed_',
 'milk':'still-milk.png_', 'floating':'Floating_ice_cream_scoops_arc_'
}
for name,prefix in mapping.items():
    files=list((ROOT/'assets').glob(prefix+'*'))
    if len(files)!=1: raise ValueError(f'Missing/ambiguous photo: {name}')
    im=ImageOps.exif_transpose(Image.open(files[0])).convert('RGB')
    width=720 if name in ['tokyo','paris','newyork','mumbai','lisbon','coast','picnic'] else 1600
    im.thumbnail((width,10000),Image.Resampling.LANCZOS)
    folder=ROOT/'media/img'/('social' if width==720 else '')
    folder.mkdir(parents=True,exist_ok=True)
    im.save(folder/(name+'.webp'),quality=86,method=6)
    print(name,im.size)
