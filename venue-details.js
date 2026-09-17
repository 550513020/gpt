import * as THREE from './vendor/three.module.js';
import films from './assets/cinema-posters.js?v=13';

const smallShapes=new Map();
function smallSlab(api,mat,x,y,z,w,d,r,h){
  const key=[w,d,r,h].join(':');let geometry=smallShapes.get(key);
  if(!geometry){
    const s=new THREE.Shape(),a=-w/2,b=-d/2;
    s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
    geometry=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:1,steps:1,curveSegments:3});geometry.rotateX(-Math.PI/2);smallShapes.set(key,geometry);
  }
  api.inst(geometry,mat,x,y,z);
}

export function createCinemaDetails(api,room){
  const {box,inst,root,label,mats:M,unitCylinder:C,unitTorus:T}=api;
  const slab=(...args)=>smallSlab(api,...args);
  const upholstery=new THREE.MeshStandardMaterial({color:'#783b44',roughness:.93,normalMap:M.tan.normalMap||null,normalScale:new THREE.Vector2(.16,.16)});
  const dark=new THREE.MeshStandardMaterial({color:'#22232b',roughness:.86});
  const rounded=new THREE.CapsuleGeometry(.28,.51,3,6);
  const posterTextures=[];
  function seat(x,y,z,row,number,hall){
    // Reclined upholstered back, separate headrest, folding seat and shared-width armrests.
    inst(rounded,upholstery,x,y+.91,z-.28,1.04,.86,.36,-.1,0,0);
    slab(upholstery,x,y+.43,z+.04,.61,.64,.115,.18);
    slab(dark,x,y+.1,z,.58,.59,.08,.13);
    box(dark,x,y+.32,z-.09,.085,.41,.14);
    for(const dx of [-.365,.365]){
      slab(dark,x+dx,y+.64,z+.03,.105,.7,.045,.095);
      inst(T,M.black,x+dx,y+.745,z+.25,.049,.049,.049,Math.PI/2);
      inst(C,M.black,x+dx,y+.718,z+.25,.044,.033,.044);
      box(dark,x+dx,y+.5,z-.1,.065,.3,.075);
    }
    label(`${row}排 ${String(number).padStart(2,'0')}`,x,y+1.14,z-.396,.29,Math.PI,'#4e2930','#c9b497');
    room.blockers.push({x,z,w:.82,d:1.03});
    room.cinemaSeats.push({x,y,z,row,number,hall});
  }
  function poster(index,x,y,z,width=1.25){
    const film=films[index];if(typeof document==='undefined')return;
    let texture=posterTextures[index];
    if(!texture){const c=document.createElement('canvas');c.width=420;c.height=600;const g=c.getContext('2d');
      g.fillStyle='#17282b';g.fillRect(0,0,420,600);texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;posterTextures[index]=texture;
      const image=new Image();image.onload=()=>{if(index===0){g.drawImage(image,20,90,380,380);g.fillStyle='#f5dfb9';g.textAlign='center';g.font='bold 46px Microsoft YaHei';g.fillText('牛 来',210,62);g.font='24px Microsoft YaHei';g.fillText('A 厅 · NIULAI',210,524);g.font='17px Microsoft YaHei';g.fillText('欢乐特别场 · 坐下来笑一会儿',210,568);}else{g.drawImage(image,0,0,420,600);}texture.needsUpdate=true;};image.src=film.data;}
    const h=width*(film.aspect||450/327);box(dark,x,y,z+.045,width+.075,h+.075,.06);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,h),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);mesh.rotation.y=Math.PI;root.add(mesh);
  }
  return {seat,poster,films};
}

export function buildPowerBankCabinet(api,roof){
  const {box,slab,root,mats:M}=api,y=roof.y,x=-22.2,z=5.6;
  const yellow=new THREE.MeshStandardMaterial({color:'#f7ce28',roughness:.56});
  const graphite=new THREE.MeshStandardMaterial({color:'#282d2d',roughness:.8});
  const led=new THREE.MeshBasicMaterial({color:'#88c591'});
  smallSlab(api,yellow,x,y+.15,z,1.25,.7,.12,1.58);
  box(graphite,x,y+.19,z,1.3,.12,.76);
  roof.obstacles.push({x,z,w:1.4,d:.85,base:y});
  for(let row=0;row<2;row++)for(let col=0;col<6;col++){
    const px=x+(col-2.5)*.177,py=y+.67+row*.34;
    box(graphite,px,py,z-.375,.15,.265,.026);
    // Leave two empty return slots; ten banks protrude from deep dark sockets.
    if((row===0&&col===4)||(row===1&&col===1))continue;
    smallSlab(api,yellow,px,py-.108,z-.405,.113,.17,.025,.225);
    box(graphite,px,py-.078,z-.516,.07,.024,.012);
    box(led,px,py+.093,z-.516,.052,.008,.01);
    box(M.black,px+.026,py+.02,z-.516,.016,.07,.01);
  }
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=240;const c=canvas.getContext('2d');
    c.fillStyle='#f7ce28';c.fillRect(0,0,512,240);c.fillStyle='#242b2a';c.textAlign='left';c.font='bold 36px Microsoft YaHei';c.fillText('共享充电宝',24,54);c.font='23px Microsoft YaHei';c.fillText('扫码借还  ·  随用随还',24,94);
    // Stylised scan panel, deliberately not a payable QR code.
    c.fillStyle='#fff9dc';c.fillRect(364,122,112,100);c.fillStyle='#292f2b';for(let row=0;row<9;row++)for(let col=0;col<9;col++)if((row*7+col*11)%5<2)c.fillRect(374+col*10,130+row*9,7,7);
    c.font='20px Microsoft YaHei';c.fillText('10 可借 / 2 可还',24,157);c.font='17px Microsoft YaHei';c.fillText('请收好线材再插入',24,193);
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(1.14,.535),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));face.position.set(x,y+1.435,z-.373);face.rotation.y=Math.PI;root.add(face);
  }
  roof.charging={wirelessTables:4,powerBankKiosks:1,slots:12,inserted:10,empty:2,color:'yellow'};
}
