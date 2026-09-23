import * as THREE from './vendor/three.module.js';
import { createMerchandise } from './merchandise.js?v=15';



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
