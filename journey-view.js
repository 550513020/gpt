import * as THREE from './vendor/three.module.js';

export const angleDelta=(to,from)=>THREE.MathUtils.euclideanModulo(to-from+Math.PI,Math.PI*2)-Math.PI;
export const headingOf=(a,b)=>Math.atan2(a.x-b.x,a.z-b.z);
export function pointOnRoute(action,distance){
  const d=THREE.MathUtils.clamp(distance,0,action.length),ds=action.distances,ps=action.path;
  let lo=1,hi=ds.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(ds[mid]<d)lo=mid+1;else hi=mid;}
  return ps[lo-1].clone().lerp(ps[lo],(d-ds[lo-1])/(ds[lo]-ds[lo-1]||1));
}
// The heading field is baked once. It never follows a display, clock or receipt.
export function prepareRouteView(action){
  const count=Math.max(2,Math.ceil(action.length/.3)),headings=[];
  for(let i=0;i<=count;i++){
    const distance=action.length*i/count;
    let a=pointOnRoute(action,Math.max(0,distance-.35)),b=pointOnRoute(action,Math.min(action.length,distance+2.4));
    if(Math.hypot(b.x-a.x,b.z-a.z)<.12){a=pointOnRoute(action,Math.max(0,distance-.8));b=pointOnRoute(action,Math.min(action.length,distance+.25));}
    const yaw=headingOf(a,b);headings.push(i?headings[i-1]+angleDelta(yaw,headings[i-1]):yaw);
  }
  action.headings=headings;
}
export function routeHeading(action,distance=0){
  if(!action.headings)prepareRouteView(action);
  const v=THREE.MathUtils.clamp(distance/action.length,0,1)*(action.headings.length-1),i=Math.floor(v);
  return THREE.MathUtils.lerp(action.headings[i],action.headings[Math.min(i+1,action.headings.length-1)],v-i);
}
// Bound angular speed AND acceleration, including at stops and 180-degree turns.
export function createHeadingController(){
  let yaw=null,velocity=0;
  return {reset(value=null){yaw=value;velocity=0;},get yaw(){return yaw;},get velocity(){return velocity;},
    tick(target,dt){if(yaw===null){yaw=target;return yaw;}if(dt<=0)return yaw;
      let left=Math.min(dt,.25);while(left>1e-6){const h=Math.min(left,1/60),delta=angleDelta(target,yaw),accel=.9;
        const desired=Math.sign(delta)*Math.min(.65,Math.sqrt(2*accel*Math.abs(delta)),Math.abs(delta)*1.8);
        velocity+=THREE.MathUtils.clamp(desired-velocity,-accel*h,accel*h);yaw+=velocity*h;left-=h;
      }return yaw;
    }
  };
}
