import * as THREE from './vendor/three.module.js';
import {createMerchandise} from './merchandise.js?v=15';

// Entrance at the top of the supplied plan. The screen shields the dining room;
// the open end on visitor-right connects reception to the central dining aisle.
export function buildHaidilao(api,room){
  const {box,slab,inst,sphere,tube,label,glassGroup,mats:M,unitCylinder:C,unitTorus:T}=api,{cx,cz,base:y}=room;
  const mat=(color,r=.65,m=0)=>new THREE.MeshStandardMaterial({color,roughness:r,metalness:m});
  const red=mat('#ae282d',.74),seat=mat('#743e37',.88),steel=mat('#b8b8b0',.27,.75),cream=mat('#e4d8c4',.68),broth=mat('#ae3217',.24),clear=mat('#d4a44f',.28);
  const {food}=createMerchandise(api);room.haidilao={layout:'reference-20260923',tables:[],condiments:[],reception:true,screen:true};
  // Front desk and solid screen are separate fixtures, with a generous bypass.
  slab(red,cx+4.5,y+.12,cz-6.45,4.1,1.15,.17,.94);box(M.marble,cx+4.5,y+1.1,cz-6.45,4.2,.08,1.22);
  box(M.black,cx+3.55,y+1.38,cz-6.45,.4,.32,.07);label('海底捞 · 欢迎光临',cx+4.5,y+.65,cz-7.055,3.6,Math.PI,'#ac252a','#fff4df');
  room.checkout={x:cx+4.5,z:cz-6.45,width:4.1,depth:1.15,queue:{x:cx+1.5,z:cz-6.6}};
  box(cream,cx+2.4,y+1.3,cz-4.4,12.0,2.45,.25);
  for(let i=0;i<32;i++)box(i%5===0?red:M.wood,cx-3.45+i*.37,y+1.3,cz-4.555,.06,2.4,.045);
  label('海底捞火锅  HAIDILAO',cx+2.1,y+1.74,cz-4.6,7.1,Math.PI,'#a9272e','#fff3da');
  label('用餐区 →',cx-4.85,y+2.7,cz-4.3,2.15,Math.PI,'#a9272e','#fff3da');
  function bench(x,z,angle){
    const p=(dx,dz)=>[x+dx*Math.cos(angle)+dz*Math.sin(angle),z-dx*Math.sin(angle)+dz*Math.cos(angle)];
    const b=(m,dx,yy,dz,w,h,d)=>{const [xx,zz]=p(dx,dz);box(m,xx,y+yy,zz,w,h,d,angle);};
    b(M.wood,0,.22,0,1.92,.38,.67);b(seat,0,.49,0,1.92,.18,.7);b(seat,0,.98,.3,1.92,.91,.17);
    for(const dx of [-.61,0,.61])b(cream,dx,.98,.207,.015,.69,.012);
    for(const dx of [-.98,.98])b(M.wood,dx,.72,0,.065,.53,.69);
  }
  function dining(dx,dz,rot=0){
    const x=cx+dx,z=cz+dz;room.haidilao.tables.push({x,z,seats:4,backrests:true,food:true});
    const place=(a,b)=>[x+a*Math.cos(rot)+b*Math.sin(rot),z-a*Math.sin(rot)+b*Math.cos(rot)];
    box(M.wood,x,y+.4,z,1.3,.76,.76,rot);box(M.marble,x,y+.83,z,1.85,.09,1.25,rot);
    for(const side of [-1,1]){const p=place(0,side*1.1);bench(...p,rot+(side<0?Math.PI:0));}
    inst(C,steel,x,y+.905,z,.395,.1,.395);inst(T,steel,x,y+.965,z,.39,.39,.39,Math.PI/2);
    inst(C,broth,x,y+.957,z,.36,.01,.36);inst(new THREE.CylinderGeometry(.347,.347,.013,24,1,false,0,Math.PI),clear,x,y+.968,z);
    box(steel,x,y+.987,z,.018,.045,.69);for(const s of [-1,1])inst(T,steel,x+s*.46,y+.94,z,.075,.075,.075,0,Math.PI/2);
    for(let j=0;j<13;j++){const a=j*2.4,r=.08+(j%3)*.085;sphere(j%3===0?M.leafLight:j%3===1?M.ivory:M.coral,x+Math.cos(a)*r,y+.987+(j%2)*.008,z+Math.sin(a)*r,.045,.025,.035);}
    const kinds=['beef','mushrooms','greens','shrimp'];for(let j=0;j<4;j++){const p=place(j%2?.67:-.67,j<2?-.31:.31);food(kinds[j],p[0],y+.892,p[1],.6);}
    for(const side of [-1,1])for(const dx of [-.43,.43]){const p=place(dx,side*.51);inst(C,cream,p[0],y+.94,p[1],.095,.07,.095);inst(C,broth,p[0],y+.977,p[1],.076,.007,.076);box(M.walnut,p[0]+.13,y+.895,p[1],.016,.014,.23,rot);}
    box(M.darkMetal,x,y+3.66,z,.025,.4,.025);inst(new THREE.CylinderGeometry(.2,.33,.16,16),red,x,y+3.41,z);sphere(M.warmGlow,x,y+3.32,z,.2,.035,.2);
  }
  box(M.wood,cx,y+1.25,cz+7.39,17.6,2.1,.04);label('海底捞 · 好好吃饭',cx,y+2.95,cz+7.34,7.6,Math.PI,'#a9272e','#fff3da');
  // Perimeter booths plus a small central table, matching the hand-drawn zones.
  for(const x of [-7,7])for(const z of [-.4,4.35])dining(x,z);
  dining(-2.35,4.85,Math.PI/2);dining(2.3,4.85,Math.PI/2);dining(-2.4,.2);
  const sx=cx+2.1,sz=cz-3.4;slab(M.wood,sx,y+.12,sz,6.2,1.1,.1,.84);box(steel,sx,y+1.015,sz,6.28,.09,1.18);
  const sauces=[['姜末','#d5b95f'],['葱花','#40763b'],['蒜泥','#d9caa2'],['香菜','#315d32'],['辣椒','#9a301b'],['芝麻','#c9ae77'],['醋','#392017'],['蚝油','#3d261a'],['香油','#9d6225'],['酱油','#2c1a13'],['芝麻酱','#ad8548'],['花生碎','#b89059']];
  for(let i=0;i<sauces.length;i++){const [name,color]=sauces[i],x=sx+(i%6-2.5)*.91,z=sz+(i<6?-.26:.26),m=mat(color,i<6?.91:.27);inst(C,steel,x,y+1.09,z,.19,.075,.19);inst(C,m,x,y+1.128,z,.168,.012,.168);
    if(i<6||i===11)for(let k=0;k<18;k++){const a=k*2.4,r=.14*Math.sqrt((k+.5)/18);box(m,x+Math.cos(a)*r,y+1.15,z+Math.sin(a)*r,.026,.025,.026,a);}
    tube(new THREE.Vector3(x+.06,y+1.15,z+.06),new THREE.Vector3(x+.22,y+1.29,z+.16),.012,steel);sphere(steel,x+.045,y+1.15,z+.045,.045,.008,.035);
    label(name,x,y+1.27,z+.17,.64,0,'#ede4d2','#4c3b2e');room.haidilao.condiments.push(name);
  }
  const glass=new THREE.MeshPhysicalMaterial({color:'#eff8f5',transparent:true,opacity:.1,roughness:.09,depthWrite:false,side:THREE.DoubleSide});
  const shield=new THREE.Mesh(new THREE.BoxGeometry(6.1,.42,.025),glass);shield.position.set(sx,y+1.64,sz-.38);glassGroup.add(shield);
  for(const dx of [-3,3])box(steel,sx+dx,y+1.42,sz-.38,.035,.72,.035);
  label('自选小料 · SELF-SERVICE',sx,y+2.02,cz-4.25,5.2,0,'#a9272e','#fff3df');
  for(let j=0;j<8;j++)inst(C,cream,sx+2.85,y+1.08+j*.035,sz+.24,.16,.032,.16);
  room.haidilao.screenBounds={x:cx+2.4,z:cz-4.4,w:12,d:.25};room.haidilao.sauceBar={x:sx,z:sz,w:6.2,d:1.1};
}
