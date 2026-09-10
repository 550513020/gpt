import * as THREE from './vendor/three.module.js';
import { Reflector } from './vendor/Reflector.js';

let renderingMirror=false;
export function createRetailDetails(api,room){
  const {root,glassGroup,box,slab,inst,sphere,mats:M,vitrine,unitCylinder:C,label,runtime}=api;
  const {cx,base,cz,w,d,spec}=room;
  const cover=(x,y,z,width,height,depth)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),vitrine);
    mesh.position.set(x,y+height/2,z);glassGroup.add(mesh);
    for(const dx of [-width/2,width/2])for(const dz of [-depth/2,depth/2])box(M.bronze,x+dx,y+height/2,z+dz,.018,height,.018);
    box(M.bronze,x,y+.09,z-depth/2-.012,.09,.1,.025);sphere(M.black,x,y+.09,z-depth/2-.029,.014);
    room.secureCases.push({x,z,y,width,height,depth});return mesh;
  };
  function spotlight(x,z,targetX,targetY,targetZ){
    box(M.darkMetal,x,base+3.86,z,.28,.13,.28);
    const light=new THREE.SpotLight('#ffe3b6',0,5.5,.36,.7,2);light.position.set(x,base+3.76,z);light.target.position.set(targetX,targetY,targetZ);light.castShadow=false;root.add(light,light.target);
    const start=light.position,end=light.target.position,delta=end.clone().sub(start),length=delta.length();
    const cone=new THREE.Mesh(new THREE.ConeGeometry(Math.tan(.26)*length,length,18,1,true),new THREE.MeshBasicMaterial({color:'#ffe9be',transparent:true,opacity:.035,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    cone.position.copy(start).add(end).multiplyScalar(.5);cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),delta.normalize());cone.userData.excludeAO=true;root.add(cone);
    runtime.spots.push({light,cone,room,power:32});room.spotlights.push(light);
  }
  function mirror(x,z){
    const width=1.35,height=2.35;
    box(M.bronze,x,base+1.47,z+.025,width+.12,height+.12,.1);
    const mesh=new Reflector(new THREE.PlaneGeometry(width,height),{color:0xddddda,textureWidth:384,textureHeight:640,clipBias:.003});mesh.position.set(x,base+1.47,z-.038);mesh.rotation.y=Math.PI;mesh.userData.excludeAO=true;
    const render=mesh.onBeforeRender;let lastRender=-Infinity;
    mesh.onBeforeRender=(renderer,scene,camera,...rest)=>{const now=performance.now();if(renderingMirror||scene.overrideMaterial||camera.position.distanceTo(mesh.position)>18||now-lastRender<120)return;renderingMirror=true;try{render(renderer,scene,camera,...rest);lastRender=now;}finally{renderingMirror=false;}};
    root.add(mesh);room.mirrors.push({mesh,width,height});
  }
  function checkout(){
    // Counter is deliberately beside the entrance, leaving a 2.8 m door throat.
    const side=cx<0?-1:1,x=cx+side*(w/2-2.55),z=cz-d/2+1.05;
    slab(M.walnut,x,base+.18,z,2.3,1.03,.1,.91);box(M.marble,x,base+1.13,z,2.38,.07,1.09);
    box(M.darkMetal,x-.35,base+1.29,z,.09,.27,.09);box(M.black,x-.35,base+1.48,z,.5,.34,.045);
    box(M.teal,x-.35,base+1.48,z-.027,.43,.26,.008);box(M.black,x+.55,base+1.21,z-.2,.22,.075,.28);
    box(M.ivory,x+.76,base+1.2,z+.15,.25,.09,.2);label('收银 · CASHIER',x,base+.78,z-.536,1.8,Math.PI,spec.accent,'#fff0d1');
    room.checkout={x,z,width:2.4,depth:1.1,queue:{x:x-side*2,z}};
    return room.checkout;
  }
  function fitting(){
    const back=cz+d/2-1;
    for(const dx of [-3.1,3.1]){
      const x=cx+dx,z=back-1.15;
      for(const side of [-1,1])box(M.walnut,x+side*1.02,base+1.52,z,.1,2.75,2.2);
      box(M.walnut,x,base+2.9,z-1.08,2.1,.12,.12);
      for(let i=0;i<8;i++){
        const xx=x-.97+i*.058;inst(C,M.ivory,xx,base+1.62,z-1.06,.055,2.5,.055);
      }
      box(M.ivory,x+.55,base+.5,z+.55,.65,.2,.43);
      mirror(x,back-.1);label('试衣间',x,base+3.13,z-1.1,1.35,Math.PI,spec.accent,'#fff0d1');
      room.fittingRooms.push({x,z,width:2,depth:2.2,opening:1.5});
    }
    mirror(cx,back-.13);
  }
  return {cover,spotlight,mirror,checkout,fitting};
}

export function addAutomaticDoor(api,room){
  const {root,glassGroup,mats:M,glazing,runtime,box,sphere}=api;
  const {cx,base,cz,d}=room,x=cx,z=cz-d/2-.16,width=2.8;
  box(M.darkMetal,x,base+3.1,z,width*2+.18,.2,.21);
  box(M.black,x,base+3.22,z-.13,.21,.085,.09);sphere(M.coral,x+.046,base+3.225,z-.181,.017);
  const panels=[];
  for(const side of [-1,1]){
    const panel=new THREE.Group();const pane=new THREE.Mesh(new THREE.BoxGeometry(width/2,2.78,.024),glazing);pane.position.y=base+1.64;panel.add(pane);
    // Slim edge and anti-collision markings; no pull handle geometry.
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(width/2-.12,.035,.028),new THREE.MeshBasicMaterial({color:'#cbd9d3',transparent:true,opacity:.45}));stripe.position.y=base+1.48;panel.add(stripe);
    panel.position.set(x+side*width/4,0,z);glassGroup.add(panel);panels.push(panel);
  }
  const door={x,z,base,width,panels,open:0,hold:0,hasHandles:false,sensorRange:4.7};
  room.door=door;runtime.doors.push(door);return door;
}

export function updateRetail(runtime,dt,time,camera,interiorOn){
  for(const door of runtime.doors){
    const near=Math.abs(camera.position.y-door.base-1.7)<1.5&&Math.abs(camera.position.x-door.x)<3.5&&Math.abs(camera.position.z-door.z)<door.sensorRange;
    door.hold=near?1.7:Math.max(0,door.hold-dt);
    door.open=THREE.MathUtils.damp(door.open,door.hold>0?1:0,5.8,dt);
    door.panels.forEach((p,i)=>p.position.x=door.x+(i?1:-1)*(door.width/4+door.open*1.43));
  }
  // Four real ceiling spots follow the nearest boutique; all other fixtures remain visible.
  const nearest=runtime.spots.filter(s=>Math.abs(camera.position.y-s.room.base-1.8)<4).sort((a,b)=>a.light.position.distanceToSquared(camera.position)-b.light.position.distanceToSquared(camera.position)).slice(0,4);
  for(const s of runtime.spots){const on=interiorOn&&nearest.includes(s)&&s.light.position.distanceTo(camera.position)<24;s.light.intensity=on?s.power:0;s.light.visible=on;s.cone.visible=on;}
  for(const update of runtime.updates)update(dt,time);
}
