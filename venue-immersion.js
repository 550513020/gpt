import * as THREE from './vendor/three.module.js';
import {createCinemaDetails,buildPowerBankCabinet} from './venue-details.js?v=11';

export function refineBakery(api,room){
  const {box,slab,inst,sphere,tube,label,root,glassGroup,vitrine,mats:M,unitCylinder:C}=api,{cx,cz,base:y}=room;
  const red=new THREE.MeshStandardMaterial({color:'#913a32',roughness:.68}),cream=new THREE.MeshStandardMaterial({color:'#e9cc94',roughness:.88}),chocolate=new THREE.MeshStandardMaterial({color:'#583524',roughness:.85});
  const flavors=['#c885a0','#a2b278','#d1ad62','#9575a0'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.82}));
  room.menu.push('cookie','macaron','canele','tart','pretzel');room.bakery.photoStair=true;room.bakery.trays=true;
  function glass(x,z,w,d,yy=y+1.4,h=.6){const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),vitrine);p.position.set(x,yy,z);glassGroup.add(p);}
  for(const side of [-1,1]){glass(cx+side*3.1,cz-.3,1.34,4.75);glass(cx+side*3.8,cz+2,2.72,1.2);box(red,cx+side*3.1,y+.68,cz-2.72,1.3,.48,.025);}
  // A chilled chest with sliding glass lids, separate from the tall cold display.
  slab(red,cx-4.8,y+.12,cz+5.85,2.6,1.1,.15,.79);glass(cx-4.8,cz+5.85,2.62,1.12,y+1.04,.19);
  box(M.bronze,cx-4.8,y+1.15,cz+5.85,.04,.04,1.1);
  for(let j=0;j<5;j++)inst(C,flavors[j%4],cx-5.75+j*.47,y+.97,cz+5.85,.18,.13,.3);
  label('冰淇淋 / 冷藏蛋糕',cx-4.8,y+.66,cz+5.28,2.35,Math.PI,'#8c3b32','#f8dfaf');
  // Lower glass counter: four flavours of macarons, chocolate cookies and canelés.
  slab(red,cx+4.5,y+.1,cz-5.1,2.5,1.1,.18,.9);glass(cx+4.5,cz-5.1,2.48,1.08,y+1.37,.65);
  for(let j=0;j<20;j++){
    const x=cx+3.57+(j%5)*.46,z=cz-5.43+Math.floor(j/5)*.22,mat=flavors[j%4];
    inst(C,mat,x,y+1.10,z,.135,.055,.135);inst(C,M.cream,x,y+1.145,z,.13,.036,.13);inst(C,mat,x,y+1.186,z,.135,.055,.135);
  }
  label('MACARON · 四色马卡龙',cx+4.5,y+.65,cz-5.67,2.3,Math.PI,'#8c3b32','#ffe8ba');
  for(let j=0;j<18;j++){
    const x=cx+3.1+(j%3-1)*.31,z=cz-1.8+Math.floor(j/3)*.45;
    inst(C,cream,x,y+1.2,z,.115,.04,.115);for(let k=0;k<4;k++)sphere(chocolate,x+Math.cos(k*2.4)*.064,y+1.23,z+Math.sin(k*2.4)*.064,.023,.014,.024);
    if(j%3===0){inst(C,chocolate,cx-3.1,y+1.24,z,.1,.18,.1);inst(C,cream,cx-3.1,y+1.34,z,.095,.03,.095);}
  }
  // Customer tray / tong station beside the entry, with a separate tasting board.
  slab(M.wood,cx+2.45,y+.1,cz-6.8,1.35,.72,.12,.84);
  for(let j=0;j<7;j++){slab(M.walnut,cx+2.2,y+.99+j*.026,cz-6.8,.67,.45,.045,.022);box(M.bronze,cx+2.86,y+1.01+j*.025,cz-6.8,.025,.022,.34,.2);}
  label('取托盘 · 面包夹',cx+2.45,y+.65,cz-7.18,1.28,Math.PI,'#8c3b32','#ffe9c3');
  slab(M.wood,cx-1.25,y+.12,cz-5.45,1.05,.7,.1,.87);slab(M.walnut,cx-1.25,y+1.01,cz-5.45,.95,.6,.08,.025);
  for(let j=0;j<8;j++)box(cream,cx-1.53+(j%4)*.18,y+1.08,cz-5.6+Math.floor(j/4)*.25,.13,.11,.16);
  label('今日试吃',cx-1.25,y+.64,cz-5.81,.95,Math.PI,'#8c3b32','#ffe9c3');
  // Low spiral photo stair stays below the shop ceiling; an open approach faces the foyer.
  const sx=cx-5.7,sz=cz-5.3,r=1.35;room.blockers.push({x:sx,z:sz,w:2.8,d:2.8});
  inst(C,red,sx,y+1.1,sz,.09,2.2,.09);
  let previous=null;
  for(let i=0;i<16;i++){
    const a=-Math.PI*.7+i*.285,b=a+.27,h=.075*(i+1),shape=new THREE.Shape();
    shape.absarc(0,0,r,a,b,false);shape.lineTo(Math.cos(b)*.17,Math.sin(b)*.17);shape.absarc(0,0,.17,b,a,true);shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false,steps:1,curveSegments:3});g.rotateX(-Math.PI/2);inst(g,i%2?red:M.walnut,sx,y+h,sz);
    const p=new THREE.Vector3(sx+Math.cos(a)*r,y+h+.9,sz-Math.sin(a)*r);tube(new THREE.Vector3(p.x,y+h,p.z),p,.016,red);if(previous)tube(previous,p,.026,red);previous=p;
  }
  label('麦屿 · 红色旋梯打卡',sx,y+2.72,sz+1.5,3.2,Math.PI,'#8c3b32','#ffe3b5');
  // An additional red café table links the photo corner to the existing bench seats.
  inst(C,red,cx-7,y+.8,cz+4.7,.67,.07,.67);inst(C,M.bronze,cx-7,y+.42,cz+4.7,.05,.75,.05);room.blockers.push({x:cx-7,z:cz+4.7,w:1.4,d:1.4});
  for(const dx of [-.95,.95]){slab(red,cx-7+dx,y+.35,cz+4.7,.54,.55,.1,.16);box(red,cx-7+dx,y+.8,cz+4.94,.54,.6,.1);}
  room.bakery.breads+=46;room.bakery.seating+=2;
}

export function buildTwinCinema(api,room,chair,screen,accent){
  const {box,root,mats:M,label,runtime}=api,{cx,cz,base:y,w,d}=room;
  const details=createCinemaDetails(api,room);
  const black=new THREE.MeshBasicMaterial({color:'#080a0d'}),wallpaper=new THREE.MeshStandardMaterial({color:'#665366',roughness:.95}),strip=new THREE.MeshBasicMaterial({color:'#56674b'});
  const zFront=cz-d/2+.32,back=cz+d/2-1.1,split=cz-4.7;
  room.darkAuditorium=true;room.cinemaSeats=[];room.cinema={mode:'auto',level:1,halls:[],inside:false,lastPosition:new THREE.Vector3(),still:0};
  function wall(x,z,width,depth,outerFace){
    const materials=Array(6).fill(black);if(outerFace!==undefined)materials[outerFace]=wallpaper;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,3.88,depth),materials);mesh.position.set(x,y+1.99,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);room.blockers.push({x,z,w:width,d:depth});
  }
  const ceiling=new THREE.Mesh(new THREE.BoxGeometry(w-.6,.18,d-.6),[wallpaper,wallpaper,wallpaper,black,wallpaper,wallpaper]);ceiling.position.set(cx,y+3.96,cz);ceiling.castShadow=true;root.add(ceiling);
  wall(cx-w/2+.37,cz,.28,d-.74,1);wall(cx+w/2-.37,cz,.28,d-.74,0);wall(cx,cz+d/2-.39,w-.8,.23,4);
  const half=(w-3.8)/2;for(const side of [-1,1])wall(cx+side*(1.45+half/2),zFront,half,.24,5);
  // A continuous central acoustic partition makes two independently lit auditoria.
  wall(cx,(split+cz+d/2-.39)/2,.25,cz+d/2-.39-split);
  for(const side of [-1,1]){
    const x=cx+side*4.35,lamps=[],lights=[];
    // Entry wall has a 1.8 m doorway, followed by a baffle with passages on both sides.
    for(const dx of [-2.6,2.6])wall(x+dx,split,3.4,.2,5);
    wall(x,split+1.15,2.45,.2);label(side<0?'A 厅  ←':'B 厅  →',x,y+2.5,split-.12,2.1,Math.PI,'#584454','#efdab6');
    screen('《牛来》\nLUMEN CINEMA',x,y+2.1,back,7.35,2.95,'#17202b','#e9cba0');
    for(let row=0;row<4;row++){
      const z=cz-1.1+row*1.6;
      for(const [col,dx] of [-2.98,-2.13,-1.28,1.28,2.13,2.98].entries())details.seat(x+dx,y+.08,z,4-row,col+1,side<0?'A':'B');
      for(const dx of [-3.78,-.69,.69,3.78])box(strip,x+dx,y+.14,z,.035,.016,1.3,0,false);
    }
    for(const z of [cz-1.9,cz+3.4]){
      const mat=new THREE.MeshBasicMaterial({color:'#ffe6bb'}),lamp=new THREE.Mesh(new THREE.BoxGeometry(2.3,.045,.36),mat);lamp.position.set(x,y+3.78,z);root.add(lamp);lamps.push(lamp);
      // Descriptors reuse the app's existing four-light pool, avoiding shader
      // recompilation and additional light loops when entering or dimming a hall.
      const light=new THREE.PointLight('#ffdfac',65,10,2);light.position.set(x,y+3.45,z);lights.push(light);
    }
    label('EXIT · 入场通道',x-3.48,y+2.6,split+.13,1.1,0,'#112b21','#83a083');
    const film=details.films[side<0?0:1];
    details.poster(side<0?0:1,x-2.6,y+2.0,split-.13,1.12);
    room.cinema.halls.push({x,z:cz,side,lamps,lights,screen:{x,z:back},seatCount:24,rows:4,poster:film.title,release:film.release});
  }
  for(const side of [-1,1]){details.poster(side<0?0:1,cx+side*4.35,y+2.03,zFront-.16,1.42);label(side<0?'A 厅 · 我想留在你身边':'B 厅 · 燃烧吧！爸爸',cx+side*4.35,y+.79,zFront-.16,3.2,Math.PI,'#594c56','#e5d7bd');}
  runtime.updates.push((dt,time,camera)=>{
    if(!camera)return;const c=room.cinema,p=camera.position,inside=Math.abs(p.y-y-1.7)<1.3&&Math.abs(p.x-cx)<w/2-.4&&p.z>split&&p.z<back+.2;
    if(!inside){c.still=0;c.mode='auto';}else if(p.distanceToSquared(c.lastPosition)>.0007)c.still=0;else c.still+=dt;
    c.inside=inside;c.lastPosition.copy(p);const target=c.mode==='watch'?0:c.mode==='entry'?1:c.still>4?0:1;c.level+=(target-c.level)*(1-Math.exp(-dt*2.7));
    for(const hall of c.halls){const active=inside&&(p.x-cx)*hall.side>0,level=active?c.level:.1;for(const l of hall.lights){l.visible=active&&level>.015;l.intensity=65*level;}for(const l of hall.lamps)l.material.color.setRGB(.009+level,.011+level*.78,.015+level*.53);}
  });
}

export function refineSpa(api,room){
  const {box,slab,inst,tube,root,mats:M,unitCylinder:C,runtime,label}=api,{cx,cz,base:y}=room;
  const porcelain=new THREE.MeshStandardMaterial({color:'#d4d1bd',roughness:.26}),water=new THREE.MeshStandardMaterial({color:'#6d9e96',transparent:true,opacity:.72,roughness:.21});
  room.spaTubs=[];
  for(const side of [-1,1]){
    const x=cx+side*1.8,z=cz+2.0;slab(porcelain,x,y+.15,z,1.4,2.65,.35,.6);slab(water,x,y+.76,z,1.12,2.32,.28,.025);room.spaTubs.push({x,z});
    tube(new THREE.Vector3(x,y+.74,z+1.14),new THREE.Vector3(x,y+1.12,z+1.14),.028,M.bronze);box(M.bronze,x,y+1.12,z+1.04,.06,.045,.26);
    box(M.darkMetal,x,y+.27,z+1.8,.43,.45,.5);box(M.teal,x,y+.48,z+1.54,.18,.09,.03);label('温润雾浴',x,y+1.36,z+1.92,1.2,Math.PI,'#4d675c','#e1d8b9');
  }
  // Folded linen curtains sit beside the outer wooden partitions, away from the centre aisle.
  const fabric=new THREE.MeshStandardMaterial({color:'#bcae90',roughness:1,side:THREE.DoubleSide,normalMap:M.tan.normalMap||null,normalScale:new THREE.Vector2(.3,.3)});
  for(const side of [-1,1])for(const z of [cz-1.8,cz+3.3]){
    const g=new THREE.PlaneGeometry(2.7,2.55,22,1),a=g.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,Math.sin(a.getX(i)*22)*.065);g.computeVertexNormals();
    const curtain=new THREE.Mesh(g,fabric);curtain.rotation.y=Math.PI/2;curtain.position.set(cx+side*6.2,y+1.78,z);root.add(curtain);tube(new THREE.Vector3(cx+side*6.2,y+3.13,z-1.45),new THREE.Vector3(cx+side*6.2,y+3.13,z+1.45),.025,M.bronze);
  }
  const positions=new Float32Array(40*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying float fade;attribute vec3 position;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(220./max(1.,-p.z),4.,75.);fade=1.;}',fragmentShader:'varying float fade;void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-r),2.)*.065;gl_FragColor=vec4(.88,.91,.86,a*fade);}'});
  // ShaderMaterial supplies the position attribute declaration automatically.
  material.vertexShader=material.vertexShader.replace('attribute vec3 position;','').replace('220.','400.').replace('75.','110.');material.fragmentShader=material.fragmentShader.replace('*.065','*.095');const mist=new THREE.Points(g,material);mist.userData.excludeAO=true;root.add(mist);room.spaMist=mist;
  runtime.updates.push((dt,t,camera)=>{mist.visible=!!camera&&camera.position.distanceTo(new THREE.Vector3(cx,y+1.7,cz))<22;if(!mist.visible)return;for(let i=0;i<40;i++){const phase=(t*.085+i*.137)%1,k=i*3;positions[k]=cx+(i%2?1.8:-1.8)+Math.sin(t*.28+i*2.4)*(.2+phase*.8);positions[k+1]=y+.8+phase*2.15;positions[k+2]=cz+1.8+Math.cos(i*2.4+t*.18)*(.3+phase*1.4);}g.attributes.position.needsUpdate=true;});
}

export function refineRoof(api,roof){
  const {inst,box,slab,label,root,mats:M,unitCylinder:C}=api,y=roof.y;
  const canopy=new THREE.MeshStandardMaterial({color:'#d7b886',roughness:.95,side:THREE.DoubleSide}),red=new THREE.MeshStandardMaterial({color:'#965c4b',roughness:.9}),cone=new THREE.ConeGeometry(1,.38,12,1,true);
  function umbrella(x,z,r=1.7){inst(C,M.bronze,x,y+1.43,z,.033,2.85,.033);inst(cone,canopy,x,y+2.88,z,r,1,r);inst(C,M.bronze,x,y+.15,z,.2,.08,.2);}
  for(const x of [10,16,22])for(const z of [-5.2,-.4])umbrella(x,z);
  for(const x of [-19.4,-12.6])for(const z of [-1.75,1.75]){box(M.teal,x+.22,y+.58,z,.19,.015,.26);label('Qi 无线充电',x,y+.71,z-.4,.75,Math.PI,'#3a675c','#ebd7ab');}
  const x=-16,z=-6.15;slab(M.wood,x,y+.12,z,3.6,1,.2,.91);roof.obstacles.push({x,z,w:3.8,d:1.15,base:y});box(M.darkMetal,x+.6,y+1.42,z,.95,.57,.6);
  for(const dx of [-.33,.2]){inst(C,M.ivory,x+.6+dx,y+1.17,z-.37,.09,.16,.09);inst(C,M.bronze,x-.7+dx,y+1.29,z,.13,.33,.13);}
  label('花园咖啡 · 自助补给',x,y+2.25,z+.5,3.5,Math.PI,'#496852','#f4e7ca');
  buildPowerBankCabinet(api,roof);roof.umbrellas=6;roof.umbrellaSide='right';
}
