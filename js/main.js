/* BR-ICE: classic script. All reusable flavour/currency content lives here. */
'use strict';
const FLAVOURS = [
 {id:'vanilla',name:'Vanilla Bean',origin:'Madagascar',background:'#2b66f0',text:'#fff4e4',scoop:'#f6e7c7',kcal:148,note:'The original. Anything but ordinary.',facts:['Real vanilla pods','Slow-churned','0 g added sugar']},
 {id:'chocolate',name:'Dark Chocolate',origin:'Belgium',background:'#f6c739',text:'#1b1233',scoop:'#503024',kcal:172,note:'Deep, dark, and a little dramatic.',facts:['Belgian cocoa','Rich & velvety','0 g added sugar']},
 {id:'mango',name:'Alphonso Mango',origin:'India',background:'#b0a1f1',text:'#1b1233',scoop:'#f5a52c',kcal:141,note:'A little sunshine. By the spoonful.',facts:['Alphonso mango','Golden & juicy','0 g added sugar']},
 {id:'pistachio',name:'Sicilian Pistachio',origin:'Sicily',background:'#f66e58',text:'#1b1233',scoop:'#b9c58a',kcal:168,note:'A little nutty. In the best way.',facts:['Real pistachios','Roasted & creamy','0 g added sugar']},
 {id:'strawberry',name:'Strawberry & Cream',origin:'Summer, wherever you are',background:'#87d6bb',text:'#1b1233',scoop:'#ed9ba7',kcal:145,note:'Your summer crush, all year round.',facts:['Real strawberries','Creamy ripples','0 g added sugar']},
 {id:'caramel',name:'Salted Caramel',origin:'A sweet-salty state of mind',background:'#0c767e',text:'#fff4e4',scoop:'#dca354',kcal:165,note:'Sweet meets salty. Everybody wins.',facts:['Golden caramel','Sea-salt finish','0 g added sugar']}
];
const PRICES = {USD:12,EUR:11,GBP:10,INR:990,JPY:1800};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
window.BRICE={FLAVOURS,PRICES,reduced,heroProgress:0,ready:false,clips:[],manifest:null};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const safeStore={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}

class ScrubClip {
 constructor(name,video,poster,nearElement){this.name=name;this.video=video;this.poster=poster;this.progress=0;this.time=0;this.active=false;this.ready=false;this.url=null;window.BRICE.clips.push(this);this.observer=new IntersectionObserver(es=>{this.active=es.some(e=>e.isIntersecting)},{rootMargin:'100% 0px'});this.observer.observe(nearElement||video)}
 async load(onProgress=()=>{}){
  if(this.promise)return this.promise;
  this.promise=(async()=>{
   const mobile=matchMedia('(max-width:760px)').matches;
   const response=await fetch(`media/scrub/${this.name}${mobile?'-m':''}.mp4`);
   if(!response.ok)throw Error('Clip unavailable: '+this.name);
   const total=Number(response.headers.get('content-length'))||0;
   let blob;
   if(response.body&&total){const reader=response.body.getReader(),chunks=[];let loaded=0;while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;onProgress(loaded/total)}blob=new Blob(chunks,{type:'video/mp4'})}else{blob=await response.blob();onProgress(1)}
   this.url=URL.createObjectURL(blob);this.video.src=this.url;
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Video metadata timeout')),12000);this.video.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve()},{once:true});this.video.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Cannot decode video'))},{once:true});this.video.load()});
   try{await this.video.play();this.video.pause()}catch{this.video.pause()}
   this.video.currentTime=0;this.time=0;this.ready=true;this.video.classList.add('ready');return this;
  })().catch(error=>{this.error=error.message;return null});
  return this.promise;
 }
 tick(){if(!this.ready||!this.active||document.hidden)return;const target=this.progress*Math.max(0,this.video.duration-.05);this.time+=(target-this.time)*.2;if(Math.abs(this.video.currentTime-this.time)>.008&&!this.video.seeking)this.video.currentTime=this.time}
 dispose(){this.observer.disconnect();if(this.url)URL.revokeObjectURL(this.url)}
}
window.BRICE.ScrubClip=ScrubClip;
function coverPoint(x,y,w,h,sourceW=1280,sourceH=720){const s=Math.max(w/sourceW,h/sourceH);return{x:x*sourceW*s-(sourceW*s-w)/2,y:y*sourceH*s-(sourceH*s-h)/2}}
window.BRICE.coverPoint=coverPoint;

async function init(){
 const canAnimate=!!(window.gsap&&window.ScrollTrigger);if(canAnimate)gsap.registerPlugin(ScrollTrigger,SplitText);
 const hero=new ScrubClip('pint',$('#hero-video'),$('#hero-poster'),$('#top'));window.BRICE.hero=hero;
 const manifestPromise=fetch('media/manifest.json').then(r=>r.ok?r.json():null).catch(()=>null).then(data=>{window.BRICE.manifest=data;if(data){document.documentElement.style.setProperty('--pint',data.clips.pint.background);for(const f of FLAVOURS){f.background=data.clips[f.id].endBackground;document.documentElement.style.setProperty('--'+f.id,f.background)}}});
 let loadProgress=0;
 const paintLoader=v=>{loadProgress=Math.max(loadProgress,clamp(v));$('#loader-fill').style.clipPath=`inset(${(1-loadProgress)*100}% 0 0)`;$('#loader-count').textContent=String(Math.floor(loadProgress*100)).padStart(3,'0');$('#loader-message').textContent=loadProgress<.35?'Churning real milk':loadProgress<.75?'Leaving out the sugar':'Cracking the pint'};
 const fonts=document.fonts?document.fonts.ready:Promise.resolve();
 const heroLoad=reduced?Promise.resolve():hero.load(p=>paintLoader(.08+p*.87));
 await Promise.race([Promise.all([fonts,heroLoad,manifestPromise]),new Promise(r=>setTimeout(r,5000))]);
 paintLoader(1);
 if(canAnimate&&!reduced){gsap.to('#loader',{yPercent:-105,duration:.75,ease:'power3.inOut',onComplete:()=>$('#loader').remove()})}else $('#loader').remove();
 if(reduced){$('#hero-poster').src='media/poster/pint-end.jpg'}
 if(canAnimate&&!reduced){
  if(window.Lenis){const lenis=new Lenis({duration:1.05,smoothWheel:true});window.BRICE.lenis=lenis;lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}
  gsap.ticker.add(()=>window.BRICE.clips.forEach(c=>c.tick()));
  initHero(hero);
  let prev=0;ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{if(Math.abs(s.scroll()-prev)>12){gsap.to('#nav-wrap',{yPercent:s.direction===1&&s.scroll()>200?-150:0,duration:.3,overwrite:true});prev=s.scroll()}}});
  let travel=0;gsap.ticker.add((t,dt)=>{const velocity=ScrollTrigger.getById('hero')?.getVelocity()||0;travel+=(.035+Math.min(Math.abs(velocity)*.000035,.15))*dt*(velocity<-.1?-1:1);const track=$('.marquee-track');const half=track.scrollWidth/2;gsap.set(track,{x:-((travel%half+half)%half),skewX:clamp(velocity/650,-8,8)})});
 }else if(!reduced){$('#hero-poster').src='media/poster/pint-end.jpg';$('.hero-outro').style.cssText='opacity:1;visibility:visible;position:relative;padding:30px';$('#top').style.height='auto';$('#hero-stage').style.cssText='position:relative;height:80vh';$('.hero-word').hidden=true;notify('Motion libraries are unavailable. Showing the readable poster version.')}
 if(canAnimate&&!reduced){ScrollTrigger.refresh();window.BRICE.lenis?.resize()}
 window.BRICE.ready=true;document.dispatchEvent(new Event('brice:ready'));
 if(window.initChapters)await window.initChapters();
 initCursor();
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const target=document.querySelector(link.getAttribute('href'));if(!target)return;event.preventDefault();if(window.BRICE.lenis)window.BRICE.lenis.scrollTo(target,{offset:-85});else target.scrollIntoView({behavior:reduced?'instant':'smooth'})});
 addEventListener('pagehide',event=>{if(!event.persisted)window.BRICE.clips.forEach(c=>c.dispose())});
}
function initHero(hero){
 const mobile=matchMedia('(max-width:760px)').matches,film=$('#hero-film');
 function layout(){const w=$('#hero-stage').clientWidth,h=$('#hero-stage').clientHeight;const fw=film.clientWidth,fh=film.clientHeight;for(const tag of $$('.ingredient-tag')){if(tag.dataset.x==='0.22')tag.classList.toggle('tag-left',w>1100);const sourceW=hero.video.videoWidth||1280,sourceH=hero.video.videoHeight||720;const p=coverPoint(+tag.dataset.x,+tag.dataset.y,fw,fh,sourceW,sourceH);gsap.set(tag,{left:p.x,top:p.y,xPercent:tag.classList.contains('tag-left')?-100:0,yPercent:-50})}
  if(mobile){gsap.set(film,{xPercent:-50,scale:.88});gsap.set('.hero-br',{left:'50%',top:'22%',xPercent:-50,yPercent:-50,fontSize:'23vw'});gsap.set('.hero-ice',{left:'50%',top:'80%',xPercent:-50,yPercent:-50,fontSize:'23vw'})}
  else{const left=coverPoint(.36,.5,w,h).x,right=coverPoint(.69,.5,w,h).x;const leftSpace=Math.max(150,left-40),rightSpace=Math.max(150,w-right-40);gsap.set('.hero-br',{left:leftSpace/2+10,top:'48%',fontSize:leftSpace*.77,xPercent:-50,yPercent:-50});gsap.set('.hero-ice',{left:right+rightSpace/2+10,top:'48%',fontSize:rightSpace*.59,xPercent:-50,yPercent:-50})}
 }
 layout();addEventListener('resize',layout);hero.video.addEventListener('loadeddata',layout);
 window.BRICE.heroLayoutCleanup=()=>{removeEventListener('resize',layout);hero.video.removeEventListener('loadeddata',layout)};
 if(!window.BRICE.heroBreakpoint){window.BRICE.heroBreakpoint=matchMedia('(max-width:760px)');window.BRICE.heroBreakpoint.addEventListener('change',()=>{window.BRICE.heroTimeline?.scrollTrigger.kill(true);window.BRICE.heroTimeline?.kill();window.BRICE.heroLayoutCleanup?.();gsap.set('#hero-film,#hero-stage,.hero-br,.hero-ice,.hero-intro,.hero-bottom,.ingredient-tag,.hero-outro',{clearProps:'all'});initHero(hero);ScrollTrigger.refresh();window.BRICE.lenis?.resize()})}
 const timeline=gsap.timeline({scrollTrigger:{id:'hero',trigger:'#top',start:'top top',end:'+=260%',pin:true,scrub:true,invalidateOnRefresh:true,onUpdate:s=>{hero.progress=clamp(s.progress/.67);window.BRICE.heroProgress=s.progress}}});
 timeline.to('.hero-br',{x:mobile?0:-450,y:mobile?-110:0,autoAlpha:0,duration:.24,ease:'power2.in'},.04).to('.hero-ice',{x:mobile?0:450,y:mobile?110:0,autoAlpha:0,duration:.24,ease:'power2.in'},.04).to('.hero-intro,.hero-bottom',{autoAlpha:0,duration:.12},.02);
 if(mobile)timeline.to(film,{scale:.49,duration:.45,ease:'none'},.22);else if(innerWidth<=1100)timeline.to(film,{scale:.90,duration:.4,ease:'none'},.24);
 timeline.to('.ingredient-tag',{autoAlpha:1,duration:.05,stagger:.01},.70).to('.ingredient-tag',{autoAlpha:0,duration:.04},.81).to('#hero-stage',{scale:.74,yPercent:-18,borderRadius:35,duration:.17,ease:'power2.inOut'},.80).fromTo('.hero-outro',{y:70,autoAlpha:0},{y:0,autoAlpha:1,duration:.15},.85);
 timeline.to({}, {duration:.001},.999);
 window.BRICE.heroTimeline=timeline;
}
function initCursor(){if(!matchMedia('(pointer:fine)').matches||reduced||!window.gsap)return;const cursor=$('#cursor');const x=gsap.quickTo(cursor,'x',{duration:.17}),y=gsap.quickTo(cursor,'y',{duration:.17});gsap.set(cursor,{xPercent:-50,yPercent:-50});addEventListener('pointermove',e=>{cursor.style.opacity='1';x(e.clientX);y(e.clientY)});document.addEventListener('pointerover',e=>{const drag=e.target.closest('#cone-canvas');const interactive=e.target.closest('a,button,select,input');cursor.textContent=drag?'Drag':'';gsap.to(cursor,{width:drag?54:interactive?27:9,height:drag?54:interactive?27:9,duration:.2})})}
window.initChapters=async function(){
 const animate=!!window.gsap&&!reduced;
 // One FLAVOURS array generates all three product interfaces.
 $('#flavour-layers').innerHTML=FLAVOURS.map((f,i)=>`<article class="flavour-layer" data-flavour="${f.id}" style="--flavour-bg:${f.background};--flavour-ink:${f.text}" ${i&&!reduced?'inert':''}><div class="flavour-film"><img src="media/poster/${f.id}${reduced?'-end':''}.jpg" alt="${f.name} ice cream cone${reduced?', exploded to reveal its ingredients':''}"><video class="scrub-video" id="film-${f.id}" muted playsinline preload="none" aria-hidden="true"></video></div><div class="flavour-copy"><p class="flavour-number">${String(i+1).padStart(2,'0')} / 06</p><p class="flavour-origin">${f.origin}</p><h3>${f.name.replace(' ','<br><span class=mobile-space>&nbsp;</span>')}</h3><p class="flavour-note">${f.note}</p><div class="fact-pills">${f.facts.map(s=>`<span>${s}</span>`).join('')}</div><div class="flavour-purchase"><div class="flavour-price"><span data-price></span><small>per pint / 473 ml</small></div><button class="button" data-add="${f.id}"><span>Add a pint ↗</span></button></div></div></article>`).join('');
 $('#flavour-rail').innerHTML=FLAVOURS.map((f,i)=>`<button data-flavour-jump="${i}" aria-current="${i===0}">${f.name}</button>`).join('');
 $('#shop-grid').innerHTML=FLAVOURS.map(f=>`<article class="shop-card" style="--flavour-bg:${f.background};--flavour-ink:${f.text}"><p>${f.origin}</p><h3>${f.name}</h3><div class="shop-image"><img src="media/img/${f.id}.webp" alt="${f.name} in a golden waffle cone" loading="lazy"></div><div class="shop-card-bottom"><div><strong data-price></strong><small>473 ml pint</small></div><button class="shop-add" data-add="${f.id}" aria-label="Add ${f.name} pint to bag">+</button></div></article>`).join('');
 $('#builder-chips').innerHTML=FLAVOURS.map(f=>`<button data-scoop="${f.id}"><span class="chip-dot" style="background:${f.scoop}"></span>${f.name}</button>`).join('');
 const moments=[['tokyo','Tokyo','JP'],['paris','Paris','FR'],['newyork','New York','US'],['mumbai','Mumbai','IN'],['lisbon','Lisbon','PT'],['coast','Amalfi Coast','IT'],['picnic','London','UK']];
 $('#moments-track').innerHTML=moments.map(([id,city,country],i)=>`<figure class="polaroid" style="--tilt:${[-5,4,-3,6,-4,3,-5][i]}deg"><img src="media/img/social/${id}.webp" alt="${id==='picnic'?'Unbranded ice cream pints on a picnic blanket':`An ice cream moment in ${city}`}" loading="lazy"><figcaption><em>${city}</em><span>${country} / ${String(i+1).padStart(2,'0')}</span></figcaption></figure>`).join('');
 const sugar=new ScrubClip('sugar-cube',$('#sugar-video'),$('.villain-media img'),$('#story'));
 const flavourClips=FLAVOURS.map(f=>new ScrubClip(f.id,$('#film-'+f.id),$(`#film-${f.id}`).previousElementSibling,$('#theatre')));
 window.BRICE.flavourClips=flavourClips;
 if(!reduced)window.BRICE.mediaReady=(async()=>{await window.BRICE.hero.promise;for(const clip of [sugar,...flavourClips])await clip.load()})();
 if(reduced){$$('[data-end]').forEach(im=>im.src=im.dataset.end)}
 initLoops();initCommerce();initBuilderControls();
 if(animate){
  const villain=gsap.timeline({scrollTrigger:{id:'villain',trigger:'#story',start:'top top',end:'+=220%',pin:true,scrub:true,onUpdate:s=>{sugar.progress=clamp((s.progress-.12)/.63);$('#sugar-count').textContent=Math.round(24*(1-clamp((s.progress-.55)/.4)))}}});
  const words=SplitText.create('.villain-first',{type:'words',mask:'words'});villain.from(words.words,{yPercent:110,stagger:.018,duration:.12},0).to('.villain-first',{y:-100,autoAlpha:0,duration:.2},.3);
  const letters=SplitText.create('.villain-second',{type:'chars',mask:'chars'});villain.set('.villain-second',{autoAlpha:1},.48).from(letters.chars,{yPercent:110,stagger:.01,duration:.14},.48).fromTo('.sugar-card',{y:60,autoAlpha:0},{y:0,autoAlpha:1,duration:.2},.68).to({}, {duration:.1},.9);
  gsap.from('.milk-arch',{clipPath:'inset(100% 0 0 0)',duration:1.3,ease:'power3.out',scrollTrigger:{trigger:'.milk-grid',start:'top 70%',once:true}});
  $$('[data-count]').forEach(el=>{const n={v:Number(el.dataset.start)||0};gsap.to(n,{v:Number(el.dataset.count),duration:1.8,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(n.v),scrollTrigger:{trigger:'.milk-facts',start:'top 85%',once:true}})});
  gsap.from('.pasture-frame',{scale:.85,borderRadius:65,scrollTrigger:{trigger:'.pasture',start:'top 95%',end:'top 25%',scrub:true}});gsap.to('.pasture-frame img',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.pasture',start:'top bottom',end:'bottom top',scrub:true}});
  const feel=gsap.timeline({scrollTrigger:{id:'feel',trigger:'#feel',start:'top top',end:'+=160%',pin:true,scrub:true}});feel.to('.feel-film',{clipPath:'inset(0% 0% round 0px)',duration:.6}).to('.feel-shade',{opacity:1,duration:.4},.3).from('#feel-title',{y:120,autoAlpha:0,duration:.4},.4).from('.feel-note',{autoAlpha:0,duration:.2},.65);
  const layers=$$('.flavour-layer');gsap.set(layers.slice(1),{clipPath:'inset(100% 0 0 round 55px 55px 0 0)'});
  let active=-1;
  ScrollTrigger.create({id:'flavours',trigger:'#theatre',start:'top top',end:'+=900%',pin:true,scrub:true,onUpdate:s=>{const value=Math.min(s.progress*6,5.9999),index=Math.floor(value),local=value-index;
   layers.forEach((layer,i)=>{const current=i===index;layer.inert=!current;layer.setAttribute('aria-hidden',String(!current));if(i<index)gsap.set(layer,{clipPath:'inset(0% 0 0 round 0px)'});else if(i>index)gsap.set(layer,{clipPath:'inset(100% 0 0 round 55px 55px 0 0)'});else gsap.set(layer,{clipPath:`inset(${i===0?0:100*(1-clamp(local/.17))}% 0 0 round ${local<.17?55:0}px ${local<.17?55:0}px 0 0)`});gsap.set(layer.querySelector('.flavour-copy'),{y:i<index?-170:current?(1-clamp(local/.2))*60:60,opacity:current?clamp(local/.16):i<index?0:1});flavourClips[i].progress=i<index?1:current?clamp((local-.17)/.73):0});
   if(active!==index){active=index;$$('[data-flavour-jump]').forEach((b,i)=>b.setAttribute('aria-current',String(i===index)))}
  }});
  $$('[data-flavour-jump]').forEach(b=>b.addEventListener('click',()=>{const st=ScrollTrigger.getById('flavours');window.BRICE.lenis?.scrollTo(st.start+(st.end-st.start)*(Number(b.dataset.flavourJump)+.3)/6)}));
  const track=$('#moments-track');const distance=()=>Math.max(0,track.scrollWidth-innerWidth);gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{id:'moments',trigger:'#moments',start:'top top',end:()=>'+='+Math.max(distance(),innerWidth),pin:true,scrub:true,invalidateOnRefresh:true}});
  $$('.polaroid').forEach((card,i)=>gsap.from(card,{y:100,rotation:i%2?12:-12,scrollTrigger:{trigger:'#moments',start:'top 85%',end:'top top',scrub:true}}));
  $$('[data-reveal]').forEach(el=>{SplitText.create(el,{type:'words',mask:'words',autoSplit:true,onSplit:self=>gsap.from(self.words,{yPercent:115,stagger:.055,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}})})});
  gsap.from('.footer-word',{yPercent:80,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:'.footer-word',start:'top bottom',once:true}});
  ScrollTrigger.refresh();window.BRICE.lenis?.resize();
 }else{
  if(!reduced)document.body.classList.add('static-mode');
  $('.villain-second').style.cssText='opacity:1;visibility:visible';$('.sugar-card').style.cssText='opacity:1;visibility:visible';$('#sugar-count').textContent='0';
  $$('[data-flavour-jump]').forEach(b=>b.addEventListener('click',()=>$('.flavour-layer[data-flavour="'+FLAVOURS[Number(b.dataset.flavourJump)].id+'"]').scrollIntoView()));
 }
 const navObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const id=entry.target.id;$$('.nav-links a').forEach(a=>a.classList.toggle('active',a.hash==='#'+id))}},{rootMargin:'-15% 0px -50% 0px'});['story','flavours','build','moments','shop'].forEach(id=>navObserver.observe($('#'+id)));
 window.BRICE.chaptersReady=true;document.dispatchEvent(new Event('brice:chapters'));
};

function initLoops(){
 const videos=$$('video[data-loop]');if(reduced)return;
 const observer=new IntersectionObserver(entries=>{for(const {target:v,isIntersecting} of entries){v.dataset.near=String(isIntersecting);if(isIntersecting&&!document.hidden){if(!v.src)v.src=`media/loop/${v.dataset.loop}.mp4`;v.play().then(()=>v.classList.add('playing')).catch(()=>{})}else v.pause()}},{rootMargin:'100px'});videos.forEach(v=>observer.observe(v));document.addEventListener('visibilitychange',()=>videos.forEach(v=>{if(document.hidden)v.pause();else if(v.dataset.near==='true')v.play().catch(()=>{})}));
}
function initCommerce(){
 const saved=safeStore.get('brice-bag');let bag={};try{const parsed=JSON.parse(saved)||{};for(const f of FLAVOURS)if(Number.isInteger(parsed[f.id])&&parsed[f.id]>0)bag[f.id]=Math.min(parsed[f.id],99)}catch{}
 const language=navigator.language||'en-US';let currency=safeStore.get('brice-currency');if(!PRICES[currency])currency=/^ja/i.test(language)?'JPY':/(-IN|^hi)/i.test(language)?'INR':/-GB/i.test(language)?'GBP':/^(de|fr|it|es|pt|nl|el)/i.test(language)?'EUR':'USD';$('#currency').value=currency;
 const money=n=>new Intl.NumberFormat(navigator.language,{style:'currency',currency,maximumFractionDigits:currency==='JPY'?0:2}).format(n);
 function render(){const count=Object.values(bag).reduce((a,b)=>a+b,0);$('#bag-count').textContent=count;$$('[data-price]').forEach(el=>el.textContent=money(PRICES[currency]));$('#subtotal').textContent=money(count*PRICES[currency]);$('#bag-shipping').textContent=count>=4?'Your pints ship free. Sweet.':count===0?'Four pints. Free shipping. Just saying.':`Add ${4-count} more pint${4-count===1?'':'s'} for free shipping.`;$('#bag-items').innerHTML=count?FLAVOURS.filter(f=>bag[f.id]).map(f=>`<div class="bag-item"><img src="media/img/${f.id}.webp" alt="${f.name}"><div><h3>${f.name}</h3><div class="quantity"><button data-qty="${f.id}" data-step="-1" aria-label="Remove one ${f.name}">−</button><span aria-label="Quantity">${bag[f.id]}</span><button data-qty="${f.id}" data-step="1" aria-label="Add one ${f.name}">+</button></div></div><span class="bag-item-price">${money(bag[f.id]*PRICES[currency])}</span></div>`).join(''):'<p class="bag-empty">Your bag is empty.<br>Bold of you.</p>';$('#checkout').disabled=!count;safeStore.set('brice-bag',JSON.stringify(bag));window.BRICE.cart={...bag};}
 function fly(button,id){if(reduced||!window.gsap)return;const rect=button.getBoundingClientRect(),dest=$('#bag-open').getBoundingClientRect();const dot=document.createElement('span');dot.className='flying-dot';dot.style.background=FLAVOURS.find(f=>f.id===id).background;dot.style.left=(rect.x+rect.width/2)+'px';dot.style.top=(rect.y+rect.height/2)+'px';document.body.append(dot);gsap.to(dot,{x:dest.x-rect.x,y:dest.y-rect.y,scale:.4,duration:.7,ease:'power2.inOut',onComplete:()=>dot.remove()});gsap.fromTo('#bag-count',{scale:1.4},{scale:1,duration:.4,delay:.65})}
 document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){const id=add.dataset.add;bag[id]=Math.min(99,(bag[id]||0)+1);render();if(window.gsap)gsap.to('#nav-wrap',{yPercent:0,duration:.25,overwrite:true});fly(add,id);notify(FLAVOURS.find(f=>f.id===id).name+' added. Excellent choice.')}const qty=e.target.closest('[data-qty]');if(qty){const id=qty.dataset.qty;bag[id]=Math.max(0,Math.min(99,bag[id]+Number(qty.dataset.step)));if(!bag[id])delete bag[id];const step=qty.dataset.step;render();const next=$(`[data-qty="${id}"][data-step="${step}"]`)||$('#bag-close');next.focus()}});
 $('#currency').addEventListener('change',e=>{currency=e.target.value;safeStore.set('brice-currency',currency);render()});
 const dialog=$('#bag');let opener;
 function closeBag(){dialog.close();window.BRICE.lenis?.start();document.body.style.overflow='';opener?.focus()}
 $('#bag-open').addEventListener('click',()=>{opener=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';window.BRICE.lenis?.stop();$('#bag-close').focus()});$('#bag-close').addEventListener('click',closeBag);$('#keep-shopping').addEventListener('click',closeBag);dialog.addEventListener('cancel',e=>{e.preventDefault();closeBag()});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)closeBag()}});
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusable=[...dialog.querySelectorAll('button:not([disabled]),a,input,select,[tabindex="0"]')];const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
 $('#checkout').addEventListener('click',()=>{$('#checkout-message').textContent='This is a storefront template. Connect your commerce checkout before accepting orders.'});
 $('#newsletter-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#email'),message=$('#email-message');if(!input.validity.valid){input.setAttribute('aria-invalid','true');message.textContent='That email needs one more look. Try name@example.com.';input.focus();return}input.removeAttribute('aria-invalid');message.textContent='That looks good! This template needs an email-service connection before it can subscribe you.'});$('#year').textContent=new Date().getFullYear();render();
}
function initBuilderControls(){
 const stack=[];window.BRICE.stack=stack;
 function update(){const total=stack.reduce((n,id)=>n+FLAVOURS.find(f=>f.id===id).kcal,0);$('#scoop-count').textContent=`${stack.length} / 3 scoops`;$('#cone-kcal').textContent=total;$('#scoop-list').innerHTML=stack.length?stack.map((id,i)=>{const f=FLAVOURS.find(f=>f.id===id);return `<li><span class="chip-dot" style="background:${f.scoop}"></span><span>${i+1}. ${f.name}</span><button data-remove-scoop="${i}" aria-label="Remove scoop ${i+1}: ${f.name}">×</button></li>`}).join(''):'<li class="empty-stack">A blank cone. Endless possibilities.</li>';$$('[data-scoop]').forEach(b=>b.disabled=stack.length>=3);$('#snap-cone').disabled=!stack.length;const top=FLAVOURS.find(f=>f.id===stack.at(-1));$('#build').style.backgroundColor=top?top.background:'var(--strawberry)';$('#builder-status').textContent=stack.length?`${stack.length} scoops, ${total} illustrative kcal.`:'Your cone is empty.';document.dispatchEvent(new CustomEvent('brice:stack',{detail:{stack:[...stack],sprinkles:$('#sprinkles').checked}}));}
 window.BRICE.updateCone=update;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-scoop]');if(b&&stack.length<3){stack.push(b.dataset.scoop);update()}const remove=e.target.closest('[data-remove-scoop]');if(remove){stack.splice(Number(remove.dataset.removeScoop),1);update()}});$('#clear-cone').addEventListener('click',()=>{stack.length=0;update()});$('#sprinkles').addEventListener('change',update);
 let shown=false;const observer=new IntersectionObserver(entries=>{if(!shown&&entries.some(e=>e.isIntersecting)){shown=true;if(!stack.length){stack.push('strawberry');update()}observer.disconnect()}},{threshold:.18});observer.observe($('#build'));update();
 $('#snap-cone').addEventListener('click',async()=>{if(window.BRICE.snapCone){try{await window.BRICE.snapCone();notify('Your cone is ready for its close-up.')}catch{notify('Could not save your cone. Try again in a WebGL-capable browser.')}}else notify('The 3D renderer is not available in this browser.')});
}
document.addEventListener('DOMContentLoaded',init);


