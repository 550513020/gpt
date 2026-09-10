import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { Sky } from 'three/addons/Sky.js';
import { createArchitecture, LOCATIONS } from './scene.js?v=6';
import { stairWalkingHeight } from './atrium.js?v=6';
import { loadSurfaceMaps } from './materials.js?v=6';
import { createLightingPipeline } from './lighting.js?v=6';
import { circulationHeight } from './circulation.js?v=6';
import { enhanceSky,createWeather,sunDirection } from './weather.js?v=6';
import { shopBlocks } from './shop-routes.js?v=6';

const $=id=>document.getElementById(id);
const container=$('viewport');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){$('loading').innerHTML='<strong>当前设备无法开启三维场景</strong><span>请使用支持 WebGL 2 的浏览器，或开启硬件加速。</span>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;
renderer.domElement.setAttribute('aria-label','三维建筑：拖动旋转、滚轮缩放。可通过下方按钮直接进入店铺。');
const scene=new THREE.Scene();scene.background=new THREE.Color('#b4cbe5');scene.fog=new THREE.FogExp2('#c0d1df',.0038);
const camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.075,500);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.maxPolarAngle=Math.PI*.487;controls.minDistance=.6;controls.maxDistance=130;controls.target.set(0,9,1);
controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
const hemi=new THREE.HemisphereLight('#d4e8ff','#a99b73',1.6);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff2d8',3.0);sun.position.set(-30,40,-26);sun.castShadow=true;
sun.shadow.mapSize.set(innerWidth<700?2048:4096,innerWidth<700?2048:4096);Object.assign(sun.shadow.camera,{left:-52,right:52,top:54,bottom:-50,near:1,far:190});sun.shadow.bias=-.0001;sun.shadow.normalBias=.02;sun.shadow.radius=2;sun.target.position.set(0,0,24);scene.add(sun,sun.target);
const fill=new THREE.AmbientLight('#cdd8db',.16);scene.add(fill);
const sky=new Sky();sky.scale.setScalar(450);const uniforms=sky.material.uniforms;uniforms.turbidity.value=4;uniforms.rayleigh.value=1.45;uniforms.mieCoefficient.value=.004;uniforms.mieDirectionalG.value=.84;scene.add(sky);
enhanceSky(sky);
const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileCubemapShader();
const surfaces=await loadSurfaceMaps(renderer);
const model=createArchitecture({maps:surfaces.maps});scene.add(model.root);
const weather=createWeather(scene,model,sky,{mobile:innerWidth<800});
const composer=createLightingPipeline(renderer,scene,camera,model.glassGroup,sky);
renderer.shadowMap.autoUpdate=false;
// Four warm area lights are represented with point lights to keep the model light.
const retailLights=[];
for(const x of [-16,16])for(const z of [-1,24]){const light=new THREE.PointLight('#ffcf88',38,20,2);light.position.set(x,3.55,z);scene.add(light);retailLights.push(light);}
let envRT=null,currentView='front',walk=false,transition=null,ride=null,lastTime=performance.now(),lightMode='day';
let interiorOn=true,reflectivity=.08,lookYaw=0,lookPitch=0,drag=null;
const keys=new Set();const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function notice(message){$('notice').textContent=message;$('notice').hidden=false;setTimeout(()=>$('notice').hidden=true,3500);}
function updateReflection(){model.glazing.envMapIntensity=.04+reflectivity*.75;model.glazing.roughness=.028;model.glazing.reflectivity=.1+reflectivity*.3;model.glazing.specularIntensity=.12+reflectivity*.5;model.balustrade.envMapIntensity=.035+reflectivity*.55;model.balustrade.specularIntensity=.08+reflectivity*.3;model.glazing.needsUpdate=true;}
function refreshEnvironment(){
  const tempScene=new THREE.Scene();tempScene.add(sky);const next=pmrem.fromScene(tempScene,.03,.1,500);scene.add(sky);const old=envRT;envRT=next;scene.environment=next.texture;scene.environmentIntensity=lightMode==='day'?.42:lightMode==='rain'?.62:.65;
  model.glazing.envMap=next.texture;model.balustrade.envMap=next.texture;model.vitrine.envMap=next.texture;if(old)old.dispose();updateReflection();
}
function setLight(mode){
  lightMode=mode;const day=mode==='day',rain=mode==='rain';
  const direction=sunDirection(mode);uniforms.sunPosition.value.copy(direction);
  uniforms.turbidity.value=day?2.1:5;uniforms.rayleigh.value=day?1.35:2.3;
  sun.color.set(day?'#fff0d7':rain?'#e2eaf0':'#ffdaa8');sun.intensity=day?4.65:rain?.28:1.5;sun.position.copy(direction.clone().multiplyScalar(70)).add(sun.target.position);
  hemi.color.set(day?'#d8e9ff':'#b6cdeb');hemi.intensity=day?.82:rain?1.05:1.15;fill.intensity=day?.13:rain?.22:.16;
  scene.fog.color.set(day?'#cbdce5':rain?'#9fadb5':'#b5c6db');scene.fog.density=day?.0027:rain?.009:.0038;renderer.toneMappingExposure=day?.98:rain?1.04:1.08;weather.set(mode,direction);
  setInterior(interiorOn);document.querySelectorAll('[data-light]').forEach(b=>{b.classList.toggle('selected',b.dataset.light===mode);b.setAttribute('aria-pressed',String(b.dataset.light===mode));});refreshEnvironment();renderer.shadowMap.needsUpdate=true;
}
function setInterior(on){interiorOn=on;const scale=on?(lightMode==='day'?.65:1):0;model.mats.whiteGlow.emissiveIntensity=1.1*scale;model.mats.warmGlow.emissiveIntensity=1.6*scale;model.mats.wall.emissiveIntensity=.13*scale;retailLights.forEach(l=>l.intensity=38*scale);}
function viewPosition(key){const data=LOCATIONS[key];const eye=new THREE.Vector3(...data.eye),target=new THREE.Vector3(...data.target);if(['front','aerial'].includes(key)){const factor=Math.max(1,1.75/(innerWidth/innerHeight));eye.sub(target).multiplyScalar(factor).add(target);}return {eye,target};}
function setView(key,immediate=false){
  ride=null;controls.enabled=true;
  if(walk)setWalk(false);currentView=key;history.replaceState(null,'','#'+key);const data=LOCATIONS[key],p=viewPosition(key);
  $('store-view').value=[...$('store-view').options].some(o=>o.value===key)?key:'';
  $('view-title').textContent=data.title;$('view-description').textContent=data.description;$('location-index').textContent=String(Object.keys(LOCATIONS).indexOf(key)+1).padStart(2,'0');
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===key);b.setAttribute('aria-pressed',String(b.dataset.view===key));});
  controls.maxDistance=['jewelry','toys'].includes(key)?32:300;controls.maxPolarAngle=Math.PI*.495;
  if(immediate||reducedMotion){transition=null;camera.position.copy(p.eye);controls.target.copy(p.target);controls.update();}else transition={start:performance.now(),from:camera.position.clone(),to:p.eye,fromTarget:controls.target.clone(),toTarget:p.target};
}
function setWalk(enabled){
  walk=enabled;ride=null;transition=null;controls.enabled=!enabled;keys.clear();$('walk').setAttribute('aria-pressed',String(enabled));$('walk-help').hidden=!enabled;$('walk-pad').hidden=!enabled;
  if(enabled){if(currentView==='front'||currentView==='aerial'){camera.position.set(0,1.85,-12);controls.target.set(0,1.85,7);}const direction=new THREE.Vector3();camera.getWorldDirection(direction);if(currentView==='front'||currentView==='aerial')direction.set(0,0,1);lookYaw=Math.atan2(-direction.x,-direction.z);lookPitch=Math.asin(THREE.MathUtils.clamp(direction.y,-.95,.95));renderer.domElement.focus();}
  else {const direction=new THREE.Vector3();camera.getWorldDirection(direction);controls.target.copy(camera.position).addScaledVector(direction,6);controls.update();}
}
function isBlocked(x,z){
  const lift=model.atrium.lift;if(Math.abs(x-lift.x)<1.2&&Math.abs(z-lift.z)<1.22&&Math.abs(camera.position.y-(lift.cabin.position.y+1.7))>.7)return true;
  return shopBlocks(model,camera.position,x,z);
}
function stepWalk(dt){
  camera.rotation.order='YXZ';camera.rotation.set(lookPitch,lookYaw,0);
  const speed=(keys.has('Shift')?7:3.1)*dt;const forward=new THREE.Vector3(-Math.sin(lookYaw),0,-Math.cos(lookYaw));const right=new THREE.Vector3(Math.cos(lookYaw),0,-Math.sin(lookYaw));const movement=new THREE.Vector3();
  if(keys.has('w')||keys.has('ArrowUp'))movement.add(forward);if(keys.has('s')||keys.has('ArrowDown'))movement.sub(forward);if(keys.has('a')||keys.has('ArrowLeft'))movement.sub(right);if(keys.has('d')||keys.has('ArrowRight'))movement.add(right);
  if(movement.lengthSq()>0){movement.normalize().multiplyScalar(speed);const next=camera.position.clone().add(movement);const support=circulationHeight(model.atrium,next.x,next.z,camera.position.y)??circulationHeight(model.roof,next.x,next.z,camera.position.y);const aboveAtrium=next.z>40.8&&next.z<63.1&&Math.abs(next.x)<12.3&&camera.position.y>3;if(!isBlocked(next.x,next.z)&&(!(aboveAtrium||(camera.position.y>19&&next.z<15&&Math.abs(next.x)<30))||support!==null||keys.has('q')||keys.has('e'))){camera.position.x=THREE.MathUtils.clamp(next.x,-44,44);camera.position.z=THREE.MathUtils.clamp(next.z,-35,66);if(support!==null)camera.position.y=support;}}
  if(keys.has('q'))camera.position.y-=speed;if(keys.has('e'))camera.position.y+=speed;camera.position.y=THREE.MathUtils.clamp(camera.position.y,1.55,25);
}
$('store-view').addEventListener('change',e=>{if(e.target.value)setView(e.target.value);});
$('ride-lift').addEventListener('click',()=>{
  setView('atrium',true);const lift=model.atrium.lift,floor=Number($('lift-floor').value);
  ride={floor,fromFloor:lift.floors.findIndex(y=>Math.abs(y-(lift.cabin.position.y-.04))<.1),start:performance.now(),from:lift.cabin.position.y-.04,to:lift.floors[floor],duration:2200+Math.abs(lift.cabin.position.y-lift.floors[floor])*240};
  controls.enabled=false;$('view-title').textContent=`玻璃电梯 · ${floor+1}F`;$('view-description').textContent='到达后可开启自由行走，穿过候梯区进入回廊';
});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-light]').forEach(b=>b.addEventListener('click',()=>setLight(b.dataset.light)));
$('reflection').addEventListener('input',e=>{reflectivity=e.target.value/100;$('reflection-value').value=e.target.value+'%';updateReflection();});
$('interior').addEventListener('change',e=>setInterior(e.target.checked));
$('routes').addEventListener('change',e=>model.runtime.routes.visible=e.target.checked);
$('reset').addEventListener('click',()=>setView(currentView));$('walk').addEventListener('click',()=>setWalk(!walk));
$('save-image').addEventListener('click',()=>{
  composer.render();
  renderer.domElement.toBlob(blob=>{
    if(!blob){notice('此设备暂时无法保存画面。');return;}
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`水岸庭院-${currentView}-${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
    document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    notice('当前三维画面已保存到浏览器下载目录。');
  },'image/png');
});
$('panel-toggle').addEventListener('click',()=>{const collapsed=document.querySelector('.material-panel').classList.toggle('collapsed');$('panel-toggle').textContent=collapsed?'+':'−';$('panel-toggle').setAttribute('aria-expanded',String(!collapsed));$('panel-toggle').setAttribute('aria-label',collapsed?'展开光影与材质':'收起光影与材质');});
$('references').addEventListener('click',()=>{keys.clear();$('reference-dialog').showModal();});$('close-dialog').addEventListener('click',()=>$('reference-dialog').close());$('reference-dialog').addEventListener('click',e=>{if(e.target===$('reference-dialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)e.target.close();}});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('experience').requestFullscreen)await $('experience').requestFullscreen();else notice('此浏览器不支持全屏，可横屏查看。');}catch{notice('此浏览器暂时无法进入全屏。');}});
renderer.domElement.addEventListener('pointerdown',e=>{transition=null;if(walk){drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!walk||!drag)return;lookYaw-=(e.clientX-drag.x)*.0035;lookPitch=THREE.MathUtils.clamp(lookPitch-(e.clientY-drag.y)*.003,-1.35,1.35);drag={x:e.clientX,y:e.clientY};});
const endDrag=()=>drag=null;renderer.domElement.addEventListener('pointerup',endDrag);renderer.domElement.addEventListener('pointercancel',endDrag);
renderer.domElement.addEventListener('wheel',()=>transition=null,{passive:true});
window.addEventListener('keydown',e=>{if($('reference-dialog').open||['INPUT','BUTTON','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(walk&&['w','a','s','d','q','e','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift'].includes(key)){keys.add(key);e.preventDefault();}if(e.key==='Escape'&&walk)setWalk(false);});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();drag=null;});
const stepKeys={forward:'w',back:'s',left:'a',right:'d'};document.querySelectorAll('[data-step]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(stepKeys[b.dataset.step]);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(stepKeys[b.dataset.step]));});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();notice('图形连接已暂停，正在尝试恢复。');});renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
if(innerWidth<800){document.querySelector('.material-panel').classList.add('collapsed');$('panel-toggle').textContent='+';$('panel-toggle').setAttribute('aria-expanded','false');$('gesture-hint').textContent='单指旋转 · 双指缩放 / 平移';}
setView(LOCATIONS[location.hash.slice(1)]?location.hash.slice(1):'front',true);setLight('day');
function animate(time){
  const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
  if(!$('reference-dialog').open){if(transition){const t=THREE.MathUtils.clamp((time-transition.start)/1700,0,1);const ease=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,ease);if(t===1)transition=null;}
    if(ride){const t=THREE.MathUtils.clamp((time-ride.start)/ride.duration,0,1),travel=THREE.MathUtils.clamp((t-.12)/.76,0,1),ease=travel*travel*(3-2*travel),y=THREE.MathUtils.lerp(ride.from,ride.to,ease),lift=model.atrium.lift;lift.cabin.position.y=lift.cabinGlass.position.y=y+.04;const open=t<.12?1-t/.12:t>.88?(t-.88)/.12:0;lift.doors.forEach((door,i)=>door.position.x=(i?1:-1)*(.44+open*.78));lift.landingDoors.forEach((pair,f)=>pair.forEach((door,i)=>door.position.x=lift.x+(i?1:-1)*(.44+((t<.12&&f===ride.fromFloor)||(t>.88&&f===ride.floor)?open:0)*.78)));camera.position.set(lift.x,y+1.73,lift.z-.12);controls.target.set(lift.x,y+1.7,lift.z-6);camera.lookAt(controls.target);if(t===1){ride=null;controls.enabled=true;}}
    if(walk)stepWalk(dt);else if(!ride)controls.update();model.update(dt,time/1000,camera,interiorOn);weather.tick(dt,time/1000);composer.render(dt);}
  requestAnimationFrame(animate);
}
model.update(0,0,camera,true);renderer.compile(scene,camera);composer.render();$('loading').classList.add('done');setTimeout(()=>$('loading').hidden=true,700);requestAnimationFrame(animate);
// Expose only a compact scene summary, useful for troubleshooting a user report.
window.riversideScene={stats:model.stats,threeVersion:THREE.REVISION,materialMaps:surfaces.loaded,contactShadows:true,skyLightPaths:weather.lightPaths};
