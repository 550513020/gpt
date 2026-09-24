import * as THREE from './vendor/three.module.js';
import {createPatisserie} from './patisserie.js?v=15';

// The supplied sketch is viewed with its entrance at the lower right:
// left seating, rear cashier, two hooked islands, right cold case, front stair.
export const BAKERY_PLAN={entryX:4.65,cashier:{x:1.9,z:6.05,w:7.5,d:1.42},freezer:{x:8.42,z:1.1,w:1.86,d:10.5},stair:{x:-.55,z:-6.95,r:2.55}};
export function buildReferenceBakery(api,room){
  const {glassGroup,mats:M,unitCylinder:C}=api,{cx,cz,base:y}=room;
  // Sketch right is viewer-right from the entrance (negative world X).
  const mx=x=>2*cx-x,mp=p=>new THREE.Vector3(mx(p.x),p.y,p.z),mirrors=new WeakMap();
  const box=(m,x,y,z,w,h,d,ry=0,cast=true)=>api.box(m,mx(x),y,z,w,h,d,-ry,cast);
  const slab=(m,x,y,z,w,d,r,h)=>api.slab(m,mx(x),y,z,w,d,r,h);
  const sphere=(m,x,y,z,sx,sy=sx,sz=sx)=>api.sphere(m,mx(x),y,z,sx,sy,sz);
  const tube=(a,b,r,m)=>api.tube(mp(a),mp(b),r,m);
  const label=(text,x,y,z,w,ry=0,...rest)=>api.label(text,mx(x),y,z,w,-ry,...rest);
  function inst(g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,cast=true){
    let mirror=mirrors.get(g);if(!mirror){mirror=g.clone().scale(-1,1,1);if(mirror.index){const a=mirror.index.array;for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];}else for(const attr of Object.values(mirror.attributes)){for(let i=0;i<attr.count;i+=3)for(let k=0;k<attr.itemSize;k++){const a=(i+1)*attr.itemSize+k,b=(i+2)*attr.itemSize+k;[attr.array[a],attr.array[b]]=[attr.array[b],attr.array[a]];}}mirrors.set(g,mirror);}
    api.inst(mirror,m,mx(x),y,z,sx,sy,sz,rx,-ry,-rz,cast);
  }
  const block=b=>room.blockers.push({...b,x:mx(b.x)});
  const mat=(c,r=.65,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const red=mat('#aa332a'),steel=mat('#bec4bf',.3,.7),paper=mat('#ecdfc6',.92),dark=mat('#35433c'),vanilla=mat('#f2cf7d');
  const flavors=['#d697ae','#a8b77b','#dbc180','#9e7aab','#8c5134'].map(c=>mat(c,.88));
  const glass=new THREE.MeshPhysicalMaterial({color:'#f1fbf9',transparent:true,opacity:.11,roughness:.055,metalness:0,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,envMapIntensity:.35});
  room.menu=['croissant','sourdough','coffee','macaron','eggTart','cookie','eclair','fruitTart','canele','strawberryCake'];
  room.bakery={islands:2,coldDisplay:true,seating:5,breads:0,photoStair:true,trays:true,layout:'reference-20260916',cashierCount:1};
  const {pastry}=createPatisserie({...api,box,slab,inst,sphere,tube,label},room),plan=BAKERY_PLAN;
  function pane(x,yy,z,w,h,d){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),glass);mesh.position.set(mx(x),yy,z);glassGroup.add(mesh);}
  function counter(x,z,w,d){slab(red,x,y+.12,z,w,d,.13,.84);slab(M.marble,x,y+.97,z,w+.04,d+.04,.12,.07);}
  const islands=[
    {x:-3.0,z:-.2,w:1.12,d:6.0,kind:'left-spine'},
    {x:-1.93,z:-2.64,w:3.26,d:1.12,kind:'left-hook'},
    {x:-.86,z:-1.85,w:1.12,d:1.66,kind:'left-return'},
    {x:3.23,z:.42,w:1.12,d:4.36,kind:'right-spine'},
    {x:2.16,z:2.04,w:3.26,d:1.12,kind:'right-hook'},
    {x:1.09,z:1.46,w:1.12,d:1.18,kind:'right-return'}
  ];
  room.bakery.islandFootprints=islands.map(p=>({...p,x:cx-p.x,z:cz+p.z}));
  for(const p of islands){counter(cx+p.x,cz+p.z,p.w,p.d);pane(cx+p.x,y+1.39,cz+p.z,p.w-.03,.68,p.d-.03);}
  const kinds=['macaron','eggTart','cookie','eclair','fruitTart','canele','strawberryCake'];
  for(const [side,x,z0,count] of [[0,-3,-2.6,9],[1,3.23,-1.45,6]])for(let j=0;j<count;j++)for(const off of [-.23,.23])pastry(kinds[(j+side*3)%7],cx+x+off,y+1.075,cz+z0+j*.6,j+side);
  for(let j=0;j<4;j++){pastry(kinds[j],cx-2.6+j*.6,y+1.075,cz-2.64,j);pastry(kinds[j+2],cx+1.25+j*.6,y+1.075,cz+2.04,j);}
  label('每日现烤 · 面包与甜点',cx-3,y+.58,cz-3.24,1.09,Math.PI,'#98392f','#f5e7cf');
  // The small front island in the sketch is a tray station, not another till.
  counter(cx+3.22,cz-4.35,.94,1.55);
  for(let k=0;k<7;k++){slab(M.walnut,cx+3.22,y+1.05+k*.025,cz-4.55,.7,.65,.045,.02);box(steel,cx+3.22,y+1.08+k*.023,cz-3.98,.025,.02,.35,.28);}
  label('取托盘 / 面包夹',cx+3.22,y+.63,cz-5.14,.91,Math.PI,'#98392f','#f5e7cf');
  // One continuous service counter against the rear decorative wall, one POS.
  const c={x:cx+plan.cashier.x,z:cz+plan.cashier.z,width:plan.cashier.w,depth:plan.cashier.d};counter(c.x,c.z,c.width,c.depth);
  box(dark,c.x-.8,y+1.3,c.z-.09,.08,.45,.09);box(M.black,c.x-.8,y+1.61,c.z-.11,.65,.43,.075);box(M.teal,c.x-.8,y+1.61,c.z-.152,.57,.34,.01);
  box(M.ivory,c.x+.2,y+1.17,c.z-.22,.31,.18,.34);box(paper,c.x+.2,y+1.32,c.z-.36,.13,.17,.012);
  for(let i=0;i<4;i++){const x=c.x+2.2+i*.24;box(paper,x,y+1.28,c.z+.1,.19,.45,.24);tube(new THREE.Vector3(x-.055,y+1.5,c.z+.1),new THREE.Vector3(x-.055,y+1.6,c.z+.1),.011,paper);tube(new THREE.Vector3(x+.055,y+1.5,c.z+.1),new THREE.Vector3(x+.055,y+1.6,c.z+.1),.011,paper);tube(new THREE.Vector3(x-.055,y+1.6,c.z+.1),new THREE.Vector3(x+.055,y+1.6,c.z+.1),.011,paper);}
  box(steel,c.x+1.22,y+1.4,c.z+.04,1.15,.67,.6);for(const dx of [-.25,.25]){inst(C,M.ivory,c.x+1.22+dx,y+1.17,c.z-.37,.095,.15,.095);box(dark,c.x+1.22+dx,y+1.53,c.z-.28,.065,.18,.13);}
  label('收银 · 咖啡 · 取餐',c.x,y+2.65,cz+7.56,6.1,Math.PI,'#a13930','#f7edda');
  label('CASHIER / PICK UP',c.x-.7,y+.6,c.z-c.depth/2-.025,3.3,Math.PI,'#a13930','#f7edda');
  room.checkout={...c,x:mx(c.x),queue:{x:mx(c.x-.8),z:c.z-1.8}};room.bakery.cashier={...c,x:mx(c.x),posTerminal:true,terminals:1,receiptPrinter:true,paperBags:4};
  // A single long right-wall refrigerated case with separate sliding glass bays.
  const f=plan.freezer,fx=cx+f.x,fz=cz+f.z;room.bakery.freezer={x:mx(fx),z:fz,width:f.w,length:f.d,slidingLids:6,flavors:10};
  box(red,fx,y+.43,fz,f.w,.68,f.d);box(steel,fx,y+.8,fz,f.w+.04,.07,f.d+.04);
  for(const dx of [-f.w/2+.065,f.w/2-.065])box(steel,fx+dx,y+1.14,fz,.075,.64,f.d);
  for(const dz of [-f.d/2+.055,f.d/2-.055])box(steel,fx,y+1.14,fz+dz,f.w,.64,.08);
  for(let i=0;i<10;i++)for(const side of [-1,1]){const zz=fz-f.d/2+.52+i*(f.d-1.04)/9,xx=fx+side*.42;box(M.ivory,xx,y+1.01,zz,.73,.25,.8);box(flavors[i%5],xx,y+1.145,zz,.66,.035,.72);for(let k=0;k<3;k++)sphere(flavors[i%5],xx+(k%2-.5)*.16,y+1.18,zz+(k-1)*.19,.22,.055,.14);}
  for(let i=0;i<6;i++){const zz=fz-f.d/2+(i+.5)*f.d/6;pane(fx,y+1.49,zz,f.w-.14,.03,f.d/6-.055);box(steel,fx,y+1.5,zz-f.d/12,f.w,.04,.027);box(dark,fx-.62,y+1.525,zz,.19,.035,.3);}
  pane(fx-f.w/2-.008,y+1.18,fz,.022,.59,f.d-.2);
  label('冰淇淋 · 冷冻甜品',fx,y+.48,fz-f.d/2-.052,1.74,Math.PI,'#98392f','#f5e7cf');
  room.bakery.glassCases=['left-hook-patisserie','right-hook-patisserie','long-right-wall-freezer'];
  // Left-wall bar with two stools, and one rear-left round table with three chairs.
  slab(M.wood,cx-8.35,y+.94,cz-1.14,1.18,6.1,.1,.09);box(red,cx-8.7,y+.5,cz-1.14,.18,.84,5.94);
  for(const z of [-2.7,.4]){inst(C,red,cx-6.87,y+.57,cz+z,.35,.14,.35);inst(C,steel,cx-6.87,y+.29,cz+z,.05,.5,.05);inst(C,steel,cx-6.87,y+.055,cz+z,.26,.05,.26);block({x:cx-6.87,z:cz+z,w:.76,d:.76});}
  inst(C,M.marble,cx-6.6,y+.82,cz+5.15,.84,.07,.84);inst(C,steel,cx-6.6,y+.43,cz+5.15,.07,.77,.07);block({x:cx-6.6,z:cz+5.15,w:1.75,d:1.75});
  for(const a of [0,2.1,4.2]){const x=cx-6.6+Math.cos(a)*1.34,z=cz+5.15+Math.sin(a)*1.34;inst(C,red,x,y+.49,z,.3,.13,.3);inst(C,steel,x,y+.25,z,.035,.44,.035);block({x,z,w:.7,d:.7});}
  for(let i=0;i<26;i++)box(i%3?M.wood:red,cx-9.1+i*.235,y+2.0,cz+7.47,.09,3.25,.075);
  label('麦屿 · 烘焙时光',cx-6.4,y+2.84,cz+7.4,4.4,Math.PI,'#b99c7b','#fff2dd');
  // Front-centre fan/spiral photo stair follows the semicircle in the sketch.
  const {x:ox,z:oz,r}=plan.stair,sx=cx+ox,sz=cz+oz;const steps=22;
  room.bakery.stair={x:mx(sx),z:sz,radius:r,steps,height:2.2,placement:'front-centre',sweep:Math.PI};
  block({x:sx,z:sz+r/2,w:r*2+.16,d:r+.18});
  const rail=[];
  for(let i=0;i<steps;i++){
    const a=Math.PI+i*Math.PI/steps,b=a+Math.PI/steps*.985,h=.1*(i+1),shape=new THREE.Shape();
    shape.absarc(0,0,r,a,b,false);shape.lineTo(Math.cos(b)*.17,Math.sin(b)*.17);shape.absarc(0,0,.17,b,a,true);shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:.073,bevelEnabled:false,steps:1,curveSegments:3});g.rotateX(-Math.PI/2);inst(g,red,sx,y+h,sz);
    const p=new THREE.Vector3(sx+Math.cos(a)*r,y+h+.88,sz-Math.sin(a)*r);rail.push(p);tube(new THREE.Vector3(p.x,y+h,p.z),p,.019,red);if(i)tube(rail[i-1],p,.033,red);
  }
  inst(C,red,sx,y+1.12,sz,.095,2.24,.095);
  // A warm cream photo backdrop frames the wider sculptural stair.
  box(paper,sx,y+1.8,sz-.3,5.9,3.55,.12);
  const arch=new THREE.CurvePath();arch.add(new THREE.LineCurve3(new THREE.Vector3(sx-2.6,y+.12,sz-.2),new THREE.Vector3(sx-2.6,y+2.0,sz-.2)));
  const arc=[];for(let i=0;i<=28;i++){const a=Math.PI-i*Math.PI/28;arc.push(new THREE.Vector3(sx+Math.cos(a)*2.6,y+2+Math.sin(a)*1.15,sz-.2));if(i)tube(arc[i-1],arc[i],.025,M.warmGlow);}
  tube(new THREE.Vector3(sx-2.6,y+.12,sz-.2),arc[0],.025,M.warmGlow);tube(arc.at(-1),new THREE.Vector3(sx+2.6,y+.12,sz-.2),.025,M.warmGlow);
  room.bakery.photoBackdrop=true;room.bakery.stair.width=5.1;
  label('麦屿 · 红色旋梯',sx,y+3.35,sz-.215,3.15,0,'#a13930','#f8e6c7');
  room.bakery.photoPoint={x:cx-.7,z:cz+.3};
  // The entrance stays open beside the front end of the long freezer.
  label('欢迎进店 →',cx+plan.entryX,y+2.64,room.entry.z+.03,2.1,Math.PI,'#79978b','#fff5dd');
}
