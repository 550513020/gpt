import * as THREE from './vendor/three.module.js';
import { createMerchandise } from './merchandise.js?v=11';

export function addBakery(api,room){
  const {box,slab,inst,sphere,label,glassGroup,vitrine,mats:M,unitCylinder:C,unitTorus:T}=api,{cx,cz,base:y}=room;
  const steel=new THREE.MeshStandardMaterial({color:'#c8cbc4',metalness:.65,roughness:.31});
  const bagelGeometry=new THREE.TorusGeometry(.14,.065,8,24);
  const bread=new THREE.MeshStandardMaterial({color:'#c58a43',roughness:.86}),crust=new THREE.MeshStandardMaterial({color:'#94602d',roughness:.9});
  room.menu=['croissant','sourdough','bagel','strawberryCake','coffee'];room.bakery={islands:2,coldDisplay:true,seating:6,breads:0};
  function loaf(x,z,k,yy=y+1.11){
    inst(C,M.ivory,x,yy-.015,z,.26,.018,.24);
    if(k%4===0){for(let j=0;j<5;j++)sphere(j%2?bread:crust,x+(j-2)*.083,yy+.08-Math.abs(j-2)*.017,z+Math.abs(j-2)*.025,.09,.075,.13);}
    else if(k%4===1){sphere(bread,x,yy+.09,z,.22,.12,.15);for(let j=-1;j<2;j++)box(M.cream,x+j*.085,yy+.2,z,.015,.009,.12,.35);}
    else if(k%4===2){inst(bagelGeometry,bread,x,yy+.065,z,1,1,1,Math.PI/2);}
    else {inst(C,M.cream,x,yy+.09,z,.16,.17,.16);sphere(M.coral,x,yy+.21,z,.07,.08,.07);}
    room.bakery.breads++;
  }
  function counter(x,z,w,d){slab(steel,x,y+.13,z,w,d,.21,.81);slab(M.marble,x,y+.96,z,w+.06,d+.06,.21,.08);}
  // Two L-shaped islands leave a 2.4 m centre aisle and continuous outer loop.
  for(const side of [-1,1]){
    const x=cx+side*3.1;counter(x,cz-.3,1.35,4.8);counter(x+side*.7,cz+2,2.75,1.25);
    for(let j=0;j<7;j++)for(const off of [-.29,.29])loaf(x+off,cz-2.15+j*.62,j+(side>0?1:0));
    label(side<0?'每日现烤 · SOURDOUGH':'黄油可颂 · BRIOCHE',x,y+.64,cz-2.73,1.23,Math.PI,'#b5bdad','#233c34');
  }
  // Refrigerated patisserie follows the sketch's right-hand edge.
  counter(cx+7.45,cz+.2,1.5,7.1);
  const cover=new THREE.Mesh(new THREE.BoxGeometry(1.45,1.0,7),vitrine);cover.position.set(cx+7.45,y+1.53,cz+.2);glassGroup.add(cover);
  for(let row=0;row<2;row++){
    box(steel,cx+7.45,y+1.06+row*.53,cz+.2,1.5,.035,7.1);
    for(let j=0;j<9;j++)loaf(cx+7.45,cz-2.6+j*.7,3,y+1.12+row*.53);
  }
  label('冷藏甜点 · KEEP COOL',cx+7.45,y+2.22,cz-3.37,1.5,Math.PI,'#72988a','#fffbe9');
  counter(cx+3.3,cz+5.6,7.8,1.35);box(steel,cx+4.5,y+1.43,cz+5.6,1.25,.69,.66);
  for(const dx of [-.36,.36]){inst(C,M.black,cx+4.5+dx,y+1.05,cz+5.17,.1,.02,.12);inst(C,M.ivory,cx+4.5+dx,y+1.2,cz+5.13,.09,.16,.09);}
  box(M.black,cx+1.25,y+1.4,cz+5.3,.46,.4,.08);label('COFFEE / PICK UP',cx+2.6,y+2.5,cz+6.95,5,Math.PI,'#d3d4bf','#344e42');
  for(let j=0;j<6;j++){box(M.cream,cx+.3+j*.65,y+1.27,cz+5.9,.37,.43,.27);label('BAKE',cx+.3+j*.65,y+1.3,cz+5.75,.32,Math.PI,'#e3dcc7','#537767');}
  // Booth seating along the left wall; stools do not invade the shopping loop.
  slab(M.teal,cx-8,y+.25,cz,1.0,6.1,.18,.31);box(M.teal,cx-8.4,y+1.0,cz,.18,1.0,6.1);
  for(const zz of [-2,0,2]){inst(C,M.marble,cx-6.65,y+.82,cz+zz,.56,.07,.56);inst(C,M.bronze,cx-6.65,y+.43,cz+zz,.055,.76,.055);room.blockers.push({x:cx-6.65,z:cz+zz,w:1.2,d:1.2});}
  for(let j=0;j<17;j++)box(M.wood,cx-7+j*.68,y+3.65,cz+5.7,.12,.18,2.7);
  label('麦屿 · BAKING THE AFTERNOON',cx-4.2,y+2.7,cz+6.99,6.7,Math.PI,'#c9c9b5','#496358');
}

export function addToySuperstore(api,room){
  const {box,slab,inst,sphere,tube,label,mats:M,unitCylinder:C}=api,{cx,cz,base:y}=room;
  const {goods}=createMerchandise(api);
  const colors=['#1c84be','#e2bd35','#cb4f4c','#67a155'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.57}));
  room.toyZones=['Tomica','Hot Wheels','Gundam / Transformers','Blocks','Plush','Cards'];
  for(let bay=0;bay<6;bay++){
    const x=cx-7.7+bay*3.05,m=colors[bay%4];box(m,x,y+1.7,cz+6.65,2.8,3.1,.5);
    label(['TOMICA 多美卡','HOT WHEELS 风火轮','模型 · 机甲','积木拼搭','毛绒伙伴','卡牌 · 盲盒'][bay],x,y+3.03,cz+6.34,2.65,Math.PI,['#126891','#a47522','#884647','#4b6c46'][bay%4],'#fffde6');
    for(let row=0;row<4;row++){box(M.ivory,x,y+.45+row*.65,cz+6.2,2.8,.05,.95);for(let j=0;j<4;j++)goods(['figure','blindbox','figure','stationery','plush','cards'][bay],x+(j-1.5)*.57,y+.49+row*.65,cz+6.15,.72,j+row);}
  }
  const islands=[[-4.3,-2.8,4.0,2.0,'TOMICA · 城市试驾',0],[4.2,-2.6,3.4,2.0,'风火轮 · 赛道体验',1],[-4.2,2,3.4,2,'积木 · 亲子拼搭',3],[4.2,2,3.4,2,'模型 · 收藏实验台',2]];
  for(const [dx,dz,w,d,name,index] of islands){const x=cx+dx,z=cz+dz;slab(colors[index],x,y+.12,z,w,d,.18,.55);box(M.ivory,x,y+.71,z,w+.08,.06,d+.08);label(name,x,y+.43,z-d/2-.03,w*.85,Math.PI,['#126891','#a47522','#884647','#4b6c46'][index],'#fffbea');
    if(index===0){box(M.darkMetal,x,y+.75,z,w-.2,.03,.56);box(M.darkMetal,x,y+.75,z,.56,.03,d-.1);for(let j=0;j<5;j++){box(colors[j%4],x-1.4+j*.7,y+.87,z,.4,.16,.23);box(M.blue,x-1.4+j*.7,y+1,z,.24,.11,.21);}for(const dx2 of [-1,1])for(const dz2 of [-.6,.6])box(M.cream,x+dx2,y+1.04,z+dz2,.44,.55,.35);}
    else if(index===1){for(const zz of [-.35,.35]){box(colors[1],x,y+.82,z+zz,3,.05,.19);tube(new THREE.Vector3(x-1.5,y+.84,z+zz),new THREE.Vector3(x-1.8,y+1.8,z+zz),.065,colors[1]);}goods('figure',x,y+.85,z,.85,2);}
    else if(index===3){for(let j=0;j<18;j++){const xx=x+(j%6-2.5)*.45,zz=z+(Math.floor(j/6)-1)*.45;box(colors[j%4],xx,y+.87,zz,.3,.25,.25);for(const off of [-.08,.08])inst(C,colors[j%4],xx+off,y+1.01,zz,.038,.04,.038);}}
    else for(let j=0;j<4;j++)goods('figure',x+(j-1.5)*.65,y+.78,z,1.25,j);
  }
  // Plush mascot and a low family seating ledge, kept clear of the centre aisle.
  goods('plush',cx-7.5,y+.2,cz+1.2,2.5,1);room.blockers.push({x:cx-7.5,z:cz+1.2,w:1.6,d:1.7});
  slab(colors[0],cx+7.75,y+.18,cz+1.3,1,4,.18,.32);
  for(let j=0;j<5;j++){sphere(colors[j%4],cx+(j-2)*2.2,y+3.35,cz-5.4,.23);}
  label('TOYS R US  ·  玩具反斗城',cx,y+3.32,cz-5.8,9.2,Math.PI,'#177cba','#fff4d3');
}
