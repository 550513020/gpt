import * as THREE from './vendor/three.module.js';
import {createCinemaDetails,buildPowerBankCabinet} from './venue-details.js?v=15';


import {ROW_RISES,cinemaRakeSections,buildCinemaRake} from './cinema-rake.js?v=15';

export function buildTwinCinema(api,room,chair,screen,accent){
  const {box,root,mats:M,label,runtime}=api,{cx,cz,base:y,w,d}=room;
  const details=createCinemaDetails(api,room);
  const black=new THREE.MeshBasicMaterial({color:'#080a0d'}),wallpaper=new THREE.MeshStandardMaterial({color:'#665366',roughness:.95}),strip=new THREE.MeshBasicMaterial({color:'#56674b'});
  const zFront=cz-d/2+.32,back=cz+d/2-1.1,split=cz-4.7;
  room.darkAuditorium=true;room.cinemaSeats=[];room.cinema={mode:'auto',level:1,halls:[],rake:cinemaRakeSections(cz),inside:false,lastPosition:new THREE.Vector3(),still:0};
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
    const film=details.films[side<0?0:1];
    buildCinemaRake(api,room,x);
    screen('《'+film.title+'》\nLUMEN CINEMA',x,y+2.5,back,7.35,2.5,'#17202b','#e9cba0',film);
    for(let row=0;row<4;row++){
      const z=cz-1.1+row*1.6;
      for(const [col,dx] of [-2.98,-2.13,-1.28,1.28,2.13,2.98].entries())details.seat(x+dx,y+.08+ROW_RISES[row],z,4-row,col+1,side<0?'A':'B');
      for(const dx of [-3.78,-.69,.69,3.78])box(strip,x+dx,y+.14+ROW_RISES[row],z,.035,.016,1.3,0,false);
    }
    for(const z of [cz-1.9,cz+3.4]){
      const mat=new THREE.MeshBasicMaterial({color:'#ffe6bb'}),lamp=new THREE.Mesh(new THREE.BoxGeometry(2.3,.045,.36),mat);lamp.position.set(x,y+3.78,z);root.add(lamp);lamps.push(lamp);
      // Descriptors reuse the app's existing four-light pool, avoiding shader
      // recompilation and additional light loops when entering or dimming a hall.
      const light=new THREE.PointLight('#ffdfac',65,10,2);light.position.set(x,y+3.45,z);lights.push(light);
    }
    label('EXIT · 入场通道',x-3.48,y+2.6,split+.13,1.1,0,'#112b21','#83a083');
    details.poster(side<0?0:1,x-2.6,y+2.0,split-.13,1.12);
    room.cinema.halls.push({x,z:cz,side,lamps,lights,screen:{x,z:back,bottom:y+1.25,top:y+3.75},seatCount:24,rows:4,poster:film.title,release:film.release});
  }
  for(const side of [-1,1]){details.poster(side<0?0:1,cx+side*4.35,y+2.03,zFront-.16,1.42);label((side<0?'A 厅 · ':'B 厅 · ')+details.films[side<0?0:1].title,cx+side*4.35,y+.79,zFront-.16,3.2,Math.PI,'#594c56','#e5d7bd');}
  runtime.updates.push((dt,time,camera)=>{
    if(!camera)return;const c=room.cinema,p=camera.position,inside=p.y>y+.6&&p.y<y+3.7&&Math.abs(p.x-cx)<w/2-.4&&p.z>split&&p.z<back+.2;
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
