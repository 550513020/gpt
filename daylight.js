import * as THREE from './vendor/three.module.js';

// Static architectural occlusion: test each roof/overhang on the sunward ray.
export function sunAccess(rooms,point,direction){
  if(direction.y<=.02)return 0;
  for(const room of rooms){
    const roof=room.base+4.0,t=(roof-point.y)/direction.y;if(t<=.02)continue;
    const x=point.x+direction.x*t,z=point.z+direction.z*t;
    if(Math.abs(x-room.cx-Math.sign(room.cx)*1.3)<(room.w+7.4)/2&&Math.abs(z-room.cz)<(room.d+9.5)/2)return 0;
  }
  return 1;
}
export function daylightAt(room,x,z,rooms,direction){
  if(['cinema','ktv'].includes(room.spec.type))return 0;
  const setback=Math.max(0,Math.min(room.w/2-Math.abs(x-room.cx),room.d/2-Math.abs(z-room.cz)));
  // Diffuse sky reaches shaded glazing even where the projecting slab blocks sun.
  const sky=.16+.53*Math.exp(-setback/3.4);
  return Math.min(1,sky+sunAccess(rooms,{x,y:room.base+1.15,z},direction)*.4);
}
export function createDaylightBalance(model,lights){
  const rooms=model.runtime.rooms;let mode='day',enabled=true,direction=new THREE.Vector3(-.525,.669,-.525);
  function bake(){
    for(const r of rooms){let sum=0;for(const dx of [-.38,0,.38])for(const dz of [-.38,0,.38])sum+=daylightAt(r,r.cx+dx*r.w,r.cz+dz*r.d,rooms,direction);r.daylight=sum/9;r.lightingScale??=1;}
    for(const s of model.runtime.spots)s.daylight=daylightAt(s.room,s.light.target.position.x,s.light.target.position.z,rooms,direction);
  }
  bake();
  function target(daylight){return !enabled?0:mode==='day'?Math.max(.3,1-daylight*.9):mode==='rain'?1:.94;}
  return {set(next,on,sun){mode=next;enabled=on;if(sun&&!direction.equals(sun)){direction.copy(sun);bake();}},
    tick(dt,camera,cinema){
      const ease=1-Math.exp(-dt*2.4);
      for(const r of rooms)r.lightingScale=enabled?r.lightingScale+(target(r.daylight)-r.lightingScale)*ease:0;
      for(const s of model.runtime.spots){s.daylightScale??=1;s.daylightScale=enabled?s.daylightScale+(target(s.daylight)-s.daylightScale)*ease:0;}
      const scale=enabled?(mode==='day'?.48:mode==='rain'?1:.9):0;
      for(const [m,power] of [[model.mats.whiteGlow,1.1],[model.mats.warmGlow,1.6],[model.mats.wall,.1]])m.emissiveIntensity=enabled?m.emissiveIntensity+(power*scale-m.emissiveIntensity)*ease:0;
      if(cinema?.inside)return;
      // Reuse the same four light slots on the current floor; no new GPU lights.
      const floor=rooms.reduce((best,r)=>Math.abs(camera.position.y-r.base-1.7)<Math.abs(camera.position.y-best.base-1.7)?r:best,rooms[0]).base;
      const selected=rooms.filter(r=>r.base===floor);
      lights.forEach((light,i)=>{const r=selected[i];if(!r){light.intensity=0;return;}light.position.set(r.cx,r.base+3.5,r.cz);light.intensity=enabled?38*r.lightingScale:0;});
    },
    get summary(){return {mode,rooms:rooms.map(r=>({name:r.spec.name,base:r.base,daylight:+r.daylight.toFixed(3),scale:+r.lightingScale.toFixed(3)}))};}
  };
}
