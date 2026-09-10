import * as THREE from './vendor/three.module.js';
import { createMerchandise } from './merchandise.js?v=6';
import { createRetailDetails } from './retail-detail.js?v=6';
import { addSeafoodTank } from './water-features.js?v=6';
import { planCustomerRoute } from './shop-routes.js?v=6';

export const STORE_PLANS = {
  mainLeft:[
    {type:'jewelry',name:'璟序珠宝 · JING',wall:'#e0d5bf',floor:'#d6ccba',accent:'#44665e'},
    {type:'clothes',name:'叙织 · TEXTURE STUDIO',wall:'#dfded4',floor:'#c3bba9',accent:'#7b8373'},
    {type:'hotpot',name:'山隐 · 铜锅火锅',wall:'#996b4d',floor:'#858474',accent:'#733d2a'},
    {type:'cinema',name:'光幕 · LUMEN CINEMA',wall:'#363a42',floor:'#34333b',accent:'#854645'}
  ],
  mainRight:[
    {type:'toys',name:'MOMO · 杂物社',wall:'#bcd1cf',floor:'#d4d8cb',accent:'#de916a'},
    {type:'bags',name:'PELLE · 皮具工坊',wall:'#ac9275',floor:'#d1c0a8',accent:'#765038'},
    {type:'bistro',name:'炉边 · EMBER BISTRO',wall:'#b47b63',floor:'#a3977b',accent:'#496557'},
    {type:'ktv',name:'回声 · ECHO KTV',wall:'#3c394c',floor:'#343344',accent:'#5c627f'}
  ],
  gardenLeft:[
    {type:'jewelry',name:'石间 · 珠宝艺廊',wall:'#b6c3bf',floor:'#cfd7d0',accent:'#2f4e45'},
    {type:'bags',name:'NOMA · 旅行箱包',wall:'#c4b799',floor:'#aba899',accent:'#747a48'},
    {type:'chinese',name:'青庭 · 粤味中餐',wall:'#a7b39a',floor:'#c3b598',accent:'#537359'},
    {type:'spa',name:'沐禾 · 足浴茶疗',wall:'#b9af96',floor:'#9a9583',accent:'#687b68'}
  ],
  gardenRight:[
    {type:'toys',name:'TOY LAB · 收藏实验室',wall:'#c8c3d7',floor:'#dcdae0',accent:'#8c87a2'},
    {type:'clothes',name:'LINEN · 日常衣橱',wall:'#d9c6b5',floor:'#c0a38c',accent:'#a38572'},
    {type:'japanese',name:'凪 · 寿司割烹',wall:'#c5b394',floor:'#a49984',accent:'#495b55'},
    {type:'ktv',name:'星屿 · STAR KTV',wall:'#424253',floor:'#373643',accent:'#725775'}
  ]
};
export function storeFor(cx,floor,secondary){return STORE_PLANS[(secondary?'garden':'main')+(cx<0?'Left':'Right')][floor];}

export function createRetailRoom(api,cx,base,cz,w,d,spec){
  const room={cx,base,cz,w,d,spec,entry:{x:cx,z:cz-d/2,width:2.8},blockers:[],secureCases:[],spotlights:[],mirrors:[],fittingRooms:[]};api.runtime.rooms.push(room);
  const remember=(x,y,z,width,height,depth,rotation=0)=>{
    if(width>.2&&depth>.2&&height>.13&&y-height/2<base+1.7&&y+height/2>base+.34){
      const c=Math.abs(Math.cos(rotation)),s=Math.abs(Math.sin(rotation));room.blockers.push({x,z,w:width*c+depth*s,d:depth*c+width*s});
    }
  };
  const box=(m,x,y,z,width,height,depth,rotation=0,cast=true)=>{remember(x,y,z,width,height,depth,rotation);api.box(m,x,y,z,width,height,depth,rotation,cast);};
  const slab=(m,x,y,z,width,depth,r,height)=>{remember(x,y+height/2,z,width+.18,height,depth+.18);api.slab(m,x,y,z,width,depth,r,height);};
  const {inst,sphere,tube,label,root,glassGroup,mats:M,unitCylinder,unitTorus,bag,bear,necklace,displayCase,vitrine}=api;
  const detail=createRetailDetails({...api,box,slab},room),{goods,food}=createMerchandise(api);
  const material=(color,roughness=.7,metalness=0,extra={})=>new THREE.MeshStandardMaterial({color,roughness,metalness,...extra});
  const theatre=['cinema','ktv'].includes(spec.type);
  const wall=material(spec.wall,.88,0,{normalMap:M.concrete.normalMap||null,normalScale:new THREE.Vector2(.055,.055)});
  const floor=material(spec.floor,theatre?.95:.68,0,{map:theatre?null:M.marble.map,normalMap:M.marble.normalMap||null,normalScale:new THREE.Vector2(.11,.11),roughnessMap:M.marble.roughnessMap||null});
  const accent=material(spec.accent,.76,0,{normalMap:M.tan.normalMap||null,normalScale:new THREE.Vector2(.22,.22),roughnessMap:M.tan.roughnessMap||null});
  const timber=material(spec.type==='hotpot'?'#c79a74':'#d1b18a',.78,0,{map:M.wood.map,normalMap:M.wood.normalMap||null,normalScale:new THREE.Vector2(.25,.25),roughnessMap:M.wood.roughnessMap||null});
  const back=cz+d/2-1,front=cz-d/2+1.4;
  slab(floor,cx,base+.065,cz,w-.5,d-.5,1.7,.05);
  box(wall,cx,base+1.85,back+.48,w-1,3.6,.22);
  for(const side of [-1,1])box(wall,cx+side*(w/2-.53),base+1.85,cz+.55,.18,3.6,d-3.8);
  for(let j=0;j<4;j++)box(M.bronze,cx,base+.145,cz-d/2+1+j*(d-2)/3,w-2,.012,.012,0,false);
  const titleColor=['cinema','ktv'].includes(spec.type)?'#eddfb8':'#f0e5ce';
  label(spec.name,cx,base+3.58,cz-d/2-.025,8.6,Math.PI,spec.accent,titleColor);
  function lineLight(x,z,width=1.8){box(M.warmGlow,x,base+3.86,z,width,.024,.035,0,false);}
  function screen(text,x,y,z,width,height,bg='#182731',fg='#eee5cc'){
    (room.screens||=[]).push({x,y,z,width,height});
    if(typeof document==='undefined')return;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*height/width);const c=canvas.getContext('2d');
    const grad=c.createLinearGradient(0,0,1024,canvas.height);grad.addColorStop(0,bg);grad.addColorStop(1,'#111820');c.fillStyle=grad;c.fillRect(0,0,1024,canvas.height);
    c.strokeStyle=fg+'55';c.lineWidth=1;c.strokeRect(38,38,948,canvas.height-76);c.textAlign='center';c.fillStyle=fg;c.font='46px "Microsoft YaHei", sans-serif';
    const lines=text.split('\n');lines.forEach((t,i)=>c.fillText(t,512,canvas.height/2+(i-(lines.length-1)/2)*64));
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t}));mesh.rotation.y=Math.PI;mesh.position.set(x,y,z);root.add(mesh);
    box(M.darkMetal,x,y,z+.035,width+.15,height+.15,.07);
  }
  function chair(x,y,z,angle=0,color=accent){
    const pt=(lx,lz)=>[x+lx*Math.cos(angle)+lz*Math.sin(angle),z-lx*Math.sin(angle)+lz*Math.cos(angle)];
    const b=(m,lx,yy,lz,sx,sy,sz)=>{const p=pt(lx,lz);box(m,p[0],y+yy,p[1],sx,sy,sz,angle);};
    b(color,0,.47,0,.52,.16,.55);b(color,0,.78,.22,.52,.51,.115);
    for(const lx of [-.2,.2])for(const lz of [-.2,.2])b(M.darkMetal,lx,.24,lz,.035,.45,.035);
    for(const lx of [-.29,.29])b(timber,lx,.64,0,.055,.065,.44);
  }
  function pendant(x,z,y=2.85,size=.28){box(M.bronze,x,base+(y+3.9)/2,z,.014,3.9-y,.014);sphere(M.whiteGlow,x,base+y,z,size,size*.55,size);}
  function plate(x,y,z,food=true){inst(unitCylinder,M.ivory,x,y,z,.16,.021,.16);if(food){for(let j=0;j<5;j++)sphere(j%2?M.leafLight:M.coral,x+Math.cos(j*2.4)*.07,y+.028,z+Math.sin(j*2.4)*.07,.037,.02,.037);}}
  function table(x,z,hotpot=false){
    room.blockers.push({x,z,w:hotpot?2.3:1.6,d:hotpot?2.3:1.6});
    inst(unitCylinder,M.darkMetal,x,base+.42,z,.095,.75,.095);inst(unitCylinder,M.darkMetal,x,base+.14,z,.42,.055,.42);inst(unitCylinder,hotpot?M.darkMarble:M.marble,x,base+.86,z,hotpot?1:.68,.09,hotpot?1:.68);
    if(hotpot){
      inst(unitCylinder,M.bronze,x,base+.98,z,.34,.18,.34);inst(unitTorus,M.gold,x,base+1.085,z,.33,.33,.33,Math.PI/2);
      inst(unitCylinder,M.coral,x,base+1.078,z,.29,.012,.29);box(M.gold,x,base+1.095,z,.028,.08,.57);
      for(let j=0;j<8;j++){const a=j*2.4;sphere(j%2?M.leafLight:M.ivory,x+Math.cos(a)*.2,base+1.098,z+Math.sin(a)*.2,.045,.02,.04);}
      for(const dx of [-.41,.41])inst(unitTorus,M.bronze,x+dx,base+1.0,z,.084,.084,.084,0,Math.PI/2);
    }
    for(let j=0;j<4;j++){const a=j*Math.PI/2,r=hotpot?1.36:1.0;chair(x+Math.sin(a)*r,base,z+Math.cos(a)*r,a);plate(x+Math.sin(a)*(hotpot?.72:.43),base+.92,z+Math.cos(a)*(hotpot?.72:.43));}
    if(hotpot){
      const dishes=['beef','mushrooms','greens','shrimp','tofu','meatballs','lotus'];
      for(let j=0;j<4;j++){const a=j*Math.PI/2+Math.PI/4;food(dishes[(j+Math.abs(Math.round(x+z)))%dishes.length],x+Math.sin(a)*.7,base+.925,z+Math.cos(a)*.7,.82);}
      for(const dx of [-.26,.26]){inst(unitCylinder,M.ivory,x+dx,base+.954,z+.51,.08,.055,.08);inst(unitCylinder,dx<0?M.coral:M.tan,x+dx,base+.984,z+.51,.066,.005,.066);}
      for(const dx of [-.76,.76]){inst(unitCylinder,M.teal,x+dx,base+1.01,z+.19,.055,.2,.055);box(M.bronze,x+dx,base+.942,z-.21,.012,.012,.31);}
    }
    pendant(x,z,hotpot?3.0:2.95,hotpot?.45:.24);
  }
  function garment(x,y,z,color,style=0){
    const shape=new THREE.Shape(),kind=style%5,hem=kind===1?-.55:kind===2?-1.05:kind===3?-.85:-.65;
    const outline=kind===1||kind===2?[[-.28,0],[-.3,hem],[-.05,hem],[0,hem*.32],[.05,hem],[.3,hem],[.28,0]]:kind===3?[[-.13,0],[-.22,-.04],[-.19,-.36],[-.4,hem],[.4,hem],[.19,-.36],[.22,-.04],[.13,0],[0,-.08]]:[[-.11,0],[-.3,-.08],[-.48,-.24],[-.36,-.35],[-.25,-.24],[-.29,hem],[.29,hem],[.25,-.24],[.36,-.35],[.48,-.24],[.3,-.08],[.11,0],[0,-.055]];
    outline.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
    const inventory=api.stats.inventory,name=['summerTshirt','shorts','linenTrousers','summerDress','summerBlouse'][kind];inventory[name]=(inventory[name]||0)+1;
    const g=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.013,bevelThickness:.012,bevelSegments:1,steps:1});inst(g,color,x,y,z);
    if(kind!==1&&kind!==2)for(let j=-1;j<=1;j++)box(color,x+j*.13,y+hem*.58,z-.025,.02,Math.abs(hem)*.6,.012);
    const a=new THREE.Vector3(x-.29,y+.01,z),b=new THREE.Vector3(x,y+.17,z),c=new THREE.Vector3(x+.29,y+.01,z);tube(a,b,.008,M.bronze);tube(b,c,.008,M.bronze);tube(a,c,.008,M.bronze);inst(unitTorus,M.gold,x,y+.215,z,.039,.039,.039);
  }
  function sofa(x,y,z,width=2.6,color=accent){slab(color,x,y+.22,z,width,.86,.16,.3);box(color,x,y+.76,z+.36,width,.66,.16);for(const dx of [-width/2+.08,width/2-.08])box(color,x+dx,y+.6,z,.16,.52,.83);box(M.darkMetal,x,y+.1,z,width-.25,.17,.62);}

  if(['jewelry','toys','bags'].includes(spec.type)){
    const jewelry=spec.type==='jewelry',toys=spec.type==='toys';
    const bays=jewelry?4:toys?6:3;
    for(let b=0;b<bays;b++){
      const x=cx+(b-(bays-1)/2)*(w-3)/bays;const width=(w-3)/bays-.3;
      box(jewelry?accent:timber,x,base+1.85,back,width,3.18,.18);
      box(wall,x,base+1.85,back-.12,width-.16,3.0,.04);
      const category=jewelry?['gold','jade','agate','watch'][b%4]:['blindbox','figure','plush','cards','stationery','blindbox'][b%6];
      if(jewelry||toys)label(({gold:'黄金',jade:'翡翠',agate:'玛瑙',watch:'腕表',blindbox:'盲盒',figure:'手办',plush:'毛绒',cards:'卡牌',stationery:'文具'})[category],x,base+3.1,back-.19,width*.66,Math.PI,spec.accent,'#fff2d8');
      for(let k=0;k<(toys?4:3);k++){
        const y=base+.55+k*(toys?.69:.86);box(toys?M.ivory:M.marble,x,y,back-.42,width,.06,.69);box(M.warmGlow,x,y+(toys?.63:.79),back-.24,width-.12,.025,.035,0,false);
        for(let j=0;j<3;j++){const xx=x+(j-1)*.64;if(jewelry)goods(k===2&&b===0?'necklace':category,xx,y+.04,back-.49,.92,j+k);else if(toys)goods(category,xx,y+.04,back-.44,.75,(j+b+k)%5);else goods(['tote','crossbody','backpack','wallet','scarf','sunglasses'][b*2+k%2],xx,y+.04,back-.47,.98,j+b+k);}
      }
      if(jewelry){detail.cover(x,base+.58,back-.49,width,2.38,.75);detail.spotlight(x,back-1.4,x,base+1.65,back-.5);}
      if(!toys&&!jewelry){label(['手袋 · TOTES','旅行 · TRAVEL','配饰 · ACCESSORIES'][b],x,base+3.18,back-.2,width*.72,Math.PI,spec.accent,'#f3e5c7');detail.cover(x,base+.57,back-.48,width,2.4,.78);}
    }
    if(jewelry){
      for(let j=0;j<4;j++){
        const x=cx+(j%2?1:-1)*(j<2?w*.2:w*.3),z=j<2?front+.7:cz+2.2,width=j<2?3.2:2.45,kind=['gold','watch','jade','agate'][j];
        slab(j<2?M.marble:accent,x,base+.12,z,width,1.02,.13,.91);box(M.velvet,x,base+1.055,z,width-.2,.045,.82);
        detail.cover(x,base+1.065,z,width,.52,.97);detail.spotlight(x,z-.25,x,base+1.15,z);
        for(let i=0;i<4;i++)goods(kind,x+(i-1.5)*(width-.6)/4,base+1.09,z,.95,i);
        label(['黄金 · GOLD','腕表 · TIME','翡翠 · JADE','玛瑙 · AGATE'][j],x,base+.77,z-.521,width*.72,Math.PI,spec.accent,'#eedfb8');
      }
      inst(unitCylinder,accent,cx,base+.52,cz-1.3,1.08,.84,1.08);inst(unitCylinder,M.marble,cx,base+.98,cz-1.3,1.13,.075,1.13);necklace(cx,base+1.04,cz-1.3,1.22);
      room.blockers.push({x:cx,z:cz-1.3,w:2.3,d:2.3});detail.cover(cx,base+1.035,cz-1.3,2.26,.95,2.26);detail.spotlight(cx,cz-1.65,cx,base+1.4,cz-1.3);
      box(timber,cx,base+.65,back-1.4,3.2,1.13,.9);
      for(const dx of [-3.7,3.7]){inst(unitTorus,M.gold,cx+dx,base+3.15,cz,1.05,1.05,1.05,Math.PI/2);for(let j=0;j<6;j++){const a=j*Math.PI/3;pendant(cx+dx+Math.cos(a),cz+Math.sin(a),3.1,.1);}}
    }else if(toys){
      const stalls=[{x:-4.8,z:front+.85-cz,w:3.2,d:1.25,kind:'blindbox',title:'盲盒上新'},{x:3,z:front+1-cz,w:2.5,d:1.4,kind:'figure',title:'手办收藏'},{x:-4.8,z:2,w:3.5,d:1.85,kind:'cards',title:'卡牌交换台'},{x:4.8,z:2.3,w:2.6,d:1.2,kind:'stationery',title:'生活小物'}];
      for(const [k,stall] of stalls.entries()){
        const x=cx+stall.x,z=cz+stall.z;slab(k%2?M.ivory:accent,x,base+.12,z,stall.w,stall.d,.18,.73);
        for(let i=0;i<5;i++)goods(stall.kind,x+(i-2)*.48,base+.91,z-.12,.9,i);
        if(stall.kind==='blindbox')for(let i=0;i<4;i++)goods('blindbox',x+(i-1.5)*.46,base+.91,z+.35,.9,i+2);
        label(stall.title,x,base+.56,z-stall.d/2-.035,stall.w*.73,Math.PI,spec.accent,'#fff0d4');
        if(stall.kind==='cards')for(const dx of [-1.1,1.1])chair(x+dx,base,z+1.35,0);
      }
      inst(unitCylinder,M.ivory,cx+6.1,base+.45,cz+5.1,.74,.7,.74);goods('plush',cx+6.1,base+.85,cz+5.1,1.45,0);room.blockers.push({x:cx+6.1,z:cz+5.1,w:1.5,d:1.5});
      box(timber,cx+.5,base+.67,cz+4.7,3.0,1.1,.85);box(M.black,cx+1.1,base+1.39,cz+4.7,.44,.35,.07);
      for(let i=0;i<6;i++)pendant(cx+(i-2.5)*2.4,cz,3.1,.25);
    }else{
      for(let j=0;j<2;j++){const x=cx+(j?3.6:-3.6);slab(accent,x,base+.12,front+1.0,2.5,1.15,.18,1.02);goods(j?'crossbody':'tote',x-.56,base+1.2,front+1,1.25,j);goods('wallet',x+.55,base+1.2,front+1,1.25,j+1);detail.cover(x,base+1.19,front+1,2.5,.85,1.15);detail.spotlight(x,front+.75,x,base+1.4,front+1);}
      for(const dx of [-1.2,1.2]){slab(M.marble,cx+dx,base+.15,cz+3.4,1.5,1.0,.1,.22);goods('suitcase',cx+dx,base+.5,cz+3.4,1.25,dx<0?0:2);}
      sofa(cx-4.3,base,cz+2.4,2.8);inst(unitCylinder,M.marble,cx-4.3,base+.48,cz+.6,.68,.07,.68);box(timber,cx+4.2,base+.65,cz+2.4,3.0,1.1,1.05);goods('backpack',cx+3.6,base+1.24,cz+2.4,1.1,0);goods('scarf',cx+4.6,base+1.24,cz+2.4,1.1,1);detail.cover(cx+4.2,base+1.22,cz+2.4,3,.92,1.05);detail.spotlight(cx+4.2,cz+2,cx+4.2,base+1.5,cz+2.4);
      for(const dx of [-4,0,4])lineLight(cx+dx,cz,2.7);
    }
  }else if(spec.type==='clothes'){
    const fabric=[M.ivory,M.blue,M.tan,M.black,M.pink];
    for(const dx of [-5.3,5.3])for(const dz of [-2.4,1.9]){
      room.blockers.push({x:cx+dx,z:cz+dz,w:4.3,d:.65});
      for(const sx of [-1.9,1.9]){box(M.bronze,cx+dx+sx,base+1.23,cz+dz,.035,2.2,.035);box(M.darkMetal,cx+dx+sx,base+.15,cz+dz,.12,.07,.65);}
      tube(new THREE.Vector3(cx+dx-1.9,base+2.32,cz+dz),new THREE.Vector3(cx+dx+1.9,base+2.32,cz+dz),.025,M.bronze);
      for(let j=0;j<7;j++)garment(cx+dx+(j-3)*.48,base+2.08,cz+dz,fabric[(j+(dx>0?2:0))%5],j);
    }
    slab(M.marble,cx,base+.1,cz,3,1.6,.18,.72);for(let j=0;j<3;j++)for(let k=0;k<4;k++)box(fabric[(j+k)%5],cx+(j-1)*.82,base+.88+k*.085,cz,.62,.075,.82);
    detail.fitting();
    for(const dx of [-4.5,4.5]){slab(timber,cx+dx,base+.13,front+.15,3.1,.83,.12,.43);for(let j=0;j<4;j++)goods(j%2?'sandals':'sneakers',cx+dx+(j-1.5)*.68,base+.63,front+.15,.9,j);}
    label('SUMMER / 亚麻 · 短裤 · 凉鞋',cx,base+3.18,back-.17,4,Math.PI,spec.accent,'#e4dfd3');for(const dx of [-5,0,5])lineLight(cx+dx,cz,3.3);
  }else if(spec.type==='hotpot'){
    for(const dx of [-4.4,4.4])for(const dz of [-3.7,.8])table(cx+dx,cz+dz,true);
    for(let i=0;i<48;i++)box(timber,cx-w/2+1+i*(w-2)/47,base+1.9,back-.16,.075,3.6,.12);
    for(const dx of [-4.4,4.4])for(const dz of [-3.7,.8]){inst(new THREE.CylinderGeometry(.13,.46,.55,16),M.bronze,cx+dx,base+3.24,cz+dz);box(M.darkMetal,cx+dx,base+3.7,cz+dz,.22,.55,.22);}
    addSeafoodTank({...api,box},room,cx-4.5,back-1.25);
    // A dedicated self-service station keeps food trays out of the main aisle.
    box(timber,cx+4.1,base+.59,back-1.05,4.0,1.05,1.0);box(M.marble,cx+4.1,base+1.16,back-1.05,4.1,.08,1.08);
    ['beef','mushrooms','greens','shrimp','tofu','meatballs','lotus'].forEach((kind,i)=>food(kind,cx+4.1+(i-3)*.51,base+1.22,back-1.1,.78));
    label('鲜切 · 菌菇 · 时蔬',cx+4.1,base+1.8,back-.21,3.8,Math.PI,spec.accent,'#edd5ab');
  }else if(spec.type==='bistro'){
    room.menu=['steak','pasta','salad'];
    for(const dx of [-5.7,-1.8])for(const [j,dz] of [-3.5,.1,3.6].entries()){table(cx+dx,cz+dz);food(room.menu[j],cx+dx,base+.96,cz+dz,1.25);}
    box(timber,cx+5.2,base+.62,cz+.7,3.6,1.0,6.0);box(M.marble,cx+5.2,base+1.17,cz+.7,3.8,.085,6.2);
    for(let j=0;j<5;j++){chair(cx+2.75,base+.21,cz-1.8+j*1.2,-Math.PI/2);plate(cx+3.8,base+1.22,cz-1.8+j*1.2);}
    box(accent,cx+5.2,base+2.1,back,4.2,2.3,.24);for(let k=0;k<3;k++){box(timber,cx+5.2,base+.9+k*.8,back-.4,4.2,.065,.5);for(let j=0;j<8;j++)inst(unitCylinder,j%2?M.teal:M.gold,cx+2.4+j*.55,base+1.15+k*.8,back-.42,.07,.42,.07);}
    for(let j=0;j<3;j++)pendant(cx+5.2,cz-1.2+j*2,2.75,.36);
    label('炭烤牛排 / 意面 / 沙拉',cx,base+3.1,back-.2,5,Math.PI,spec.accent,'#ffe6be');
  }else if(spec.type==='japanese'){
    room.menu=['sushi','sashimi','tempura'];
    box(timber,cx+4.5,base+.65,cz+.7,2.3,1.1,7.4);box(M.marble,cx+4.5,base+1.26,cz+.7,2.45,.1,7.5);
    for(let j=0;j<6;j++){chair(cx+2.55,base+.24,cz-2.3+j*1.16,-Math.PI/2);food(room.menu[j%3],cx+3.75,base+1.32,cz-2.3+j*1.16,1.35);}
    detail.cover(cx+4.85,base+1.33,cz+.7,.85,.45,6.5);
    for(const dz of [-2.8,2.6]){table(cx-4.1,cz+dz);food('sushi',cx-4.1,base+.96,cz+dz,1.4);}
    for(let i=0;i<24;i++)box(timber,cx-w/2+1+i*(w-2)/23,base+2,back-.1,.06,3.5,.13);
    label('寿司 · 刺身 · 天妇罗 / OMAKASE',cx,base+3.1,back-.21,6,Math.PI,spec.accent,'#fff0cf');
  }else if(spec.type==='chinese'){
    room.menu=['dumplings','roastduck','greens'];
    for(const dx of [-4.2,4.2])for(const dz of [-2.8,2.7]){
      table(cx+dx,cz+dz);inst(unitCylinder,M.marble,cx+dx,base+.97,cz+dz,.59,.04,.59);
      for(let j=0;j<3;j++)food(room.menu[j],cx+dx+Math.sin(j*2.1)*.32,base+1.02,cz+dz+Math.cos(j*2.1)*.32,.95);
    }
    box(timber,cx,base+.73,back-1,4.2,1.2,1);for(let j=0;j<5;j++){inst(unitCylinder,M.ivory,cx+(j-2)*.7,base+1.45,back-1,.2,.13,.2);inst(unitTorus,M.bronze,cx+(j-2)*.7,base+1.52,back-1,.2,.2,.2,Math.PI/2);}
    label('粤式点心 · 烧味 · 清蒸时蔬',cx,base+3.15,back-.2,5.5,Math.PI,spec.accent,'#f4e3b8');
    for(const dx of [-4.2,4.2])for(let i=0;i<10;i++)box(timber,cx+dx-1.5+i*.33,base+1.8,cz+.05,.055,3.2,.12);
  }else if(spec.type==='cinema'){
    screen('LUMEN CINEMA\n潮 汐 之 后 · 即 将 放 映',cx,base+2.19,back-.1,16.6,3.28,'#293d50','#e4c798');
    for(let row=0;row<4;row++){
      const z=cz+1.7-row*1.55,y=base+.13+row*.18;api.box(M.darkMetal,cx,y-.025,z,14.4,.12+row*.06,1.5);
      for(const side of [-1,1])for(let seat=0;seat<5;seat++)chair(cx+side*(1.45+seat*1.12),y,z,Math.PI,accent);
      for(const dx of [-7.4,0,7.4])box(M.warmGlow,cx+dx,y+.018,z-.69,.06,.018,1.35,0,false);
    }
    for(const side of [-1,1])for(let j=0;j<11;j++)box(M.darkMetal,cx+side*(w/2-.7),base+1.95,cz-d/2+2+j*1.12,.13,3.6,.27);
    screen('光幕\nCINEMA\n今日放映',cx+8.2,base+1.94,front+.3,1.18,2.2,'#724533');
  }else if(spec.type==='spa'){
    for(const dx of [-4.4,4.4])for(const dz of [-1.8,3.3]){
      const x=cx+dx,z=cz+dz;sofa(x,base,z,2.5,accent);slab(M.ivory,x,base+.22,z-.65,2.4,.95,.15,.23);
      for(const off of [-.6,.6]){inst(unitCylinder,M.walnut,x+off,base+.35,z-1.5,.32,.48,.32);inst(unitCylinder,M.water,x+off,base+.57,z-1.5,.27,.018,.27);}
      box(timber,x+1.5,base+.52,z,.55,.78,.7);for(let j=0;j<3;j++)box(M.ivory,x+1.5,base+.95+j*.075,z,.38,.065,.49);
      for(let j=0;j<10;j++)box(timber,x-1.9,base+1.6,z-1.2+j*.28,.06,2.9,.08);
    }
    box(timber,cx,base+.6,back-.7,3.0,1,.85);label('沐禾 · 足浴 / 茶疗 / 放松',cx,base+3.0,back-.21,4.7,Math.PI,spec.accent,'#f4e7cc');
  }else if(spec.type==='ktv'){
    const ledPink=material('#db83ae',.4,0,{emissive:'#d558a1',emissiveIntensity:.75}),ledBlue=material('#86bcd3',.4,0,{emissive:'#629bd2',emissiveIntensity:.65});
    box(wall,cx,base+1.92,cz+2,.22,3.65,9.5);
    for(const side of [-1,1]){
      const x=cx+side*4.6,led=side<0?ledPink:ledBlue;
      sofa(x,base,cz-.6,4.5,accent);sofa(x,base,cz+4.4,4.5,accent);
      slab(M.darkMarble,x,base+.22,cz+1.5,3.2,1.5,.26,.36);
      for(let j=0;j<3;j++){inst(unitCylinder,M.bronze,x+(j-1)*.73,base+.7,cz+1.5,.08,.18,.08);sphere(M.black,x+(j-1)*.7,base+.65,cz+1.2,.04);box(M.darkMetal,x+(j-1)*.7,base+.62,cz+1.0,.045,.055,.25);}
      screen('ECHO\n回声 · 私享包厢',x,base+2.5,back-.16,4.8,2.05,side<0?'#5f3154':'#28485f');
      for(const dx of [-3.4,3.4])box(led,x+dx,base+3.75,cz+1,.035,.035,9.3,0,false);
      for(let k=0;k<15;k++)box(accent,x-3.4+k*.48,base+1.8,back-.03,.34,3.4,.1,0);
      label(side<0?'01 · ROSE':'02 · BLUE',x,base+2.65,front+.5,3,Math.PI,spec.accent,'#e3dce8');
    }
  }
  // Local fittings stay warm, while daylight and contact shadows define the room.
  if(!['cinema','ktv'].includes(spec.type))for(const dx of [-w*.31,0,w*.31]){
    box(M.darkMetal,cx+dx,base+3.9,cz,.06,.065,d-3);
    for(let j=0;j<4;j++)box(M.whiteGlow,cx+dx,base+3.855,cz-d/2+2.2+j*(d-4.4)/3,.12,.025,.12,0,false);
  }
  if(spec.type==='hotpot')room.menu=['beef','mushrooms','greens','shrimp','tofu','meatballs','lotus'];
  detail.checkout();
  room.route=planCustomerRoute(room,root,api.runtime.routes);
  return room;
}
