import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const state=()=>window.BRICE;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function random(seed){let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function initBurst(){
 const canvas=document.querySelector('#burst-canvas');if(reduced)return;
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'})}catch{canvas.replaceWith(Object.assign(document.createElement('p'),{className:'scene-fallback',textContent:'The sprinkle effect needs WebGL. The pint film still works.'}));return}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.z=9;
 scene.add(new THREE.HemisphereLight(0xffffff,0xa24f81,2.8));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-4,5,8);scene.add(light);
 const rng=random(4719),dummy=new THREE.Object3D(),n=90,drops=38;
 const capsules=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.025,.13,3,5),new THREE.MeshStandardMaterial({roughness:.42}),n);
 const droplets=new THREE.InstancedMesh(new THREE.SphereGeometry(.045,7,6),new THREE.MeshStandardMaterial({color:0xfff8ef,roughness:.2}),drops);
 const palette=['#fff4e4','#2b66f0','#f6c739','#b0a1f1','#f66e58','#87d6bb'];const directions=[];
 for(let i=0;i<n+drops;i++){const angle=rng()*Math.PI*2;directions.push({angle,radius:2.5+rng()*4,z:-2+rng()*6,rot:rng()*Math.PI*2,speed:1+rng()});if(i<n)capsules.setColorAt(i,new THREE.Color(palette[i%palette.length]))}
 capsules.frustumCulled=false;droplets.frustumCulled=false;scene.add(capsules,droplets);let visible=false,last=-1;
 new IntersectionObserver(es=>{visible=es[0].isIntersecting},{rootMargin:'100px'}).observe(canvas);
 const resize=()=>{renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(canvas);
 function frame(){requestAnimationFrame(frame);if(!visible||document.hidden||!state())return;const p=state().heroProgress;if(Math.abs(p-last)<.0001)return;last=p;const t=THREE.MathUtils.clamp((p-.17)/.52,0,1),e=1-Math.pow(1-t,2);const fade=1-THREE.MathUtils.smoothstep(p,.70,.82);
  directions.forEach((d,i)=>{const radius=(1.5+e*d.radius);dummy.position.set(Math.cos(d.angle)*radius,Math.sin(d.angle)*radius*.65,e*d.z);dummy.rotation.set(d.rot+t*8,d.rot+t*4,t*7);const scale=(t===0?0:1)*fade;dummy.scale.setScalar(scale);if(i>=n)dummy.scale.y*=1.8;dummy.updateMatrix();(i<n?capsules:droplets).setMatrixAt(i<n?i:i-n,dummy.matrix)});
  capsules.instanceMatrix.needsUpdate=true;droplets.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);
 }frame();
}
initBurst();

// Trilinear value noise with four octaves: the scoop is actual displaced geometry.
function hash(x,y,z){const n=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return n-Math.floor(n)}
function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let fx=x-ix,fy=y-iy,fz=z-iz;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);fz=fz*fz*(3-2*fz);const mix=(a,b,t)=>a+(b-a)*t;return mix(mix(mix(hash(ix,iy,iz),hash(ix+1,iy,iz),fx),mix(hash(ix,iy+1,iz),hash(ix+1,iy+1,iz),fx),fy),mix(mix(hash(ix,iy,iz+1),hash(ix+1,iy,iz+1),fx),mix(hash(ix,iy+1,iz+1),hash(ix+1,iy+1,iz+1),fx),fy),fz)}
function fbm(x,y,z){let sum=0,amp=.5;for(let i=0;i<4;i++){sum+=noise(x,y,z)*amp;x*=2.07;y*=2.07;z*=2.07;amp*=.5}return sum}
function canvasTexture(paint,size=512){const c=document.createElement('canvas');c.width=c.height=size;paint(c.getContext('2d'),size);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex}
function waffleTexture(){return canvasTexture((ctx,s)=>{ctx.fillStyle='#c58b43';ctx.fillRect(0,0,s,s);ctx.lineWidth=10;for(let i=-s;i<s*2;i+=64){ctx.strokeStyle='#875021';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+s,s);ctx.stroke();ctx.beginPath();ctx.moveTo(i,s);ctx.lineTo(i+s,0);ctx.stroke();ctx.strokeStyle='#edbb70';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(i+8,0);ctx.lineTo(i+s+8,s);ctx.stroke();ctx.beginPath();ctx.moveTo(i+8,s);ctx.lineTo(i+s+8,0);ctx.stroke();ctx.lineWidth=10}})}
function scoopTexture(flavour,index){const rng=random(300+index);return canvasTexture((ctx,s)=>{ctx.fillStyle=flavour.scoop;ctx.fillRect(0,0,s,s);for(let i=0;i<7000;i++){const x=rng()*s,y=rng()*s;ctx.fillStyle=rng()>.5?'#ffffff18':'#39271310';ctx.beginPath();ctx.arc(x,y,rng()*2+.5,0,Math.PI*2);ctx.fill()}
 const id=flavour.id;if(['strawberry','caramel','mango'].includes(id)){ctx.strokeStyle=id==='strawberry'?'#a32d4e':id==='caramel'?'#975124':'#f47f16';ctx.lineWidth=id==='strawberry'?8:11;ctx.globalAlpha=.65;for(let i=0;i<6;i++){ctx.beginPath();const y=i*105-60;ctx.moveTo(-30,y);ctx.bezierCurveTo(s*.25,y+100+rng()*80,s*.65,y-130+rng()*60,s+30,y+140);ctx.stroke()}ctx.globalAlpha=1}
 if(['vanilla','chocolate','pistachio'].includes(id)){ctx.fillStyle=id==='vanilla'?'#45362e':id==='chocolate'?'#2d1912':'#637238';const count=id==='vanilla'?380:id==='pistachio'?250:420;for(let i=0;i<count;i++){const r=id==='vanilla'?.5+rng()*1.2:1+rng()*3;ctx.beginPath();ctx.ellipse(rng()*s,rng()*s,r,r*.6,rng()*3,0,Math.PI*2);ctx.fill()}}
})}

function initBuilder(){
 if(!state()?.FLAVOURS){document.addEventListener('brice:ready',initBuilder,{once:true});return}
 const canvas=document.querySelector('#cone-canvas');if(!canvas)return;
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true})}catch{
  const message=document.createElement('div');message.className='scene-fallback';message.textContent='Your browser cannot show the 3D cone. You can still choose flavours in the panel. Try a browser with WebGL enabled for spinning and snapshots.';canvas.replaceWith(message);return;
 }
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new THREE.Scene();const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfff8ed,0x98866f,1.2));const key=new THREE.DirectionalLight(0xfff6e5,2.7);key.position.set(-3,5,6);scene.add(key);const rim=new THREE.DirectionalLight(0xffffff,1.8);rim.position.set(3,4,-2);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.5,6.7);
 const assembly=new THREE.Group();scene.add(assembly);assembly.rotation.z=-.055;
 const waffle=waffleTexture();waffle.wrapS=waffle.wrapT=THREE.RepeatWrapping;waffle.repeat.set(1.5,1);
 const coneMaterial=new THREE.MeshStandardMaterial({map:waffle,bumpMap:waffle,bumpScale:.06,roughness:.9,side:THREE.DoubleSide});
 const cone=new THREE.Mesh(new THREE.ConeGeometry(.53,1.7,64,1,true),coneMaterial);cone.rotation.z=Math.PI;cone.position.y=-.85;assembly.add(cone);
 const rimMesh=new THREE.Mesh(new THREE.TorusGeometry(.525,.028,10,64),new THREE.MeshStandardMaterial({color:'#c68e49',roughness:.8}));rimMesh.rotation.x=Math.PI/2;assembly.add(rimMesh);
 const flavours=state().FLAVOURS,materials=new Map();flavours.forEach((f,i)=>{const tex=scoopTexture(f,i);materials.set(f.id,new THREE.MeshStandardMaterial({map:tex,bumpMap:tex,bumpScale:.022,roughness:.77}))});
 function makeScoop(id,index){const group=new THREE.Group();const geometry=new THREE.SphereGeometry(.65,64,48);const pos=geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),length=Math.hypot(x,y,z);const n=fbm(x*9+index*5,y*9,z*9)-.45;const ridge=Math.sin(Math.atan2(z,x)*19+y*15)*.009;const amount=1+n*.14+ridge;pos.setXYZ(i,x*amount,y*amount*.94,z*amount)}geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,materials.get(id));group.add(mesh);
  const lipGeo=new THREE.TorusGeometry(.49,.055,16,144);const lpos=lipGeo.attributes.position;for(let i=0;i<lpos.count;i++){const x=lpos.getX(i),y=lpos.getY(i),z=lpos.getZ(i);const a=Math.atan2(y,x);const ruffle=1+.045*Math.sin(a*19)+.025*Math.sin(a*31);lpos.setXYZ(i,x*ruffle,y*ruffle,z+.018*Math.sin(a*23))}lipGeo.computeVertexNormals();const lip=new THREE.Mesh(lipGeo,materials.get(id));lip.rotation.x=Math.PI/2;lip.position.y=-.36;group.add(lip);group.userData={id,targetY:.37+index*.62,drop:reduced?1:0,started:performance.now()};group.position.y=group.userData.targetY+(reduced?0:2.7);return group;
 }
 const sprinkleMesh=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.018,.075,3,5),new THREE.MeshStandardMaterial({roughness:.5}),75);sprinkleMesh.frustumCulled=false;assembly.add(sprinkleMesh);const r=random(9401),dummy=new THREE.Object3D(),sprinkles=[];for(let i=0;i<75;i++){const a=r()*Math.PI*2,t=.15+r()*1.05;const point=new THREE.Vector3(Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)).multiplyScalar(.71);sprinkles.push({point,a,tilt:r()*Math.PI});sprinkleMesh.setColorAt(i,new THREE.Color(['#fff4e4','#f67d8f','#f7c82e','#4073de','#7ca657'][i%5]))}
 let scoops=[],visible=false,dirty=true,targetYaw=0,yaw=0,cameraY=.2,targetCameraY=.2,cameraZ=6.7,targetCameraZ=6.7,sprinklesEnabled=true;
 const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true};new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)dirty=true},{rootMargin:'0px'}).observe(canvas);
 function release(group){group.traverse(o=>{if(o.isMesh)o.geometry.dispose()})}
 function setStack(stack,enabled){sprinklesEnabled=enabled;const old=scoops;scoops=stack.map((id,i)=>{if(old[i]?.userData.id===id){old[i].userData.targetY=.37+i*.62;return old[i]}const g=makeScoop(id,i);assembly.add(g);return g});old.forEach(g=>{if(!scoops.includes(g)){assembly.remove(g);release(g)}});targetCameraY=stack.length*.22-.4;targetCameraZ=6.5+Math.max(0,stack.length-1)*.6;dirty=true;}
 document.addEventListener('brice:stack',e=>setStack(e.detail.stack,e.detail.sprinkles));if(state().stack)setStack(state().stack,true);
 let pointer=null;canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY,start:targetYaw};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.abs(dx)>Math.abs(dy)){targetYaw=pointer.start+dx*.012;dirty=true}});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetYaw+=e.key==='ArrowLeft'?-.35:.35;dirty=true}});
 function bounce(t){const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375}
 function update(now){let animating=false;yaw+=(targetYaw-yaw)*.14;assembly.rotation.y=yaw;cameraY+=(targetCameraY-cameraY)*.1;cameraZ+=(targetCameraZ-cameraZ)*.1;camera.position.set(0,cameraY+.55,cameraZ);camera.lookAt(0,cameraY,0);if(Math.abs(targetYaw-yaw)>.001||Math.abs(targetCameraY-cameraY)>.001||Math.abs(targetCameraZ-cameraZ)>.001)animating=true;
  scoops.forEach(g=>{const t=reduced?1:THREE.MathUtils.clamp((now-g.userData.started)/1000,0,1);g.position.y=g.userData.targetY+2.7*(1-bounce(t));const squash=t<.45?0:Math.sin((t-.45)*Math.PI*7)*Math.exp(-(t-.45)*7)*.13;g.scale.set(1+squash*.5,1-squash,1+squash*.5);if(t<1)animating=true});
  sprinkleMesh.visible=sprinklesEnabled&&scoops.length>0;if(sprinkleMesh.visible){const top=scoops.at(-1);sprinkles.forEach((s,i)=>{dummy.position.copy(s.point);dummy.position.y=top.position.y+s.point.y*top.scale.y;dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),s.point.clone().normalize());dummy.rotateX(Math.PI/2);dummy.rotateY(s.tilt);dummy.scale.setScalar(1);dummy.updateMatrix();sprinkleMesh.setMatrixAt(i,dummy.matrix)});sprinkleMesh.instanceMatrix.needsUpdate=true}
  return animating;
 }
 function frame(now){requestAnimationFrame(frame);if(!visible||document.hidden)return;const animating=update(now);if(dirty||animating){renderer.render(scene,camera);dirty=animating}}
 requestAnimationFrame(frame);
 state().snapCone=async()=>{
  if(!scoops.length)return;await document.fonts.ready;
  const original={w:canvas.clientWidth,h:canvas.clientHeight,ratio:renderer.getPixelRatio(),aspect:camera.aspect};
  const exportCanvas=document.createElement('canvas');exportCanvas.width=1080;exportCanvas.height=1350;const ctx=exportCanvas.getContext('2d');const top=flavours.find(f=>f.id===state().stack.at(-1));ctx.fillStyle=top.background;ctx.fillRect(0,0,1080,1350);
  renderer.setPixelRatio(1);renderer.setSize(1080,1050,false);camera.aspect=1080/1050;camera.updateProjectionMatrix();scoops.forEach(g=>{g.userData.started=performance.now()-1500});update(performance.now());renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,150,1080,1050);renderer.setPixelRatio(original.ratio);renderer.setSize(original.w,original.h,false);camera.aspect=original.aspect;camera.updateProjectionMatrix();dirty=true;
  ctx.fillStyle=top.text;ctx.textAlign='center';ctx.font='800 104px "Bricolage Grotesque"';ctx.fillText('BR-ICE',540,135);ctx.font='500 22px "DM Sans"';ctx.fillText('MY CONE. MY RULES.',540,189);ctx.fillStyle='#fff4e4';ctx.beginPath();ctx.roundRect(54,1150,972,150,28);ctx.fill();ctx.fillStyle='#1b1233';ctx.font='600 24px "DM Sans"';const names=state().stack.map(id=>flavours.find(f=>f.id===id).name);ctx.fillText(names.slice(0,2).join(' + '),540,1200);if(names.length>2)ctx.fillText('+ '+names[2],540,1234);ctx.font='500 20px "DM Sans"';ctx.fillText('#BRICEmoments',540,1275);
  const blob=await new Promise(resolve=>exportCanvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG export failed');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='BR-ICE-my-cone.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 };
 state().builderScene={renderer,scene,camera,assembly,getScoops:()=>scoops};
}
initBuilder();


