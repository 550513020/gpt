import * as THREE from './vendor/three.module.js';
import {vehicleRampHeight} from './parking.js?v=15';

export function buildStreetConnection(api,parking){
  const {box,inst,tube,label,root,mats:M,unitCylinder:C,runtime}=api;
  const asphalt=new THREE.MeshStandardMaterial({color:'#414c51',roughness:.96}),line=new THREE.MeshBasicMaterial({color:'#ddd9bd'}),curb=new THREE.MeshStandardMaterial({color:'#c0beb3',roughness:.93});
  // Broad avenue well in front of the mall and an east-side cross street.
  box(asphalt,0,-.11,-42,142,.16,12);box(asphalt,56,-.11,12,12,.16,108);box(asphalt,44,-.065,-28,7,.07,16);
  for(const z of [-48.3,-35.7])for(const [a,b] of z<-40?[[-71,49.5],[62.5,71]]:[[-71,40.4],[47.6,49.5],[62.5,71]]){box(curb,(a+b)/2,-.04,z,b-a,.22,.42);box(M.stone,(a+b)/2,-.14,z+(z<-40?-1.9:1.9),b-a,.15,3.5);}
  for(const x of [49.7,62.3])box(curb,x,-.04,18,.42,.22,96);
  for(let x=-68;x<69;x+=3.4)if(x<49||x>63)for(const z of [-42.13,-41.87])box(M.gold,x,-.015,z,1.8,.012,.065,0,false);
  for(let z=-33;z<65;z+=3.4)for(const x of [55.88,56.12])box(M.gold,x,-.015,z,.06,.012,1.8,0,false);
  for(let z=-33;z<-20;z+=2)box(line,44,-.018,z,.08,.012,1.0,0,false);
  // Crossing sits left of the parking access. Signals face the approaching lanes.
  for(let z=-46.8;z<-36;z+=1.15)box(line,5,-.012,z,4.6,.016,.58,0,false);
  for(const x of [1.4,8.6])box(line,x,-.012,-42,.25,.016,11,0,false);
  const signalMats=[];
  for(const [x,z,ry] of [[.4,-35.4,Math.PI/2],[9.6,-48.6,-Math.PI/2],[49.1,-34.7,Math.PI],[63,-48.6,0]]){
    box(M.darkMetal,x,2.25,z,.11,4.5,.11);const g=new THREE.Group();g.position.set(x,4.0,z);g.rotation.y=ry;root.add(g);
    const body=new THREE.Mesh(new THREE.BoxGeometry(.43,1.16,.27),M.darkMetal);g.add(body);
    for(let k=0;k<3;k++){const m=new THREE.MeshBasicMaterial({color:['#fa382c','#493d13','#123725'][k]}),lamp=new THREE.Mesh(new THREE.CircleGeometry(.132,12),m);lamp.position.set(0,.36-k*.36,.143);g.add(lamp);signalMats.push({m,k,phase:x>40?1:0});}
  }
  runtime.updates.push((dt,t)=>{const phase=Math.floor(t/14)%2;for(const {m,k,phase:p}of signalMats)m.color.set(k===0?(phase===p?'#fa382c':'#43251f'):k===2?(phase!==p?'#4ad080':'#153126'):'#493d13');});
  for(const x of [-42,-16,22,66]){box(M.darkMetal,x,3.6,-33,.11,7.2,.11);box(M.darkMetal,x+.65,7.16,-33,1.4,.11,.14);box(M.whiteGlow,x+1.25,7.08,-33,.7,.055,.24,0,false);}
  label('停车出口 → 城市道路',43.8,2.6,-29,5.7,0,'#315452','#fff5dd');
  label('水岸庭院  /  RIVERSIDE',-22,1.5,-33,12,Math.PI,'#315452','#fff5dd');
  parking.street={groundY:0,avenueZ:-42,sideRoadX:56,trafficSignals:4,crossing:true};
  // Flat turnout pads join each basement to the sloping vehicle ramp without
  // a lip. Their outer triangular strip tapers into the rising roadway.
  for(const route of parking.driveRoutes){
    const z=route.exitZ,y=route.floor===5?-4.2:-8.4;
    const curve=new THREE.CurvePath(),v=(x,yy,zz)=>new THREE.Vector3(x,yy+1.13,zz),r=3.6;
    const turn=new THREE.QuadraticBezierCurve3(v(40,y,z),v(44,y,z),v(44,vehicleRampHeight(z-r),z-r));
    const turnPoints=turn.getPoints(40);for(const p of turnPoints)p.y=vehicleRampHeight(p.z)+1.13;
    for(let i=1;i<turnPoints.length;i++)curve.add(new THREE.LineCurve3(turnPoints[i-1],turnPoints[i]));
    let last=turnPoints.at(-1);for(const zz of [15,9,-20])if(zz<last.z){const next=v(44,vehicleRampHeight(zz),zz);curve.add(new THREE.LineCurve3(last,next));last=next;}
    curve.add(new THREE.LineCurve3(v(44,0,-20),v(44,0,-35.5)));
    curve.add(new THREE.QuadraticBezierCurve3(v(44,0,-35.5),v(44,0,-39),v(40.5,0,-39)));
    curve.add(new THREE.LineCurve3(v(40.5,0,-39),v(16,0,-39)));
    // Resample the whole joined route by distance to keep driving speed uniform.
    const all=new THREE.CurvePath();for(let i=1;i<route.points.length;i++)all.add(new THREE.LineCurve3(route.points[i-1],route.points[i]));for(const c of curve.curves)all.add(c);
    route.points=all.getSpacedPoints(Math.ceil(all.getLength()*6));route.length=all.getLength();route.endFloor=0;route.reachesStreet=true;
  }
}
