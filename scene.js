import * as THREE from './vendor/three.module.js';
import { createRetailRoom, storeFor, STORE_PLANS } from './interiors.js?v=6';
import { buildAtrium } from './atrium.js?v=6';
import { buildRooftop } from './rooftop.js?v=6';
import { addAutomaticDoor,updateRetail } from './retail-detail.js?v=6';
import { addFountain } from './water-features.js?v=6';

// Model coordinates are metres, estimated from the three supplied photographs.
export const LOCATIONS = {
  front:{eye:[0,6.8,-48],target:[0,9,1],title:'建筑正面',description:'双翼立面与中央通廊'},
  aerial:{eye:[43,34,-41],target:[0,7.8,11],title:'建筑全貌',description:'四层商业、层叠露台与开放庭院'},
  courtyard:{eye:[.8,2.1,13],target:[-1,3.2,29],title:'庭院内街',description:'玻璃店面、树影与景石花园'},
  atrium:{eye:[6.7,2.4,43.15],target:[-2.8,8.1,54.1],title:'扶梯中庭',description:'通高采光顶、层叠扶梯与玻璃电梯'},
  jewelry:{eye:[-15.4,1.9,-4.1],target:[-14.6,1.7,4.8],title:'珠宝空间',description:'通透橱窗与层层递进的珠宝陈列'},
  toys:{eye:[15.6,1.9,-4.2],target:[15,1.6,4.5],title:'潮玩店铺',description:'玩偶展台、收藏陈列与暖光货架'},
  clothes:{eye:[-16,6.6,-4.8],target:[-16,6.4,3],title:'2F · 叙织服装',description:'独立衣架、叠装陈列与试衣区'},
  bags:{eye:[16,6.6,-4.8],target:[16,6.4,3],title:'2F · PELLE 皮具',description:'皮具展示台与休憩洽谈区'},
  hotpot:{eye:[-16,11.2,-6.7],target:[-16,10.9,2.9],title:'3F · 山隐火锅',description:'铜锅餐桌、木饰面与排烟装置'},
  bistro:{eye:[16,11.2,-6],target:[17.5,10.9,3],title:'3F · 炉边餐厅',description:'小圆桌、开放式吧台与餐饮陈列'},
  cinema:{eye:[-16,15.9,-5.7],target:[-16,16.0,5.9],title:'4F · 光幕影院',description:'取票前厅、阶梯座椅与放映厅'},
  ktv:{eye:[16,15.85,-5],target:[20,16.0,3.9],title:'4F · 回声 KTV',description:'独立包厢、沙发与点唱屏幕'},
  chinese:{eye:[-13.8,11.15,17],target:[-13.8,11.0,28],title:'3F · 青庭中餐',description:'粤式点心、烧味与茶台'},
  japanese:{eye:[13.8,11.15,17],target:[16,11.0,27],title:'3F · 凪日料',description:'寿司吧、刺身冷柜与天妇罗'},
  spa:{eye:[-13.8,15.8,17],target:[-13.8,15.7,28],title:'4F · 沐禾足浴',description:'足浴休憩区、茶台与前台'},
  starktv:{eye:[13.8,15.8,17],target:[18,16,29],title:'4F · 星屿 KTV',description:'后排四层娱乐空间与独立包厢'},
  gardenjewelry:{eye:[-13.8,1.9,17],target:[-13.8,1.7,28],title:'1F · 石间珠宝',description:'宝石展箱、聚光顶灯与环绕陈列'},
  gardentoys:{eye:[13.8,1.9,17],target:[13.8,1.7,28],title:'1F · TOY LAB',description:'盲盒、卡牌、手办与生活小物'},
  travel:{eye:[-13.8,6.55,17],target:[-13.8,6.4,28],title:'2F · NOMA 箱包',description:'旅行箱包、配饰与咨询区'},
  linen:{eye:[13.8,6.55,17],target:[13.8,6.4,28],title:'2F · LINEN 衣橱',description:'夏日服装、鞋履、试衣间与全身镜'},
  roof:{eye:[30,29,26],target:[2,19.6,0],title:'屋顶花园与球场',description:'空中花园、小型足球练习场与连桥'},
  roofstairs:{eye:[18.5,17.8,18],target:[13.8,16.4,11.4],title:'屋顶步行楼梯',description:'从四层露台经折返楼梯到达屋顶'}
};

export function createArchitecture({maps={}}={}){
  const root=new THREE.Group();root.name='Riverside architecture';
  const glassGroup=new THREE.Group();glassGroup.name='Architectural glass';root.add(glassGroup);
  const routes=new THREE.Group();routes.name='Customer circulation guides';routes.visible=false;root.add(routes);
  const runtime={rooms:[],doors:[],spots:[],updates:[],routes};
  const batches=new Map();const stats={storeys:4,retailRooms:0,storeNames:[],storeTypes:[],necklaces:0,handbags:0,toys:0,trees:0};
  let seed=48319;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const random=(a,b)=>a+(b-a)*rand();
  const unitBox=new THREE.BoxGeometry(1,1,1);
  const unitSphere=new THREE.SphereGeometry(1,14,10);
  const unitIco=new THREE.IcosahedronGeometry(1,1);
  const unitCylinder=new THREE.CylinderGeometry(1,1,1,10);
  const unitTorus=new THREE.TorusGeometry(1,.07,6,28);
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),euler=new THREE.Euler(),v=new THREE.Vector3(),s=new THREE.Vector3();
  const geocache=new Map();
  function inst(geo,mat,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,cast=true){
    const key=geo.uuid+mat.uuid+cast;
    if(!batches.has(key)) batches.set(key,{geo,mat,cast,matrices:[]});
    q.setFromEuler(euler.set(rx,ry,rz));matrix.compose(v.set(x,y,z),q,s.set(sx,sy,sz));
    batches.get(key).matrices.push(matrix.clone());
  }
  const box=(mat,x,y,z,w,h,d,ry=0,cast=true)=>inst(unitBox,mat,x,y,z,w,h,d,0,ry,0,cast);
  const sphere=(mat,x,y,z,sx,sy=sx,sz=sx)=>inst(unitSphere,mat,x,y,z,sx,sy,sz);
  const tube=(a,b,r,mat)=>{const delta=new THREE.Vector3().subVectors(b,a),mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());const m=new THREE.Matrix4().compose(mid,rotation,new THREE.Vector3(r,delta.length(),r));const key=unitCylinder.uuid+mat.uuid+true;if(!batches.has(key))batches.set(key,{geo:unitCylinder,mat,cast:true,matrices:[]});batches.get(key).matrices.push(m);};
  function texture(type){
    if(typeof document==='undefined')return null;
    const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
    if(type==='wood'){
      ctx.fillStyle='#bc9868';ctx.fillRect(0,0,512,512);
      for(let i=0;i<512;i++){ctx.fillStyle=`rgba(${rand()>.5?'71,47,25':'247,215,165'},${random(.015,.12)})`;ctx.fillRect(0,i,512,random(.3,1.6));}
      for(let i=0;i<512;i+=21){ctx.fillStyle='#65543c';ctx.fillRect(0,i,512,2);ctx.fillStyle='#dfba83';ctx.fillRect(0,i+2,512,2);}
    }else if(type==='stone'){
      ctx.fillStyle='#c1bdb1';ctx.fillRect(0,0,512,512);for(let i=0;i<13000;i++){const k=Math.floor(random(100,220));ctx.fillStyle=`rgba(${k},${k},${k},.14)`;ctx.fillRect(rand()*512,rand()*512,random(.4,2),random(.4,2));}
    }else{
      ctx.fillStyle='#ede7d7';ctx.fillRect(0,0,512,512);for(let i=0;i<23;i++){ctx.beginPath();ctx.moveTo(rand()*512,0);for(let j=0;j<7;j++)ctx.lineTo(rand()*512,j*90);ctx.strokeStyle=`rgba(111,99,77,${random(.015,.045)})`;ctx.lineWidth=random(.2,1.3);ctx.stroke();}
    }
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(type==='wood'?1:3,type==='wood'?1:3);t.anisotropy=4;return t;
  }
  const stoneTex=texture('stone'),woodTex=texture('wood'),marbleTex=texture('marble');
  const std=(color,roughness=.6,metalness=0,extra={})=>new THREE.MeshStandardMaterial({color,roughness,metalness,...extra});
  const mats={
    concrete:std('#b8b7af',.73,0,{map:stoneTex}),stone:std('#bbb9ae',.82,0,{map:stoneTex}),
    slabTop:std('#a9aaa0',.86),wood:std('#e0c09a',.61,0,{map:woodTex}),walnut:std('#654630',.46),
    bronze:std('#806548',.25,.78),gold:std('#cea664',.2,.86),darkMetal:std('#313c35',.32,.65),
    marble:std('#e6e0d0',.27,0,{map:marbleTex}),darkMarble:std('#34433c',.25,.06,{map:marbleTex}),
    wall:std('#d6ccb7',.8,0,{emissive:'#bda578',emissiveIntensity:.13}),
    teal:std('#609486',.32,.15),velvet:std('#162d29',.9),ivory:std('#e9ddc6',.64),
    water:new THREE.MeshPhysicalMaterial({color:'#476b62',roughness:.13,metalness:.45,clearcoat:1}),
    bark:std('#655d49',.99),soil:std('#545b3a',1),leaf:std('#547541',.87),leafLight:std('#789957',.87),leafDark:std('#355432',.9),red:std('#b05d38',.86),
    rock:std('#868b7b',.96,0,{map:stoneTex}),black:std('#161e1b',.43),tan:std('#9c6239',.6),cream:std('#e9d6ad',.54),blue:std('#4b6c85',.38),pink:std('#c59ba0',.44),coral:std('#bc613e',.41),
    whiteGlow:std('#fff3d5',.3,0,{emissive:'#ffe1a6',emissiveIntensity:1.1}),warmGlow:std('#ffe3ae',.4,0,{emissive:'#ffc16c',emissiveIntensity:1.6}),
    diamond:new THREE.MeshPhysicalMaterial({color:'#f3f9ff',metalness:.3,roughness:.035,clearcoat:1,envMapIntensity:2.8}),
  };
  const surface=(mat,set,strength,colorMap=true)=>{
    if(!set)return;
    if(colorMap&&set.diff)mat.map=set.diff;
    if(set.normal){mat.normalMap=set.normal;mat.normalScale=new THREE.Vector2(strength,strength);}
    if(set.roughness)mat.roughnessMap=set.roughness;
  };
  // Keep pale architectural concrete clean; use only subtle micro relief.
  surface(mats.concrete,maps.concrete,.085,false);surface(mats.stone,maps.concrete,.14,false);
  surface(mats.slabTop,maps.concrete,.13,false);surface(mats.rock,maps.concrete,.7);
  surface(mats.wood,maps.oak,.28);surface(mats.walnut,maps.oak,.2);
  if(maps.oak?.diff){mats.wood.color.set('#eed8b9');mats.walnut.color.set('#aa8565');}
  surface(mats.marble,maps.marble,.13);surface(mats.darkMarble,maps.marble,.12);
  mats.marble.roughness=.44;mats.darkMarble.roughness=.4;
  for(const key of ['tan','black','cream','pink'])surface(mats[key],maps.leather,.22,false);
  mats.concrete.color.set('#dbd8cc');mats.concrete.roughness=.92;
  const glazing=new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.028,metalness:0,transmission:.985,thickness:.018,ior:1.36,reflectivity:.12,specularIntensity:.16,envMapIntensity:.1,clearcoat:0,side:THREE.DoubleSide});
  const balustrade=new THREE.MeshPhysicalMaterial({color:'#f6fcfc',roughness:.024,metalness:0,transmission:.99,thickness:.012,ior:1.36,reflectivity:.12,specularIntensity:.12,envMapIntensity:.08,side:THREE.DoubleSide});
  const vitrine=new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.025,transmission:.985,thickness:.009,ior:1.34,reflectivity:.1,specularIntensity:.1,envMapIntensity:.08,side:THREE.DoubleSide});
  const emissives=[mats.whiteGlow,mats.warmGlow,mats.wall];
  function shape(w,d,r){
    const sh=new THREE.Shape();const x=-w/2,z=-d/2;
    sh.moveTo(x+r,z);sh.lineTo(x+w-r,z);sh.quadraticCurveTo(x+w,z,x+w,z+r);sh.lineTo(x+w,z+d-r);sh.quadraticCurveTo(x+w,z+d,x+w-r,z+d);sh.lineTo(x+r,z+d);sh.quadraticCurveTo(x,z+d,x,z+d-r);sh.lineTo(x,z+r);sh.quadraticCurveTo(x,z,x+r,z);return sh;
  }
  function slabGeometry(w,d,r,h){
    const key=[w,d,r,h].join(':');if(geocache.has(key))return geocache.get(key);
    const g=new THREE.ExtrudeGeometry(shape(w,d,r),{depth:h,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.12,bevelThickness:.11,curveSegments:14});
    g.rotateX(-Math.PI/2);g.computeVertexNormals();geocache.set(key,g);return g;
  }
  function slab(mat,x,y,z,w,d,r,h){inst(slabGeometry(w,d,r,h),mat,x,y,z);}
  function perimeterSegments(w,d,r,gap){
    const points=shape(w,d,r).getPoints(16),segments=[];
    const openings=!gap?[]:Array.isArray(gap)?typeof gap[0]==='number'?[{edge:'rear',min:gap[0],max:gap[1]}]:gap:[gap];
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],cuts=[0,1];
      for(const opening of openings){const edge=opening.edge==='front'?-d/2:d/2;if(Math.abs(a.y-edge)<.02&&Math.abs(b.y-edge)<.02&&Math.abs(a.x-b.x)>.01)for(const x of [opening.min,opening.max]){const t=(x-a.x)/(b.x-a.x);if(t>0&&t<1)cuts.push(t);}}
      cuts.sort((a,b)=>a-b);for(let j=0;j<cuts.length-1;j++){const p=a.clone().lerp(b,cuts[j]),q=a.clone().lerp(b,cuts[j+1]),middle=(p.x+q.x)/2;if(openings.some(o=>Math.abs(p.y-(o.edge==='front'?-d/2:d/2))<.02&&Math.abs(q.y-(o.edge==='front'?-d/2:d/2))<.02&&middle>o.min&&middle<o.max))continue;segments.push([p,q]);}
    }
    return segments;
  }
  function roundFace(w,d,r,y0,height,gap){
    const vertices=[],uv=[];let distance=0;
    for(const [a,b] of perimeterSegments(w,d,r,gap)){
      const len=a.distanceTo(b);vertices.push(a.x,y0,a.y,b.x,y0,b.y,b.x,y0+height,b.y,a.x,y0,a.y,b.x,y0+height,b.y,a.x,y0+height,a.y);uv.push(distance,0,distance+len,0,distance+len,height,distance,0,distance+len,height,distance,height);distance+=len;
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  function glassPerimeter(x,y,z,w,d,r,h,material,gap){const mesh=new THREE.Mesh(roundFace(w,d,r,0,h,gap),material);mesh.position.set(x,y,z);glassGroup.add(mesh);return mesh;}
  function railPerimeter(x,y,z,w,d,r,gap){
    for(const [a,b] of perimeterSegments(w,d,r,gap))tube(new THREE.Vector3(a.x+x,y,a.y+z),new THREE.Vector3(b.x+x,y,b.y+z),.025,mats.bronze);
  }
  function label(text,x,y,z,width,rotation=0,background='#c3a379',color='#2b3832'){
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.width=1024;c.height=128;const cx=c.getContext('2d');cx.fillStyle=background;cx.fillRect(0,0,1024,128);cx.fillStyle=color;cx.font='38px Georgia, serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,512,69);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:tex,roughness:.65,emissive:'#e8d8b7',emissiveIntensity:.18});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/8),m);mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);
  }
  function necklace(x,y,z,scale=1){
    stats.necklaces++;sphere(mats.velvet,x,y+.28*scale,z,.23*scale,.32*scale,.105*scale);box(mats.velvet,x,y+.025*scale,z,.38*scale,.05*scale,.25*scale);
    for(let j=0;j<16;j++){const a=j/15*Math.PI;const px=x+Math.cos(a)*.155*scale,py=y+.38*scale-Math.sin(a)*.185*scale;sphere(j%3===0?mats.diamond:mats.gold,px,py,z-.11*scale,.016*scale);}
    inst(unitIco,mats.diamond,x,y+.16*scale,z-.13*scale,.035*scale,.053*scale,.025*scale);
  }
  const bagColors=[mats.tan,mats.black,mats.cream,mats.pink];
  function bag(x,y,z,scale=1,index=0){
    stats.handbags++;const mat=bagColors[index%bagColors.length];sphere(mat,x,y+.19*scale,z,.3*scale,.2*scale,.12*scale);box(mat,x,y+.17*scale,z,.5*scale,.32*scale,.22*scale);inst(unitTorus,mats.bronze,x,y+.41*scale,z,.145*scale,.17*scale,.13*scale);box(mats.gold,x,y+.21*scale,z-.121*scale,.065*scale,.055*scale,.024*scale);box(mats.bronze,x,y+.08*scale,z-.125*scale,.41*scale,.012*scale,.01*scale);
  }
  const toyColors=[mats.cream,mats.blue,mats.coral,mats.pink,mats.teal];
  function bear(x,y,z,size=1,index=0){
    stats.toys++;const mat=toyColors[index%toyColors.length];
    sphere(mat,x,y+.38*size,z,.21*size,.27*size,.17*size);sphere(mat,x,y+.73*size,z,.26*size,.23*size,.22*size);
    sphere(mat,x-.18*size,y+.92*size,z,.098*size);sphere(mat,x+.18*size,y+.92*size,z,.098*size);
    sphere(mat,x-.13*size,y+.1*size,z-.035*size,.095*size,.16*size,.11*size);sphere(mat,x+.13*size,y+.1*size,z-.035*size,.095*size,.16*size,.11*size);
    sphere(mat,x-.25*size,y+.43*size,z,.09*size,.17*size,.09*size);sphere(mat,x+.25*size,y+.43*size,z,.09*size,.17*size,.09*size);
    sphere(mats.ivory,x,y+.67*size,z-.195*size,.115*size,.07*size,.045*size);sphere(mats.black,x-.084*size,y+.765*size,z-.2*size,.023*size);sphere(mats.black,x+.084*size,y+.765*size,z-.2*size,.023*size);sphere(mats.black,x,y+.697*size,z-.244*size,.024*size);
  }
  function displayCase(x,y,z,w=2.3){
    box(mats.marble,x,y+.47,z,w,.94,.78);box(mats.bronze,x,y+.98,z,w+.025,.035,.8);box(mats.velvet,x,y+1.015,z,w-.13,.04,.65);
    for(const dx of [-w/2,w/2])for(const dz of [-.39,.39])box(mats.gold,x+dx,y+1.2,z+dz,.02,.42,.02);
    const c=new THREE.Mesh(new THREE.BoxGeometry(w,.43,.78),vitrine);c.position.set(x,y+1.215,z);glassGroup.add(c);box(mats.warmGlow,x,y+.93,z-.405,w-.08,.015,.018,0,false);
    for(let j=0;j<3;j++)necklace(x+(j-1)*(w/3),y+1.04,z,.54);
  }
  function retail(cx,base,cz,w,d,type,main=false){
    stats.retailRooms++;
    const spec=storeFor(cx,Math.round(base/4.65),!main);
    stats.storeNames.push(spec.name);stats.storeTypes.push(spec.type);
    const api={box,slab,inst,sphere,tube,label,root,glassGroup,mats,unitCylinder,unitTorus,bag,bear,necklace,displayCase,vitrine,glazing,stats,runtime};
    const room=createRetailRoom(api,cx,base,cz,w,d,spec);
    if(base===0)addAutomaticDoor(api,room);
  }
  function wing(cx,cz,w=21,d=17,levels=4,secondary=false){
    for(let floor=0;floor<levels;floor++){
      const base=floor*4.65;
      if(floor===0)slab(mats.concrete,cx,-.03,cz,w+3.5,d+3.5,3.5,.18);
      slab(mats.concrete,cx,base+4.06,cz,w+4,d+4,3.7,.5);
      slab(mats.wood,cx,base+4.025,cz,w+2.65,d+2.65,3.25,.034);
      // Individual soffit ribs catch sunlight at the curved canopy edges.
      const halfW=(w+2.5)/2,halfD=(d+2.5)/2,corner=3.25;
      for(let x=-halfW+.13;x<halfW-.1;x+=.2){
        const arc=Math.max(0,Math.abs(x)-(halfW-corner));
        const reach=halfD-corner+Math.sqrt(Math.max(0,corner*corner-arc*arc));
        box(mats.wood,cx+x,base+3.984,cz,.105,.065,reach*2-.12);
      }
      slab(mats.slabTop,cx,base+4.565,cz,w+3.78,d+3.78,3.65,.03);
      const entryGap={edge:'front',min:-1.4,max:1.4};
      glassPerimeter(cx,base+.21,cz,w,d,2.6,3.72,glazing,entryGap);
      const transom=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.9),glazing);transom.position.set(cx,base+3.48,cz-d/2);glassGroup.add(transom);
      for(const dx of [-1.43,1.43])box(mats.bronze,cx+dx,base+1.67,cz-d/2,.05,2.92,.07);
      // Thin horizontal champagne transoms, darker structural columns.
      railPerimeter(cx,base+3.29,cz,w+.02,d+.02,2.6);
      railPerimeter(cx,base+.2,cz,w+.02,d+.02,2.6,entryGap);
      for(let k=-3;k<=3;k++)for(const direction of [-1,1]){
        if(k===0&&direction===-1)continue;
        const xx=cx+k*(w-5.2)/6,zz=cz+direction*d/2;box(k%3===0?mats.darkMetal:mats.bronze,xx,base+2.17,zz,.07,3.86,.12);
      }
      for(let j=-1;j<=1;j++)for(const direction of [-1,1])box(mats.bronze,cx+direction*w/2,base+2.13,cz+j*(d-4.8)/3,.11,3.84,.065);
      for(const dx of [-w*.31,w*.31]){box(mats.darkMetal,cx+dx,base+2.13,cz-d/2-.2,.34,3.9,.45);box(mats.bronze,cx+dx-.13,base+2.14,cz-d/2-.445,.05,3.92,.025);}
      if(floor>0){
        const connectorX=(cx<0?-20:20)-cx;
        const accessGap=[{edge:secondary?'front':'rear',min:connectorX-1.13,max:connectorX+1.13}];
        if(!secondary&&cx>0&&floor===3)accessGap.push({edge:'rear',min:-4.45,max:.4});
        glassPerimeter(cx,base+.06,cz,w+3.1,d+3.1,3.45,1.02,balustrade,accessGap);railPerimeter(cx,base+1.08,cz,w+3.12,d+3.12,3.45,accessGap);railPerimeter(cx,base+.075,cz,w+3.12,d+3.12,3.45,accessGap);
        for(const dx of [-w/2-1.1,w/2+1.1])for(const dz of [-d*.31,d*.31]){box(mats.darkMetal,cx+dx,base+.3,cz+dz,.54,.53,1.2);for(let b=0;b<7;b++)inst(unitIco,mats.leaf,cx+dx+random(-.14,.14),base+.63+random(-.06,.16),cz+dz+random(-.5,.5),random(.2,.34),random(.17,.3),random(.2,.33));}
      }
      const type=secondary?(cx<0?'bags':'jewelry'):(floor===0?(cx<0?'jewelry':'toys'):floor===1?(cx<0?'bags':'jewelry'):floor===2?'bags':'jewelry');
      retail(cx,base,cz,w,d,type,!secondary);
      // Entry opening stays clear; ground-floor doors slide behind the side glazing.
    }
  }

  // Ground joints are real geometry, not a background photograph.
  box(mats.stone,0,-.28,11,97,.42,98,0,false);
  for(let x=-44;x<=44;x+=2.3)box(mats.slabTop,x,-.059,11,.012,.004,89,0,false);
  for(let z=-32;z<=57;z+=2.3)box(mats.slabTop,0,-.058,z,89,.004,.012,0,false);
  box(mats.darkMetal,0,-.044,-16,.28,.02,11,0,false);box(mats.water,0,-.025,-16,.18,.02,11,0,false);
  wing(-16,0);wing(16,0);
  wing(-13.8,24,18.5,16.5,4,true);wing(13.8,24,18.5,16.5,4,true);
  for(let f=1;f<=3;f++){
    const y=f*4.65;
    for(const x of [-20,20]){box(mats.concrete,x,y-.16,12.2,2.2,.32,4.65);for(const side of [-1,1]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.03),balustrade);panel.rotation.y=Math.PI/2;panel.position.set(x+side*1.06,y+.52,12.2);glassGroup.add(panel);box(mats.bronze,x+side*1.06,y+1.04,12.2,.035,.035,4.6);}}
    box(mats.concrete,0,y-.16,37.65,3.15,.32,6.4);
    for(const x of [-1.52,1.52]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(6.4,1.03),balustrade);panel.rotation.y=Math.PI/2;panel.position.set(x,y+.52,37.65);glassGroup.add(panel);box(mats.bronze,x,y+1.04,37.65,.035,.035,6.4);}
  }

  // A sequence of teal portals makes the axial passage genuinely deep.
  for(const z of [-7.65,1.1,10.8,34.5]){
    const height=z>30?13.2:15.4;
    for(const side of [-1,1]){
      box(mats.concrete,side*3.36,height/2,z,.44,height,.65);
      box(mats.teal,side*3.115,height/2,z-.16,.075,height-.35,.32);
      for(let i=0;i<4;i++)box(mats.bronze,side*(3.07+i*.085),height/2,z-.35,.018,height-.37,.023);
      box(mats.warmGlow,side*2.99,height/2,z-.25,.022,height-.4,.03,0,false);
    }
    box(mats.concrete,0,height-.05,z,7.1,.48,.72);box(mats.teal,0,height-.325,z-.04,6.28,.075,.53);box(mats.warmGlow,0,height-.39,z-.15,6.02,.025,.027,0,false);
  }
  // Elevated bridges cross behind the entry portal, not across the ground path.
  for(const z of [8.5,33.6])for(let floor=1;floor<=3;floor++){
    const yy=floor*4.65;box(mats.concrete,0,yy-.3,z,7.3,.5,2.0);box(mats.wood,0,yy-.56,z,6.3,.024,1.75);box(mats.warmGlow,0,yy-.585,z-.85,6.2,.028,.03,0,false);
    for(const side of [-1,1])for(const [a,b] of z>30&&side===1?[[-3.4,-1.58],[1.58,3.4]]:[[-3.4,3.4]]){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(b-a,1.03),balustrade);mesh.position.set((a+b)/2,yy+.49,z+side*.93);glassGroup.add(mesh);box(mats.bronze,(a+b)/2,yy+1.015,z+side*.93,b-a,.035,.025);}
  }
  // The far end contains another retail gallery with a central opening.
  for(const cx of [-11,11]){
    box(mats.wall,cx,4.7,38.8,15,9.4,.55);box(mats.wood,cx,9.2,37.2,16,.3,4.2);
    for(let yy=0;yy<2;yy++){
      for(let j=-2;j<=2;j++){box(mats.bronze,cx+j*2.9,yy*4.65+2.1,36.85,.055,4.15,.1);}
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(14.5,3.9),glazing);gl.position.set(cx,yy*4.65+2.05,36.9);glassGroup.add(gl);
      for(let j=0;j<3;j++){box(mats.walnut,cx+(j-1)*3.5,yy*4.65+1.5,38.3,2.5,2.7,.25);for(let k=0;k<3;k++)bag(cx+(j-1)*3.5+(k-1)*.6,yy*4.65+1.0,37.95,1,j+k);}
    }
  }
  function rock(x,z,r,ground=0){inst(unitIco,mats.rock,x,ground+r*.22,z,r,random(.3,.48)*r,random(.55,.9)*r,random(-.2,.2),rand()*6,random(-.1,.1));}
  function planting(x,z,r=1.5){
    inst(unitCylinder,mats.soil,x,-.01,z,r,.1,r);
    for(let i=0;i<22;i++){const a=rand()*6.28,dist=Math.sqrt(rand())*r;inst(unitIco,i%3?mats.leafDark:mats.leaf,x+Math.cos(a)*dist,.13+random(0,.08),z+Math.sin(a)*dist,random(.23,.48),random(.16,.31),random(.23,.5));}
    for(let i=0;i<5;i++){const a=rand()*6.28;rock(x+Math.cos(a)*r*.8,z+Math.sin(a)*r*.8,random(.35,.64));}
  }
  const leafGeo=new THREE.SphereGeometry(1,5,3);
  function tree(x,z,height=6,red=false){
    stats.trees++;planting(x,z,1.45);tube(new THREE.Vector3(x,0,z),new THREE.Vector3(x+.17,height*.65,z+.09),.105,mats.bark);
    for(let b=0;b<10;b++){
      const a=b*2.399,heightStart=height*random(.38,.72),spread=height*random(.18,.34);
      const start=new THREE.Vector3(x+.1,heightStart,z);const end=new THREE.Vector3(x+Math.cos(a)*spread,height*random(.74,.97),z+Math.sin(a)*spread);
      tube(start,end,.025+rand()*.024,mats.bark);
      for(let j=0;j<3;j++){
        const tip=end.clone().add(new THREE.Vector3(random(-.7,.7),random(-.3,.45),random(-.7,.7)));tube(end,tip,.013,mats.bark);
        for(let leaf=0;leaf<23;leaf++){
          const phi=rand()*6.28,rr=rand()**.4*height*.145;const xx=tip.x+Math.cos(phi)*rr,zz=tip.z+Math.sin(phi)*rr,yy=tip.y+random(-.43,.45);
          const mat=red?mats.red:(leaf%4===0?mats.leafLight:leaf%3===0?mats.leafDark:mats.leaf);inst(leafGeo,mat,xx,yy,zz,random(.14,.26),random(.055,.115),random(.09,.16),rand()*2,rand()*6,rand()*2);
        }
      }
    }
  }
  tree(-2.8,18,6.4);tree(2.7,27.4,5.8,true);tree(-2.9,35,5.5);tree(7.8,36,6.1,true);
  for(const x of [-29.5,29.5])for(const z of [-5,10,28,41])tree(x+random(-.4,.4),z,random(6.8,8.2));
  for(const x of [-21,21])tree(x,-19,7);
  for(const x of [-3.0,3.0])for(const z of [15,23,31]){planting(x,z,1.05);box(mats.walnut,x+(x<0?-.95:.95),.43,z,.63,.16,2.0);for(const dz of [-.72,.72])box(mats.darkMetal,x+(x<0?-.95:.95),.2,z+dz,.45,.39,.12);}
  for(const x of [-28,28])for(const z of [-11.5,1,20])planting(x,z,1.8);
  // Low-key path lighting and real entrance mats anchor the scale.
  for(const x of [-2.35,2.35])for(const z of [13.2,21,30]){box(mats.darkMetal,x,.36,z,.13,.72,.13);box(mats.warmGlow,x,.65,z-.071,.075,.08,.018,0,false);}
  for(const x of [-16,16])box(mats.darkMetal,x,.027,-8.55,2.2,.04,.48,0,false);
  // Neutral far context is kept well away from the main composition.
  for(let i=0;i<12;i++){const x=-77+i*14,h=random(7,20);box(std(i%2?'#bac5c3':'#aab9b6',.95),x,h/2,73,random(8,12),h,9);}
  const atrium=buildAtrium({root,box,slab,inst,sphere,tube,glassGroup,mats,balustrade,glazing,unitCylinder,label,tree,rock});
  const roof=buildRooftop({root,box,slab,inst,sphere,tube,glassGroup,mats,balustrade,unitCylinder,unitTorus,label});
  const fountain=addFountain({root,glassGroup,inst,mats,unitCylinder,unitTorus,runtime});
  stats.escalators=atrium.flights.length;stats.atriumLevels=4;
  for(const batch of batches.values()){
    const mesh=new THREE.InstancedMesh(batch.geo,batch.mat,batch.matrices.length);
    batch.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=batch.cast;mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();root.add(mesh);
  }
  root.updateMatrixWorld(true);
  stats.automaticDoors=runtime.doors.length;stats.cashiers=runtime.rooms.filter(r=>r.checkout).length;stats.fittingRooms=runtime.rooms.reduce((n,r)=>n+r.fittingRooms.length,0);stats.rearStoreys=4;
  return {root,glassGroup,glazing,balustrade,vitrine,mats,emissives,stats,atrium,roof,runtime,fountain,update:(dt,time,camera,on)=>updateRetail(runtime,dt,time,camera,on)};
}
