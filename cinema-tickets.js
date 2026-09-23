import * as THREE from './vendor/three.module.js';

export function buildCinemaTickets(api,room){
  const {box,slab,root,mats:M,label,runtime}=api,{base:y,cx,cz}=room;
  const x=cx-6.4,z=cz-6.85;
  // The left foyer is reception; the existing right-hand snack counter stays intact.
  slab(M.walnut,x,y+.12,z,3.15,.85,.16,.84);box(M.marble,x,y+1.02,z,3.3,.12,.98);
  room.blockers.push({x,z,w:3.3,d:.98});
  box(M.bronze,x-.55,y+1.17,z,.055,.24,.055);box(M.black,x-.55,y+1.42,z,.65,.37,.07);
  box(M.teal,x-.55,y+1.42,z+.042,.55,.27,.015);
  box(M.ivory,x+.75,y+1.17,z,.37,.24,.28);box(M.black,x+.75,y+1.26,z+.145,.27,.024,.01);
  box(M.ivory,x+.75,y+1.13,z+.25,.21,.008,.23);label('光幕影院 · 售票 / 咨询',x,y+.63,z+.5,2.8,0,'#514647','#ecd8b4');
  label('TICKETS · 取票服务',x,y+2.18,z-.48,2.8,0,'#55494c','#efdfbf');
  const gates=[];
  for(const side of [-1,1]){
    const gx=cx+side*4.35,gz=cz-5.3,flaps=[];
    for(const edge of [-1,1]){
      const px=gx+edge*.72;box(M.darkMetal,px,y+.52,gz,.16,.96,.58);box(M.bronze,px,y+1.015,gz,.19,.045,.59);
      box(M.black,px,y+1.05,gz-.16,.13,.06,.15);box(M.whiteGlow,px,y+1.086,gz-.16,.08,.009,.09,0,false);
      room.blockers.push({x:px,z:gz,w:.16,d:.58});
      const hinge=new THREE.Group();hinge.position.set(px-edge*.08,y+.64,gz);root.add(hinge);
      const flap=new THREE.Mesh(new THREE.BoxGeometry(.46,.4,.024),new THREE.MeshPhysicalMaterial({color:'#78aea6',transparent:true,opacity:.42,roughness:.16,metalness:.18}));flap.position.x=-edge*.23;hinge.add(flap);flaps.push({hinge,edge});
    }
    label((side<0?'A':'B')+' 厅 · 扫码检票',gx,y+2.25,gz-.14,2.05,Math.PI,'#40534c','#eee0bf');
    gates.push({x:gx,z:gz,clearWidth:1.28,open:0,flaps});
  }
  runtime.updates.push((dt,time,camera)=>{
    for(const gate of gates){const p=camera?.position,near=p&&Math.abs(p.y-y)<4&&Math.hypot(p.x-gate.x,p.z-gate.z)<3.5;gate.open=THREE.MathUtils.damp(gate.open,near?1:0,12,dt);for(const {hinge,edge} of gate.flaps)hinge.rotation.y=edge*gate.open*Math.PI/2;}
  });
  room.ticketing={desk:{x,z,queue:{x,z:z+.95}},gates};
}
