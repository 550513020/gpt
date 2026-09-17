import * as THREE from './vendor/three.module.js';

export function buildExpressLift(api){
  const {root,glassGroup,box,mats:M,glazing,balustrade,label,runtime}=api;
  const x=-30,z=22,floors=[0,4.65,9.3,13.95,18.68,-4.2,-8.4],doors=[],landingDoors=[],walkables=[],obstacles=[];
  const doorGlass=glazing.clone();doorGlass.color.set('#459d91');doorGlass.transmission=.91;doorGlass.attenuationColor.set('#479f93');doorGlass.attenuationDistance=1.8;
  for(const y of floors){
    box(M.marble,-27.5,y-.14,19.15,7,.28,3.15);walkables.push({x:-27.5,z:19.15,w:7,d:3.15,y});
    for(const zz of [17.6,20.7]){const pane=new THREE.Mesh(new THREE.PlaneGeometry(5.5,1.05),balustrade);pane.position.set(-26.5,y+.55,zz);glassGroup.add(pane);}
    box(M.bronze,x,y+2.5,z-1.35,2.35,.1,.16);for(const dx of [-1.14,1.14])box(M.bronze,x+dx,y+1.25,z-1.35,.08,2.5,.16);
    const pair=[];for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.88,2.4),doorGlass);m.position.set(x+side*(y===0?1.22:.44),y+1.27,z-1.37);glassGroup.add(m);pair.push(m);}landingDoors.push(pair);
    label(y<0?'B'+Math.round(-y/4.2)+' · 商场 / 微空港 ↑':'微空港快线 · RF ↑',-28,y+2.7,17.55,3.6,Math.PI,'#244b49','#fae2a7');
  }
  for(const dx of [-1.35,1.35])for(const dz of [-1.35,1.35])box(M.bronze,x+dx,6.75,z+dz,.1,30.3,.1);
  for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.65,30.1),glazing);m.position.set(x+side*1.3,6.7,z);m.rotation.y=Math.PI/2;glassGroup.add(m);}
  const back=new THREE.Mesh(new THREE.PlaneGeometry(2.65,30.1),glazing);back.position.set(x,6.7,z+1.3);glassGroup.add(back);box(M.teal,x,21.85,z,2.9,.2,2.9);
  const cabin=new THREE.Group(),cabinGlass=new THREE.Group();cabin.position.set(x,.04,z);cabinGlass.position.copy(cabin.position);root.add(cabin);glassGroup.add(cabinGlass);
  const cb=(mat,xx,yy,zz,w,h,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(xx,yy,zz);cabin.add(m);};
  cb(M.marble,0,.03,0,2.45,.1,2.4);cb(M.wood,0,2.7,0,2.45,.12,2.4);cb(M.whiteGlow,0,2.61,0,1.8,.02,.6);
  for(const side of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.6),glazing);m.position.set(side*1.2,1.33,0);m.rotation.y=Math.PI/2;cabinGlass.add(m);cb(M.bronze,side*1.13,1.05,0,.03,.03,2.1);}
  const rear=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.6),glazing);rear.position.set(0,1.33,1.2);cabinGlass.add(rear);
  for(const side of [-1,1]){const d=new THREE.Mesh(new THREE.PlaneGeometry(.88,2.4),doorGlass);d.position.set(side*1.22,1.27,-1.22);cabinGlass.add(d);doors.push(d);}
  cb(M.darkMetal,1.17,1.4,-.8,.035,.6,.25);for(let i=0;i<7;i++)cb(M.warmGlow,1.143,1.59-i*.1,-.8,.01,.045,.045);
  return {x,z,floors,cabin,cabinGlass,doors,landingDoors,doorGlass,open:1,dockFloor:0,fast:true,walkables,obstacles};
}
