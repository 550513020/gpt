import * as THREE from './vendor/three.module.js';

export function addVenueProps(api,room){
  const {box,inst,sphere,tube,root,glassGroup,mats:M,unitCylinder:C,unitTorus:T,label,runtime,vitrine}=api,{cx,cz,base,spec,w,d}=room;
  room.props=[];
  const mic=(x,y,z)=>{tube(new THREE.Vector3(x,y,z),new THREE.Vector3(x+.13,y+.055,z+.21),.024,M.black);sphere(M.bronze,x+.145,y+.061,z+.235,.049);box(M.teal,x+.035,y+.022,z+.065,.035,.013,.043);room.props.push('microphone');};
  const projector=(x,z)=>{box(M.bronze,x,base+3.68,z,.04,.42,.04);box(M.ivory,x,base+3.44,z,.62,.24,.48);sphere(M.black,x-.15,base+3.43,z+.245,.095,.075,.02);sphere(M.blue,x-.15,base+3.43,z+.269,.063,.052,.012);for(let i=0;i<6;i++)box(M.darkMetal,x+.12+i*.04,base+3.45,z-.247,.017,.1,.008);room.props.push('projector');};
  if(spec.type==='ktv')for(const side of [-1,1]){
    const x=cx+side*4.6;mic(x-.65,base+.7,cz+1.25);mic(x+.5,base+.7,cz+1.25);projector(x,cz-2);
    for(const dx of [-2.8,2.8]){box(M.black,x+dx,base+1.6,cz+d/2-1.5,.5,1.5,.42);for(const yy of [1.26,1.88])sphere(M.darkMetal,x+dx,base+yy,cz+d/2-1.72,.18,.18,.015);}
    box(M.black,x+.7,base+.79,cz+1.55,.53,.08,.36);label('点歌',x+.7,base+.83,cz+1.36,.4,Math.PI,'#223e48','#dbfaf5');
  }
  if(spec.type==='spa')for(const dx of [-4.4,4.4])for(const dz of [-1.8,3.3])for(const off of [-.6,.6]){
    const x=cx+dx+off,z=cz+dz-1.5;inst(T,M.bronze,x,base+.59,z,.3,.3,.3,Math.PI/2);
    const ripple=new THREE.Mesh(new THREE.RingGeometry(.08,.09,24),new THREE.MeshBasicMaterial({color:'#b5e6d8',transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false}));ripple.rotation.x=-Math.PI/2;ripple.position.set(x,base+.584,z);root.add(ripple);runtime.updates.push((dt,t)=>{const s=1+((t*.45+x)%1+1)%1*1.7;ripple.scale.setScalar(s);});
    room.props.push('warmFootbath');
  }
  if(spec.type==='cinema'){
    for(const side of [-1,1])projector(cx+side*4.35,cz-2);
    const x=cx-w/2+2.35,z=cz-d/2+1.05;
    box(M.coral,x,base+1.22,z,.79,.17,.58);box(M.coral,x,base+2.18,z,.86,.15,.64);
    const pane=new THREE.Mesh(new THREE.BoxGeometry(.75,.81,.54),vitrine);pane.position.set(x,base+1.71,z);glassGroup.add(pane);
    for(let j=0;j<60;j++)sphere(M.cream,x+Math.sin(j*2.4)*.31,base+1.4+Math.floor(j/12)*.025,z+Math.cos(j*2.4)*.2,.032);
    inst(C,M.bronze,x,base+1.97,z,.19,.16,.19);label('POPCORN',x,base+2.19,z-.33,.75,Math.PI,'#934735','#fff0cc');room.props.push('popcornMachine');
    const vx=cx+Math.min(8.05,w/2-1.25),vz=cz-5.4;box(M.coral,vx,base+1.21,vz,1.12,2.08,.83);room.blockers.push({x:vx,z:vz,w:1.12,d:.83});
    box(M.black,vx-.13,base+1.46,vz-.428,.68,1.35,.025);
    for(let row=0;row<4;row++)for(let j=0;j<3;j++){const xx=vx-.36+j*.23,yy=base+1.04+row*.3;inst(C,j%2?M.teal:M.coral,xx,yy,vz-.456,.066,.2,.066);inst(C,M.ivory,xx,yy+.103,vz-.456,.066,.006,.066);box(M.ivory,xx,yy,vz-.521,.09,.06,.005);}
    box(M.teal,vx+.39,base+1.52,vz-.427,.14,.28,.02);box(M.black,vx,base+.46,vz-.433,.61,.2,.04);label('COLA',vx,base+2.14,vz-.441,.72,Math.PI,'#934735','#fff0cc');room.props.push('colaVendingMachine');
  }
}

export function addMallServices(api){
  const {box,slab,inst,sphere,tube,glassGroup,root,mats:M,unitCylinder:C,unitTorus:T,balustrade,label,runtime}=api;
  const services={toilets:[],signs:[],walkables:[],blockers:[]};
  function sign(text,x,y,z,w=2.6,angle=Math.PI){label(text,x,y,z,w,angle,'#224b47','#f4ebcc');services.signs.push({text,x,y,z});}
  const names=['1F 珠宝 / 潮玩','2F 夏装 / 箱包','3F 火锅 / 日料 / 中餐 / 面包','4F 影院 / KTV / 足浴'];
  for(let f=0;f<4;f++){
    const y=f*4.65,x=-3.5,z=65.65;
    slab(M.stone,x,y-.14,z,8.4,5.5,.15,.17);services.walkables.push({x,z:65.3,w:8.2,d:6,y});
    const b=(m,xx,yy,zz,w,h,d)=>{box(m,xx,y+yy,zz,w,h,d);if(h>.2)services.blockers.push({x:xx,z:zz,w,d,base:y});};
    for(const xx of [x-4.1,x+4.1])b(M.wall,xx,1.6,z,.14,3.2,5.5);
    b(M.wall,x,1.6,68.32,8.3,3.2,.14);b(M.wall,x,3.35,z,8.3,.2,5.5);
    // Shared washing lobby and individually enclosed cubicles off its rear.
    for(let k=0;k<3;k++){
      const sx=x-2.65+k*2.65;
      for(const side of [-1,1])b(M.walnut,sx+side*1.22,1.45,67.2,.08,2.65,2.0);
      b(M.walnut,sx+.64,1.45,66.18,1.18,2.65,.08);
      inst(C,M.ivory,sx,y+.41,67.4,.22,.5,.3);sphere(M.ivory,sx,y+.64,67.36,.3,.1,.38);inst(T,M.ivory,sx,y+.72,67.33,.23,.27,.23,Math.PI/2);
      box(M.ivory,sx,y+.92,67.8,.52,.68,.18);sign(['女士','男士','无障碍 / 亲子'][k],sx,y+2.9,66.1,2.15);
    }
    b(M.marble,x-2.1,.92,64.35,2.5,.12,.75);
    for(const xx of [x-2.75,x-1.45]){sphere(M.ivory,xx,y+.94,64.35,.46,.1,.28);tube(new THREE.Vector3(xx,y+1.01,64.62),new THREE.Vector3(xx,y+1.3,64.62),.022,M.bronze);box(M.bronze,xx,y+1.3,64.52,.04,.04,.24);}
    sign('洗手间  WC  /  无障碍',x,y+2.85,63.05,4.2);services.toilets.push({floor:f,x,z,entry:{x,z:63.1},cubicles:3});
    for(const [xx,zz] of [[0,12.25],[0,35.85],[2.6,41.7],[10.6,55.2]]){
      box(M.bronze,xx,y+2.8,zz,2.76,.355,.06);sign(zz>40?'电梯 ↑  /  WC 后方':names[f]+'  ·  电梯 / WC → 中庭',xx,y+2.8,zz-.05,3.25);
    }
    sign(`${f+1}F  ·  ${names[f]}  |  电梯 →  WC ↑`,-.7,y+2.85,60.45,5.2);
    sign('电梯  LIFT  ↓',7.1,y+2.77,57.62,2.2);
  }
  sign('RF  无人机配送 ←  /  观光直升机 →',0,21.35,35.8,6.4);
  sign('RF  前区花园 / 咖啡  ·  后区航空平台',0,21.1,41.6,7.4);
  return services;
}
