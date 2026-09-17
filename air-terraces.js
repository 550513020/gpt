import * as THREE from './vendor/three.module.js';

export function buildAirTerraces(api){
  const {box,slab,inst,sphere,tube,root,glassGroup,mats:M,unitCylinder:C,unitTorus:T,balustrade,glazing,label,runtime,glassPerimeter,railPerimeter}=api;
  const y=18.68,walkables=[],obstacles=[],pads=[];
  const navy=new THREE.MeshStandardMaterial({color:'#1f4550',roughness:.62}),amber=new THREE.MeshStandardMaterial({color:'#e6b248',roughness:.65});
  function board(lines,x,z,width=3.5,height=2.3){
    width*=.8;height*=.8;
    box(navy,x,y+1.65,z,width+.12,height+.12,.12);box(M.bronze,x,y+.3,z,.13,.6,.13);
    if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*height/width);const ctx=canvas.getContext('2d');ctx.fillStyle='#183e48';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='left';lines.forEach((line,i)=>{ctx.fillStyle=i?'#eef3e7':'#efbd67';ctx.font=`${i?38:48}px Microsoft YaHei`;ctx.fillText(line,48,75+i*(canvas.height-100)/lines.length,930);});const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y+1.65,z-.071);mesh.rotation.y=Math.PI;root.add(mesh);}
    obstacles.push({x,z,w:width+.1,d:.18,base:y});
  }
  function rail(x,z,width,along=false){const pane=new THREE.Mesh(new THREE.PlaneGeometry(width,1.1),balustrade);pane.position.set(x,y+.56,z);if(along)pane.rotation.y=Math.PI/2;glassGroup.add(pane);box(M.bronze,x,y+1.12,z,along?.03:width,.03,along?width:.03);}
  for(const cx of [-13.8,13.8]){
    slab(M.stone,cx,y-.03,24,21.8,19.8,3.45,.03);walkables.push({x:cx,z:24,w:21.8,d:19.8,r:3.45,y});
    const lx=(cx<0?-20:20)-cx,openings=[{edge:'front',min:lx-1.2,max:lx+1.2},{rect:[-6.9-cx,6.9-cx,8.3,10.2]}];
    if(cx<0)openings.push({rect:[-31-cx,-23-cx,17.4-24,20.9-24]});
    glassPerimeter(cx,y+.03,24,21.45,19.45,3.4,1.1,balustrade,openings);railPerimeter(cx,y+1.13,24,21.45,19.45,3.4,openings);
  }
  for(const x of [-20,20]){box(M.concrete,x,y-.17,12.25,2.2,.34,5.4);walkables.push({x,z:12.25,w:2.2,d:5.4,y});rail(x-1.08,12.25,5.4,true);rail(x+1.08,12.25,5.4,true);}
  box(M.concrete,0,y-.18,33.6,13,.36,2.2);walkables.push({x:0,z:33.6,w:13,d:2.2,y});rail(0,32.52,13);rail(-4.05,34.68,4.85);rail(4.05,34.68,4.85);
  box(M.concrete,0,y-.18,37.7,3.15,.36,6.2);walkables.push({x:0,z:37.7,w:3.15,d:6.2,y});rail(-1.55,37.7,6.2,true);rail(1.55,37.7,6.2,true);
  // Guangzhou Haizhu micro-airport inspiration: two pads, consolidation desk,
  // parcel lockers and a separate rider charging / rest area.
  for(const [j,coord] of [[-19.2,27.2],[-10.8,27.2],[-15,16.6]].entries()){
    const [x,pz]=coord,size=j===2?3.7:5.7;
    slab(navy,x,y+.04,pz,size,size,.25,.04);for(const side of [-1,1]){box(amber,x+side*(size/2-.2),y+.091,pz,.07,.012,size-.4,0,false);box(amber,x,y+.091,pz+side*2.6,size-.4,.012,.07,0,false);}
    inst(T,M.ivory,x,y+.1,pz,1.7,1.7,1.7,Math.PI/2);box(M.ivory,x,y+.108,pz,1.2,.01,.17,0,false);box(M.ivory,x,y+.108,pz,.17,.01,1.2,0,false);pads.push({x,z:pz,size});
    label(`D${j+1} · 起降位`,x,y+.6,pz+size/2-.1,2.2,Math.PI,'#234a52','#f4e4b8');
    const drone=new THREE.Group();root.add(drone);const mesh=(geo,mat,px,py,pz)=>{const o=new THREE.Mesh(geo,mat);o.position.set(px,py,pz);drone.add(o);return o;};
    mesh(new THREE.BoxGeometry(.7,.25,.7),M.ivory,0,.55,0);mesh(new THREE.BoxGeometry(.55,.46,.55),amber,0,.17,0);const rotors=[];
    for(let k=0;k<6;k++){const a=k*Math.PI/3,xx=Math.sin(a)*.83,zz=Math.cos(a)*.83;const arm=mesh(new THREE.BoxGeometry(.085,.075,.86),M.darkMetal,xx/2,.55,zz/2);arm.rotation.y=a;const rotor=mesh(new THREE.BoxGeometry(.9,.02,.09),M.black,xx,.68,zz);rotors.push(rotor);mesh(new THREE.CylinderGeometry(.07,.07,.15,8),M.darkMetal,xx,.62,zz);}
    for(const side of [-1,1])mesh(new THREE.BoxGeometry(.04,.4,.8),M.darkMetal,side*.4,.21,0);
    runtime.updates.push((dt,t)=>{const phase=(t+j*13)%32,height=phase<10?Math.sin(phase/10*Math.PI)*2.4:0;drone.position.set(x,y+.2+height,pz);rotors.forEach((r,k)=>r.rotation.y=t*(height>.02?26:1)+k);});
    obstacles.push({x,z:pz,w:size+.25,d:size+.25,base:y});
  }
  for(const xx of [-22.3,-19.8]){box(navy,xx,y+1.15,15.45,2.2,2.1,.72);obstacles.push({x:xx,z:15.45,w:2.25,d:.8,base:y});for(let row=0;row<3;row++)for(let col=0;col<3;col++){box(M.ivory,xx+(col-1)*.68,y+.48+row*.57,15.05,.61,.5,.03);box(amber,xx+(col-1)*.68+.22,y+.48+row*.57,15.02,.04,.1,.03);}label('外卖柜',xx,y+2.43,15.03,1.7,Math.PI,'#244b49','#f9e4b9');}
  // Shaded rider break bay with a fixed yellow-uniform courier.
  for(const xx of [-22.1,-18.1])for(const zz of [17.3,19.4])box(M.bronze,xx,y+1.5,zz,.07,3,.07);slab(M.ivory,-20.1,y+3.04,18.35,4.3,2.5,.18,.08);
  label('骑士驿站 · 休息 / 饮水',-20.1,y+2.66,17.05,3.7,Math.PI,'#244b49','#f9e4b9');
  const yellow=new THREE.MeshStandardMaterial({color:'#f6c324',roughness:.82}),skin=new THREE.MeshStandardMaterial({color:'#d8a784',roughness:.9});
  const px=-20.4,pz=18.45;sphere(yellow,px,y+1.02,pz,.23,.36,.14);sphere(skin,px,y+1.54,pz,.135,.17,.13);sphere(yellow,px,y+1.66,pz,.155,.105,.155);
  for(const side of [-1,1]){box(M.darkMetal,px+side*.11,y+.51,pz,.15,.88,.18);box(M.black,px+side*.11,y+.09,pz-.06,.18,.13,.32);tube(new THREE.Vector3(px+side*.22,y+1.22,pz),new THREE.Vector3(px+side*.27,y+.65,pz-.08),.055,yellow);}
  box(yellow,px,y+.92,pz+.34,.62,.53,.54);label('美团外卖',px,y+1.1,pz-.16,.43,Math.PI,'#e8b920','#283e38');obstacles.push({x:px,z:pz,w:.7,d:.95,base:y});
  const lockerX=-6.1,lockerZ=20.6;box(navy,lockerX,y+1.3,lockerZ,2.85,2.4,.72);obstacles.push({x:lockerX,z:lockerZ,w:2.9,d:.8,base:y});
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=lockerX+(col-1.5)*.66,yy=y+.43+row*.49;box(col===3?amber:M.ivory,x,yy,lockerZ-.38,.6,.44,.035);box(M.bronze,x+.2,yy,lockerZ-.405,.04,.12,.025);label(String(row*4+col+1).padStart(2,'0'),x,yy,lockerZ-.431,.29,Math.PI,'#d4e0d8','#183d43');}
  label('外卖自提柜 / PICK UP',lockerX,y+2.63,lockerZ-.39,2.75,Math.PI,'#1f4550','#fff0ce');
  box(M.walnut,-12.5,y+.64,20.9,3.3,1.14,1.25);box(M.black,-12,y+1.36,20.9,.65,.2,.6);for(let i=0;i<5;i++)box(amber,-13.7+i*.53,y+1.41,20.75,.38,.3,.42);obstacles.push({x:-12.5,z:20.9,w:3.4,d:1.35,base:y});
  label('集单 / 称重 / 装箱',-12.5,y+.8,20.24,2.6,Math.PI,'#355757','#e8ecd8');
  for(const x of [-21,-17.6]){slab(M.wood,x,y+.42,17.1,2.5,.78,.15,.16);obstacles.push({x,z:17.1,w:2.6,d:.88,base:y});}
  box(navy,-23,y+1.0,21.3,.8,1.8,.6);for(let j=0;j<5;j++)box(amber,-23,y+.43+j*.27,20.99,.63,.2,.025);label('补能',-23,y+2.13,20.98,.72,Math.PI,'#234a52','#f8eccc');
  board(['水岸微空港','三起降位 · 集单接驳','外卖自提柜 →','等候 / 充电 / 骑士补给'], -16.8,22.35,3.2,2.25);
  // Compact conceptual observation terminal; its price list is explicitly fictional.
  const hx=13.8,hz=26;
  inst(C,navy,hx,y+.09,hz,7.7,.12,7.7);inst(T,amber,hx,y+.16,hz,7.35,7.35,7.35,Math.PI/2);
  for(const x of [-1.45,1.45])box(M.ivory,hx+x,y+.17,hz,.33,.018,4.5,0,false);box(M.ivory,hx,y+.17,hz,3.15,.018,.34,0,false);
  for(let k=0;k<12;k++){const a=k*Math.PI/6;sphere(M.warmGlow,hx+Math.sin(a)*7.5,y+.22,hz+Math.cos(a)*7.5,.065);}
  const cockpit=new THREE.MeshPhysicalMaterial({color:'#377181',roughness:.12,transmission:.6,thickness:.03,metalness:.08});
  const helo=new THREE.Group();helo.position.set(hx,y+4.1,hz);root.add(helo);
  const ellipsoid=(mat,x,yy,z,sx,sy,sz)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,22,14),mat);m.position.set(x,yy,z);m.scale.set(sx,sy,sz);helo.add(m);return m;};
  const hb=(mat,x,yy,z,w,h,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,yy,z);helo.add(m);return m;};
  const ht=(a,b,r1,r2,mat)=>{const delta=b.clone().sub(a),m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,delta.length(),10),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());helo.add(m);};
  ellipsoid(M.ivory,0,1.55,0,1.05,.97,2.05);ellipsoid(cockpit,0,1.75,-1.4,.99,.82,1.2);
  for(const side of [-1,1]){hb(M.coral,side*1.04,1.42,.25,.045,.16,1.65);ht(new THREE.Vector3(side*1.23,.38,-2.1),new THREE.Vector3(side*1.23,.38,2),.08,.08,M.darkMetal);for(const z of [-1.15,1.15])ht(new THREE.Vector3(side*.7,1,z),new THREE.Vector3(side*1.23,.38,z),.055,.055,M.darkMetal);hb(M.velvet,side*.48,1.2,-1.45,.52,.55,.5);}
  ht(new THREE.Vector3(0,1.5,1.2),new THREE.Vector3(0,2.04,6),.34,.075,M.ivory);hb(M.coral,0,2.45,5.72,.12,1.23,.75);hb(M.ivory,0,1.9,4.3,2.15,.07,.62);
  ht(new THREE.Vector3(0,2.25,0),new THREE.Vector3(0,3.0,0),.12,.12,M.darkMetal);hb(M.black,0,3.03,0,9.3,.045,.23);hb(M.black,0,3.06,0,.23,.045,9.3);ellipsoid(M.coral,0,3.14,0,.2,.09,.2);
  hb(M.black,.22,2.06,6.05,.06,1.27,.11);hb(M.black,.22,2.06,6.05,.06,.11,1.27);ellipsoid(M.warmGlow,0,2.97,5.7,.055,.055,.055);
  // Open left cabin door, pilot waiting at the sill, and a static tether to the pad.
  hb(M.black,-1.055,1.42,.15,.035,1.53,1.08);
  hb(M.ivory,-1.12,1.38,1.32,.045,1.52,.93);
  hb(cockpit,-1.152,1.78,1.32,.02,.59,.75);
  hb(M.darkMetal,-1.23,.61,.15,.64,.08,1.13);
  const uniform=new THREE.MeshStandardMaterial({color:'#e8e3d5',roughness:.88});
  ellipsoid(uniform,-1.19,1.44,.15,.22,.3,.18);
  ellipsoid(skin,-1.2,1.94,.15,.135,.17,.13);ellipsoid(navy,-1.2,2.06,.15,.16,.08,.16);
  for(const dz of [-.12,.12]){hb(navy,-1.2,.94,.15+dz,.14,.55,.13);hb(M.black,-1.28,.66,.15+dz,.28,.1,.13);}
  ht(new THREE.Vector3(-1.27,1.65,-.04),new THREE.Vector3(-1.54,1.28,-.13),.047,.047,uniform);
  ht(new THREE.Vector3(-1.27,1.65,.34),new THREE.Vector3(-1.33,1.25,.51),.047,.047,uniform);
  ellipsoid(skin,-1.55,1.26,-.13,.055,.07,.05);hb(navy,-1.405,1.5,.15,.025,.24,.075);
  const ropeMat=new THREE.MeshStandardMaterial({color:'#a8956c',roughness:1});
  tube(new THREE.Vector3(hx-1.53,y+4.73,hz-.12),new THREE.Vector3(hx-1.72,y+.22,hz-.16),.033,ropeMat);
  for(let j=0;j<11;j++)sphere(ropeMat,hx-1.72+j*.017,y+.4+j*.38,hz-.16,.052,.07,.052);
  inst(T,M.bronze,hx-1.72,y+.22,hz-.16,.14,.14,.14,Math.PI/2);
  obstacles.push({x:hx,z:hz+1.3,w:10,d:11.8,base:y});
  // One small board on the right when entering via the south bridge facing +Z.
  const bx=18.1,bz=15.55,bw=1.65,bh=1.24;
  box(M.ivory,bx,y+1.55,bz,bw+.04,bh+.04,.09);box(M.bronze,bx,y+.45,bz,.065,.9,.065);
  obstacles.push({x:bx,z:bz,w:bw+.08,d:.18,base:y});
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=752;const c=canvas.getContext('2d');c.fillStyle='#faf9f5';c.fillRect(0,0,1000,752);c.fillStyle='#222421';
    c.font='bold 62px Microsoft YaHei';c.fillText('观光飞行 · 乘机须知',58,99);c.fillRect(58,132,884,3);
    const lines=['随地勤进入指定通道','收好物品 · 系好安全带','请勿靠近旋翼及尾桨','8 分钟 ¥699 / 人','15 分钟 ¥1199 / 人','概念展示 · 无实际售票'];
    c.font='46px Microsoft YaHei';lines.forEach((line,i)=>c.fillText(line,58,222+i*80));
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const face=new THREE.Mesh(new THREE.PlaneGeometry(bw,bh),new THREE.MeshBasicMaterial({map:t}));face.position.set(bx,y+1.55,bz-.052);face.rotation.y=Math.PI;root.add(face);
  }
  for(let j=0;j<3;j++){const x=11.4+j*1.15;box(M.bronze,x,y+1.45,16.4,.04,2.7,.04);sphere(j%2?M.coral:amber,x,y+1.4,16.35,.29,.43,.15);for(const dx of [-.16,.16])box(M.black,x+dx,y+1.4,16.18,.045,.64,.025);inst(T,M.bronze,x,y+.98,16.16,.17,.19,.17);sphere(M.ivory,x,y+2.11,16.35,.23);obstacles.push({x,z:16.4,w:.7,d:.6,base:y});}
  label('航空装备 / 伞包展示',12.6,y+2.7,16.3,3.3,Math.PI,'#234a52','#f8eccc');
  box(M.coral,23,y+.68,22,.62,1.18,.45);label('消防',23,y+1.4,21.75,.7,Math.PI,'#9b4735','#fff3d2');
  tube(new THREE.Vector3(23,y,29),new THREE.Vector3(23,y+3.7,29),.035,M.bronze);const windsock=new THREE.Mesh(new THREE.ConeGeometry(.2,1.1,10,1,true),amber);windsock.rotation.z=Math.PI/2;windsock.position.set(23.5,y+3.55,29);root.add(windsock);runtime.updates.push((dt,t)=>windsock.rotation.y=Math.sin(t*.6)*.15);
  return {y,walkables,obstacles,pads,helicopters:1,helicopterHeight:4.1,pilot:true,tether:true,boardingBoard:{x:bx,z:bz,width:bw,height:bh},lockerCompartments:34,rider:true,terminal:{x:16,z:17.65},source:'https://www.gz.gov.cn/zwfw/zxfw/ggfw/content/post_10610829.html'};
}
