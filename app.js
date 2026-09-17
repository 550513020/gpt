import { createScenePerformance } from './performance.js?v=11';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { Sky } from 'three/addons/Sky.js';
import { createArchitecture, LOCATIONS } from './scene.js?v=11';
import { stairWalkingHeight } from './atrium.js?v=11';
import { loadSurfaceMaps } from './materials.js?v=11';
import { createLightingPipeline } from './lighting.js?v=11';
import { circulationHeight } from './circulation.js?v=11';
import { enhanceSky,createWeather,sunDirection } from './weather.js?v=11';
import { createMallNavigator,levelAt,LEVELS } from './mall-navigation.js?v=11';
import { createLiftJourney,setLiftPose } from './lift-journey.js?v=11';
import { createShoppingTour } from './mall-tour.js?v=11';
import { addShoppers } from './shoppers.js?v=11';

const $=id=>document.getElementById(id);
const container=$('viewport');
const mode=window.__RIVERSIDE_DEVICE||new URLSearchParams(location.search).get('device');
const isMobile=mode==='mobile'||(mode!=='desktop'&&matchMedia('(pointer:coarse)').matches);document.body.classList.add(isMobile?'app-mobile':'app-desktop');
let qualityChoice='auto',qualityLevel=isMobile?'low':'balanced',pixelScale=isMobile?1:1.15,frameAverage=16,slowFrames=0,frameCount=0;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){$('loading').innerHTML='<strong>当前设备无法开启三维场景</strong><span>请使用支持 WebGL 2 的浏览器，或开启硬件加速。</span>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,pixelScale));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
renderer.info.autoReset=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;
renderer.domElement.setAttribute('aria-label','三维建筑：拖动旋转、滚轮缩放。可通过下方按钮直接进入店铺。');
const scene=new THREE.Scene();scene.background=new THREE.Color('#b4cbe5');scene.fog=new THREE.FogExp2('#c0d1df',.0038);
const outdoorFog=scene.fog;
const camera=new THREE.PerspectiveCamera(isMobile?(innerWidth<innerHeight?66:58):44,innerWidth/innerHeight,.075,500);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.maxPolarAngle=Math.PI*.487;controls.minDistance=.6;controls.maxDistance=130;controls.target.set(0,9,1);
controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
const hemi=new THREE.HemisphereLight('#d4e8ff','#a99b73',1.6);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff2d8',3.0);sun.position.set(-30,40,-26);sun.castShadow=true;
sun.shadow.mapSize.set(isMobile?1024:2048,innerWidth<700?2048:4096);Object.assign(sun.shadow.camera,{left:-52,right:52,top:54,bottom:-50,near:1,far:190});sun.shadow.bias=-.0001;sun.shadow.normalBias=.02;sun.shadow.radius=2;sun.target.position.set(0,0,24);scene.add(sun,sun.target);
const fill=new THREE.AmbientLight('#cdd8db',.16);scene.add(fill);
const sky=new Sky();sky.scale.setScalar(450);const uniforms=sky.material.uniforms;uniforms.turbidity.value=4;uniforms.rayleigh.value=1.45;uniforms.mieCoefficient.value=.004;uniforms.mieDirectionalG.value=.84;scene.add(sky);
enhanceSky(sky);
const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileCubemapShader();
const surfaces=await loadSurfaceMaps(renderer);
const model=createArchitecture({maps:surfaces.maps,optimize:true});scene.add(model.root);
const navigator=createMallNavigator(model),tour=createShoppingTour(model,navigator),shoppers=addShoppers(model,navigator);
const performanceModel=createScenePerformance(model,{mobile:isMobile});performanceModel.setQuality(qualityLevel);
const weather=createWeather(scene,model,sky,{mobile:isMobile});
const composer=createLightingPipeline(renderer,scene,camera,model.glassGroup,sky,{mobile:isMobile});
renderer.shadowMap.autoUpdate=false;
// Four warm area lights are represented with point lights to keep the model light.
const retailLights=[];
for(const x of [-16,16])for(const z of [-1,24]){const light=new THREE.PointLight('#ffcf88',38,20,2);light.position.set(x,3.55,z);scene.add(light);retailLights.push(light);}
let envRT=null,currentView='front',walk=false,transition=null,ride=null,drive=null,lastTime=performance.now(),lightMode='day';
let interiorOn=true,reflectivity=.08,lookYaw=0,lookPitch=0,drag=null;
let tourYaw=0,tourPitch=0,baseYaw=0,basePitch=0,lastPose=null,freeAltitude=false;
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
  outdoorFog.color.set(day?'#bdd9ee':rain?'#9fadb5':'#b5c6db');outdoorFog.density=day?.0015:rain?.009:.0038;renderer.toneMappingExposure=day?.98:rain?1.04:1.08;weather.set(mode,direction);
  setInterior(interiorOn);document.querySelectorAll('[data-light]').forEach(b=>{b.classList.toggle('selected',b.dataset.light===mode);b.setAttribute('aria-pressed',String(b.dataset.light===mode));});refreshEnvironment();renderer.shadowMap.needsUpdate=true;
}
function setInterior(on){interiorOn=on;const scale=on?(lightMode==='day'?.65:1):0;model.mats.whiteGlow.emissiveIntensity=1.1*scale;model.mats.warmGlow.emissiveIntensity=1.6*scale;model.mats.wall.emissiveIntensity=.13*scale;retailLights.forEach(l=>l.intensity=38*scale);}
function viewPosition(key){const data=LOCATIONS[key];const eye=new THREE.Vector3(...data.eye),target=new THREE.Vector3(...data.target);if(['front','aerial','roof'].includes(key)){const factor=Math.max(1,(isMobile?1.12:1.75)/(innerWidth/innerHeight));eye.sub(target).multiplyScalar(factor).add(target);}return {eye,target};}
function setView(key,immediate=false){
  stopJourney(false);controls.enabled=true;document.body.classList.remove('immersive');setMenu(false);
  if(walk)setWalk(false);currentView=key;history.replaceState(null,'','#'+key);const data=LOCATIONS[key],p=viewPosition(key);
  $('store-view').value=[...$('store-view').options].some(o=>o.value===key)?key:'';
  $('navigate-destination').disabled=$('preview-destination').disabled=!$('store-view').value;
  $('view-title').textContent=data.title;$('view-description').textContent=data.description;$('location-index').textContent=String(Object.keys(LOCATIONS).indexOf(key)+1).padStart(2,'0');
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===key);b.setAttribute('aria-pressed',String(b.dataset.view===key));});
  controls.maxDistance=['jewelry','toys'].includes(key)?32:300;controls.maxPolarAngle=Math.PI*(['front','aerial','roof'].includes(key)?.495:.97);
  if(immediate||reducedMotion){transition=null;camera.position.copy(p.eye);controls.target.copy(p.target);controls.update();}else transition={start:performance.now(),from:camera.position.clone(),to:p.eye,fromTarget:controls.target.clone(),toTarget:p.target};
}
function captureLook(){const d=new THREE.Vector3();camera.getWorldDirection(d);lookYaw=Math.atan2(-d.x,-d.z);lookPitch=Math.asin(THREE.MathUtils.clamp(d.y,-.95,.95));}
function walkUI(enabled){walk=enabled;document.body.classList.toggle('immersive',(enabled&&isMobile)||tour.active||!!ride||!!drive);$('leave-walk').hidden=!enabled||!isMobile;setMenu(false);controls.enabled=!enabled;keys.clear();$('walk').setAttribute('aria-pressed',String(enabled));$('walk-help').hidden=!enabled;$('walk-pad').hidden=!enabled;}
function settleLift(){for(const lift of [model.atrium.lift,model.express]){const y=lift.cabin.position.y-.04;let f=0;for(let i=1;i<LEVELS.length;i++)if(Math.abs(LEVELS[i]-y)<Math.abs(LEVELS[f]-y))f=i;setLiftPose(lift,LEVELS[f],1,f);}}
function stopJourney(keepPanel=false){if(tour.active||ride)settleLift();tour.stop();ride=null;drive=null;tourYaw=tourPitch=0;lastPose=null;$('tour-start').textContent='一键逛街';if(!keepPanel)$('tour-panel').hidden=true;$('checkout-card').hidden=true;$('time-card').hidden=true;$('ride-status').hidden=true;}
function setWalk(enabled){
  stopJourney();transition=null;
  if(enabled){
    captureLook();freeAltitude=Math.abs(camera.position.y-LEVELS[levelAt(camera.position.y)]-1.7)>.25;renderer.domElement.focus();
  }else{const direction=new THREE.Vector3();camera.getWorldDirection(direction);controls.target.copy(camera.position).addScaledVector(direction,6);}
  walkUI(enabled);if(!enabled)controls.update();
}
function stepWalk(dt){
  camera.rotation.order='YXZ';camera.rotation.set(lookPitch,lookYaw,0);
  const speed=(keys.has('Shift')?7:4.4)*dt,forward=new THREE.Vector3(-Math.sin(lookYaw),0,-Math.cos(lookYaw)),right=new THREE.Vector3(Math.cos(lookYaw),0,-Math.sin(lookYaw)),movement=new THREE.Vector3();
  if(keys.has('w')||keys.has('ArrowUp'))movement.add(forward);if(keys.has('s')||keys.has('ArrowDown'))movement.sub(forward);if(keys.has('a')||keys.has('ArrowLeft'))movement.sub(right);if(keys.has('d')||keys.has('ArrowRight'))movement.add(right);
  if(keys.has('q')||keys.has('e')){camera.position.y=THREE.MathUtils.clamp(camera.position.y+(keys.has('e')?speed:-speed),-9.2,45);freeAltitude=true;}
  if(movement.lengthSq()){movement.normalize().multiplyScalar(speed);if(freeAltitude)camera.position.add(movement);else camera.position.copy(navigator.move(camera.position,movement));}
  if(freeAltitude&&!keys.has('q')&&!keys.has('e')){const floorY=LEVELS[levelAt(camera.position.y)]+1.7;if(Math.abs(camera.position.y-floorY)<.13&&navigator.clear(camera.position.x,camera.position.z,levelAt(camera.position.y))){camera.position.y=floorY;freeAltitude=false;}}
}
function applyJourneyPose(pose,dt,immediate=false){
  if(!pose)return;camera.position.copy(pose.position);const d=pose.look.clone().sub(pose.position).normalize(),yaw=Math.atan2(-d.x,-d.z),pitch=Math.asin(THREE.MathUtils.clamp(d.y,-.95,.95));
  if(immediate){baseYaw=yaw;basePitch=pitch;}else{const delta=THREE.MathUtils.euclideanModulo(yaw-baseYaw+Math.PI,Math.PI*2)-Math.PI;const ease=1-Math.exp(-dt*1.9),step=THREE.MathUtils.clamp(delta*ease,-dt*.62,dt*.62);baseYaw+=step;basePitch+=(pitch-basePitch)*ease;}
  camera.rotation.order='YXZ';camera.rotation.set(THREE.MathUtils.clamp(basePitch+tourPitch,-1.35,1.35),baseYaw+tourYaw+(pose.kind==='walk'&&!reducedMotion?Math.sin(performance.now()/6800)*.065:0),0);lastPose=pose;
}
function startTour(destination=null){
  stopJourney();walkUI(false);transition=null;controls.enabled=false;
  const budget=THREE.MathUtils.clamp(Number($('budget-custom').value)||0,0,1000000);let start=camera.position.clone();try{navigator.closest(start,levelAt(start.y));}catch{start.set(0,1.7,-14);}
  try{tour.start(destination?{start,destination}:{budget});}catch(err){controls.enabled=true;notice('此位置暂时无法生成路线，请从庭院开始。');console.error(err);return;}tourYaw=tourPitch=0;
  document.body.classList.add('immersive');document.body.classList.remove('menu-open');$('tour-panel').hidden=false;$('tour-start').textContent='重新逛街';$('tour-pause').textContent='暂停';$('tour-pause').disabled=false;$('tour-time').textContent='约 '+Math.ceil(tour.itinerary.duration/60)+' 分钟 · 拖动可环顾';
  $('view-title').textContent=destination?'自动寻路 · '+LOCATIONS[destination].title:'第一人称 · 预算逛街';$('view-description').textContent='1F 购物 → 2F 试衣 → 3F 用餐 → 4F 娱乐 → RF 航空站';$('tour-bag').textContent=destination?'按实际通路步行，可拖动环顾':'预算 ¥'+budget+' · 模拟购物袋';
  applyJourneyPose(tour.tick(0),0,true);renderer.domElement.focus();
}
function updateTourUI(pose){
  $('tour-activity').textContent=pose.label;$('tour-progress').value=pose.progress;$('tour-step').textContent=pose.step+' / '+pose.steps;
  $('tour-bag').textContent=pose.budget===null?'到达后自动切换为自由行走':('剩余 ¥'+pose.balance+' / ¥'+pose.budget+' · '+(pose.bag.length?pose.bag.map(i=>i.item).join('、'):'看看店铺，慢慢挑选'));
  $('checkout-card').hidden=!pose.checkout;if(pose.checkout){const c=pose.checkout;$('checkout-item').textContent=c.item;$('checkout-price').textContent='¥'+c.price;$('checkout-balance').textContent='余额 ¥'+c.before+' → ¥'+c.after;$('checkout-state').textContent=c.paid?'已扣除模拟预算 · 即将继续行程':'商品确认 · 正在模拟结账';}
  $('time-card').hidden=!pose.clock;if(pose.clock){const c=pose.clock;$('time-value').textContent=String(Math.floor(c.seconds/60)).padStart(2,'0')+':'+String(c.seconds%60).padStart(2,'0');$('time-ring').style.setProperty('--turn',c.progress*360+'deg');}
}
function beginLift(){
  stopJourney();transition=null;const from=levelAt(camera.position.y),to=Number($('lift-floor').value),lift=model.atrium.lift;
  let start=camera.position.clone();if(['front','aerial'].includes(currentView)&&!walk){start.set(0,1.7,-12);}
  const f=levelAt(start.y);let path;try{path=navigator.plan(start,{x:lift.x,z:lift.z-2.85},f);}catch{notice('请先选择店铺或中庭位置，再乘坐电梯。');return;}
  walkUI(false);controls.enabled=false;tourYaw=tourPitch=0;const distances=[0];for(let i=1;i<path.length;i++)distances.push(distances.at(-1)+path[i].distanceTo(path[i-1]));
  document.body.classList.add('immersive');document.body.classList.remove('menu-open');$('ride-status').hidden=false;ride={from:f,to,path,distances,length:distances.at(-1),elapsed:0,journey:null};captureLook();baseYaw=lookYaw;basePitch=lookPitch;
  $('view-title').textContent='观光电梯 · '+(to>=5?'B'+(to-4):to===4?'RF':to+1+'F');$('view-description').textContent='前往候梯区 · 途中和乘梯时都可拖动环顾';renderer.domElement.focus();
}
function tickRide(dt){
  let pose;
  if(!ride.journey){ride.elapsed+=dt;const distance=Math.min(ride.length,ride.elapsed*3.5);let i=1;while(i<ride.path.length-1&&ride.distances[i]<distance)i++;const a=ride.path[Math.max(0,i-1)],b=ride.path[Math.min(i,ride.path.length-1)];const position=a.clone().lerp(b,(distance-ride.distances[i-1])/(ride.distances[i]-ride.distances[i-1]||1));pose={position,look:position.clone().add(b.clone().sub(a).normalize()),label:'沿回廊前往候梯区'};if(distance>=ride.length)ride.journey=createLiftJourney(model.atrium.lift,ride.from,ride.to);
  }else pose=ride.journey.tick(dt);
  applyJourneyPose(pose,dt);$('ride-status-label').textContent=pose.label;$('view-description').textContent=pose.label+' · 拖动环顾';
  if(pose.done){$('ride-status').hidden=true;ride=null;currentView='atrium';captureLook();walkUI(true);renderer.domElement.focus();notice('已到达，可直接自由行走。');}
}
function beginDrive(){
  const floor=levelAt(camera.position.y),route=model.parking.driveRoutes.find(r=>r.floor===floor);if(!route)return;
  stopJourney();walkUI(false);transition=null;controls.enabled=false;document.body.classList.add('immersive');drive={route,distance:0};
  $('ride-status').hidden=false;$('ride-status-label').textContent='驾驶视角 · 沿车道驶向停车场出口';$('view-title').textContent='停车场 · 驶向出口';
  tourYaw=tourPitch=0;const p=route.points[0];applyJourneyPose({position:p,look:route.points[5]},0,true);renderer.domElement.focus();
}
function tickDrive(dt){
  drive.distance=Math.min(drive.route.length,drive.distance+dt*5.8);const p=drive.distance/drive.route.length*(drive.route.points.length-1),i=Math.floor(p),points=drive.route.points;
  const position=points[i].clone().lerp(points[Math.min(i+1,points.length-1)],p-i),look=points[Math.min(i+15,points.length-1)].clone();if(position.distanceTo(look)<.1)look.x+=3;
  applyJourneyPose({position,look,kind:'drive'},dt);$('ride-status-label').textContent='沿车道驶向出口 · 约 21 km/h · 可拖动环顾';
  if(drive.distance>=drive.route.length){const floor=drive.route.floor;drive=null;camera.position.y=LEVELS[floor]+1.7;captureLook();walkUI(true);freeAltitude=false;$('ride-status').hidden=true;notice('已到达停车场出口通道，外侧道路暂未构建。');}
}
$('drive-parking').addEventListener('click',beginDrive);
$('cinema-toggle').addEventListener('click',()=>{const c=model.runtime.rooms.find(r=>r.cinema)?.cinema;if(c)c.mode=c.level>.4?'watch':'entry';});
function setMenu(open){document.body.classList.toggle('menu-open',open);$('menu-toggle').setAttribute('aria-expanded',String(open));}
$('menu-toggle').addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
$('menu-close').addEventListener('click',()=>setMenu(false));
$('menu-references').addEventListener('click',()=>{$('reference-dialog').showModal();});
$('walk').setAttribute('aria-label','自由行走');
$('leave-walk').addEventListener('click',()=>setWalk(false));
$('store-view').addEventListener('change',e=>{$('navigate-destination').disabled=!e.target.value;$('preview-destination').disabled=!e.target.value;});
$('navigate-destination').addEventListener('click',()=>startTour($('store-view').value));
$('preview-destination').addEventListener('click',()=>setView($('store-view').value));
$('custom-navigation').addEventListener('click',()=>{setMenu(true);$('store-view').focus();$('floor-panel').classList.add('highlight');setTimeout(()=>$('floor-panel').classList.remove('highlight'),1800);notice('选择楼层与目的地，再点击“走过去”。');});
$('drone-express').addEventListener('click',()=>startTour('drone'));
$('budget').addEventListener('change',e=>{$('budget-custom').value=e.target.value;});
$('ride-lift').addEventListener('click',beginLift);$('ride-cancel').addEventListener('click',()=>setWalk(true));
$('tour-start').addEventListener('click',()=>startTour());
$('tour-pause').addEventListener('click',()=>{if(!tour.active)return;$('tour-pause').textContent=tour.pause()?'继续':'暂停';});
$('tour-stop').addEventListener('click',()=>setWalk(true));
$('people').addEventListener('change',e=>shoppers.group.visible=e.target.checked);
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
renderer.domElement.addEventListener('pointerdown',e=>{transition=null;if(walk||tour.active||ride||drive){drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.x)*.0035,dy=(e.clientY-drag.y)*.003;if(walk){lookYaw-=dx;lookPitch=THREE.MathUtils.clamp(lookPitch-dy,-1.35,1.35);}else if(tour.active||ride||drive){tourYaw-=dx;tourPitch=THREE.MathUtils.clamp(tourPitch-dy,-1.1,1.1);if(tour.paused&&lastPose)applyJourneyPose(lastPose,0);}drag={x:e.clientX,y:e.clientY};});
const endDrag=()=>drag=null;renderer.domElement.addEventListener('pointerup',endDrag);renderer.domElement.addEventListener('pointercancel',endDrag);
renderer.domElement.addEventListener('wheel',()=>transition=null,{passive:true});
window.addEventListener('keydown',e=>{if($('reference-dialog').open||['INPUT','BUTTON','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(walk&&['w','a','s','d','q','e','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift'].includes(key)){keys.add(key);e.preventDefault();}if(e.key==='Escape'){if(tour.active||ride||drive)setWalk(true);else if(walk)setWalk(false);}});
window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{keys.clear();drag=null;});
const stepKeys={forward:'w',back:'s',left:'a',right:'d'};document.querySelectorAll('[data-step]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(stepKeys[b.dataset.step]);b.setPointerCapture(e.pointerId);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(stepKeys[b.dataset.step]));});
function sizeRenderer(){camera.aspect=innerWidth/innerHeight;camera.fov=isMobile?(innerWidth<innerHeight?66:58):44;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,pixelScale));renderer.setSize(innerWidth,innerHeight);composer.setPixelRatio(Math.min(devicePixelRatio,pixelScale));composer.setSize(innerWidth,innerHeight);}
function applyQuality(level){qualityLevel=level;pixelScale=level==='low'?(isMobile?.85:.9):level==='high'?1.35:(isMobile?1:1.15);performanceModel.setQuality(level);composer.ambientOcclusion.enabled=level==='high';const shadow=level==='high'?2048:level==='low'?1024:1536;sun.shadow.mapSize.set(shadow,shadow);sun.shadow.map?.dispose();sun.shadow.map=null;renderer.shadowMap.needsUpdate=true;sizeRenderer();$('quality-status').textContent=qualityChoice==='auto'?(level==='low'?'自动 · 流畅优先':'自动 · 均衡画质'):(level==='low'?'流畅优先':level==='high'?'清晰画质':'均衡画质');}
$('quality').addEventListener('change',e=>{qualityChoice=e.target.value;slowFrames=0;applyQuality(qualityChoice==='auto'?(isMobile?'low':'balanced'):qualityChoice);});
window.addEventListener('resize',()=>{sizeRenderer();if(!walk&&!tour.active&&!ride&&!drive&&['front','aerial','roof'].includes(currentView)){const p=viewPosition(currentView);camera.position.copy(p.eye);controls.target.copy(p.target);controls.update();}});
$('landscape').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('experience').requestFullscreen?.();await screen.orientation?.lock?.('landscape');}catch{notice('请旋转手机，横竖屏都会自动适配。');}});
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();keys.clear();});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();notice('图形连接已暂停，正在尝试恢复。');});renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
if(isMobile){document.querySelector('.material-panel').classList.add('collapsed');$('panel-toggle').textContent='+';$('panel-toggle').setAttribute('aria-expanded','false');$('gesture-hint').textContent='单指旋转 · 双指缩放 / 平移';}
setView(LOCATIONS[location.hash.slice(1)]?location.hash.slice(1):'front',true);setLight('day');applyQuality(qualityLevel);
function animate(time){
  if(document.hidden){lastTime=time;requestAnimationFrame(animate);return;}
  const frameMs=time-lastTime;frameAverage=frameAverage*.97+Math.min(frameMs,200)*.03;frameCount++;
  if(qualityChoice==='auto'&&frameCount>180){slowFrames=frameAverage>36?slowFrames+1:Math.max(0,slowFrames-2);if(slowFrames>90&&qualityLevel!=='low'){applyQuality('low');slowFrames=0;}if(slowFrames>240&&pixelScale>.7){pixelScale=.7;sizeRenderer();slowFrames=0;}}
  if(performanceModel.tick(camera,time/1000))renderer.shadowMap.needsUpdate=true;
  const underground=camera.position.y<-.6;scene.fog=underground?null:outdoorFog;for(const l of model.parking.lights)l.visible=underground&&Math.abs(l.position.y-camera.position.y)<2.3;
  const dt=Math.min((time-lastTime)/1000,.15);lastTime=time;
  if(!$('reference-dialog').open){if(transition){const t=THREE.MathUtils.clamp((time-transition.start)/1700,0,1);const ease=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,ease);if(t===1)transition=null;}
    if(tour.active){const pose=tour.tick(dt,Number($('tour-speed').value));if(pose){applyJourneyPose(pose,dt);updateTourUI(pose);if(pose.done){$('tour-pause').disabled=true;$('tour-time').textContent='本次逛街已完成 · 全部为模拟体验';captureLook();currentView='courtyard';walkUI(true);$('checkout-card').hidden=$('time-card').hidden=true;freeAltitude=false;renderer.domElement.focus();$('view-title').textContent=tour.itinerary.destination?'已到达 · '+LOCATIONS[tour.itinerary.destination].title:'逛街完成';}}}
    else if(ride)tickRide(dt);else if(drive)tickDrive(dt);else if(walk)stepWalk(dt);else controls.update();
    model.update(dt,time/1000,camera,interiorOn);
    const cinema=model.runtime.rooms.find(r=>r.cinema)?.cinema;$('cinema-toggle').hidden=!cinema?.inside||!!drive;$('cinema-toggle').textContent=cinema?.level>.4?'开始放映 · 关闭顶灯':'打开入场顶灯';
    const lamps=cinema?.inside?cinema.halls.flatMap(h=>h.lights).filter(l=>l.visible):[];
    for(let i=0;i<retailLights.length;i++){const l=retailLights[i];l.userData.home??=l.position.clone();if(cinema?.inside){if(lamps[i])l.position.copy(lamps[i].position);l.intensity=interiorOn?(lamps[i]?.intensity||0):0;}else{l.position.copy(l.userData.home);l.intensity=interiorOn?38*(lightMode==='day'?.65:1):0;}}
    $('drive-parking').hidden=!underground||tour.active||!!ride||!!drive;
    shoppers.tick(dt,time/1000,camera);weather.tick(dt,time/1000);renderer.info.reset();composer.render(dt);}
  requestAnimationFrame(animate);
}
model.update(0,0,camera,true);performanceModel.tick(camera,0,true);renderer.compile(scene,camera);composer.render();$('loading').classList.add('done');setTimeout(()=>$('loading').hidden=true,700);requestAnimationFrame(animate);
// Expose only a compact scene summary, useful for troubleshooting a user report.
window.riversideScene={stats:model.stats,threeVersion:THREE.REVISION,materialMaps:surfaces.loaded,get performance(){return {device:isMobile?'mobile':'desktop',quality:qualityLevel,pixelRatio:renderer.getPixelRatio(),fps:Math.round(1000/frameAverage),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,lod:performanceModel.summary};},contactShadows:true,skyLightPaths:weather.lightPaths,get state(){return {view:currentView,walk,touring:tour.active,paused:tour.paused,step:tour.index,bag:tour.bag,balance:tour.balance,destination:tour.itinerary?.destination,position:camera.position.toArray(),rotation:[camera.rotation.x,camera.rotation.y],liftFloor:model.atrium.lift.dockFloor,liftOpen:model.atrium.lift.open,ride:!!ride,driving:!!drive,cinema:model.runtime.rooms.find(r=>r.cinema)?.cinema?{level:model.runtime.rooms.find(r=>r.cinema).cinema.level,inside:model.runtime.rooms.find(r=>r.cinema).cinema.inside}:null,doors:model.runtime.doors.map(d=>d.open),peopleVisible:shoppers.group.visible};}};
