import * as THREE from './vendor/three.module.js';

// The same shaft openings are used in the ground and both basement slabs.
export const SHAFTS=[{x:7.1,z:59.05,w:2.95,d:2.95},{x:-30,z:22,w:2.95,d:2.95}];
export const VEHICLE_RAMP={x:44,z:12,w:7,d:66};
export function vehicleRampHeight(z){return z<=-20?0:z<9?-(z+20)*4.2/29:z<=15?-4.2:z<44?-4.2-(z-15)*4.2/29:-8.4;}
export function perforatedSlab(box,mat,y,height,minX,maxX,minZ,maxZ,holes=SHAFTS){
  const xs=[minX,maxX,...holes.flatMap(h=>[h.x-h.w/2,h.x+h.w/2])].filter(x=>x>=minX&&x<=maxX).sort((a,b)=>a-b);
  const zs=[minZ,maxZ,...holes.flatMap(h=>[h.z-h.d/2,h.z+h.d/2])].filter(z=>z>=minZ&&z<=maxZ).sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){const x=(xs[i]+xs[i-1])/2,z=(zs[j]+zs[j-1])/2;if(holes.some(h=>Math.abs(x-h.x)<h.w/2&&Math.abs(z-h.z)<h.d/2))continue;box(mat,x,y,z,xs[i]-xs[i-1],height,zs[j]-zs[j-1],0,true);}
}
export function buildParking(api){
  const {box,inst,sphere,label,root,mats:M,unitCylinder:C}=api,walkables=[],obstacles=[],spaces=[],lights=[],driveRoutes=[];
  const floor=new THREE.MeshStandardMaterial({color:'#59696b',roughness:.74,emissive:'#59696b',emissiveIntensity:.04});
  const concrete=new THREE.MeshStandardMaterial({color:'#a6aaa7',roughness:.85});
  const paint=[new THREE.MeshBasicMaterial({color:'#91c9ac'}),new THREE.MeshBasicMaterial({color:'#89b8d6'})];
  const carColors=['#a9bbb8','#d7d5c9','#526775','#803e36','#303e4a'].map(color=>new THREE.MeshStandardMaterial({color,metalness:.45,roughness:.3}));
  function car(x,y,z,k){
    const m=carColors[k%carColors.length];box(m,x,y+.68,z,1.9,.65,4.3);box(m,x,y+1.13,z-.2,1.7,.58,2.35);box(M.blue,x,y+1.34,z-.25,1.71,.31,2.0);box(m,x,y+1.52,z-.25,1.75,.09,1.6);
    for(const dx of [-.99,.99])for(const dz of [-1.3,1.3]){inst(C,M.black,x+dx,y+.37,z+dz,.34,.16,.34,0,0,Math.PI/2);inst(C,M.bronze,x+dx*1.05,y+.37,z+dz,.17,.17,.17,0,0,Math.PI/2);}
    for(const dx of [-.66,.66])box(M.ivory,x+dx,y+.75,z-2.16,.45,.16,.02);
  }
  for(const [level,y] of [-4.2,-8.4].entries()){
    const b=(m,x,yy,z,w,h,d)=>{box(m,x,yy,z,w,h,d);obstacles.push({x,z,w,d,base:y});};
    perforatedSlab(box,floor,y-.16,.32,-34,34,-14,67,level===0?SHAFTS:[]);
    walkables.push({x:0,z:26.5,w:67.4,d:80.3,y});
    b(concrete,-34,y+1.9,26.5,.3,3.8,81);
    const exitZ=level===0?12:44;
    for(const [a,bz] of [[-14,exitZ-3.1],[exitZ+3.1,67]])b(concrete,34,y+1.9,(a+bz)/2,.3,3.8,bz-a);
    box(floor,37.25,y-.16,exitZ,6.5,.32,6.2);
    walkables.push({x:38.5,z:exitZ,w:10,d:5.8,y});
    for(const dz of [-3.1,3.1])box(concrete,37.25,y+1.85,exitZ+dz,6.5,3.7,.2);
    label(level?'← B2 出口 / EXIT':'← B1 出口 / EXIT',33.85,y+2.9,exitZ,4,Math.PI/2,'#345573','#fff1cb');
    for(const z of [-14,67])b(concrete,0,y+1.9,z,68,3.8,.3);
    for(const x of [-24,-12,0,12,24])for(const z of [2,24,46,64]){
      b(concrete,x,y+1.9,z,.65,3.8,.65);box(paint[level],x,y+1.05,z,.68,1.2,.68);label(`B${level+1} · ${String(Math.round(z)).padStart(2,'0')}`,x,y+2.1,z-.34,.65,Math.PI,level?'#345573':'#376953','#fff');
    }
    // Twin aisles and rows of 2.8 × 5.4 m bays, with a protected pedestrian spine.
    for(const z of [-7,11,33,53])for(let slot=0;slot<18;slot++){
      const x=-25.2+slot*2.8;if(z===53&&Math.abs(x-7.1)<3.7)continue;
      const occupied=((slot*7+[ -7,11,33,53 ].indexOf(z)*3+level*2)%10)<5;
      spaces.push({level:level+1,x,z,occupied});for(const dx of [-1.37,1.37])box(M.ivory,x+dx,y+.014,z,.05,.022,5.4,0,false);box(M.ivory,x,y+.014,z+2.68,2.8,.022,.05,0,false);
      if(occupied){car(x,y,z,slot+level);obstacles.push({x,z,w:2.05,d:4.55,base:y});}
      if(slot<3&&z===11){box(paint[level],x,y+.021,z,2.65,.018,5.25,0,false);b(M.teal,x,y+.75,z+2.8,.46,1.5,.3);label('EV',x,y+1.17,z+2.63,.37,Math.PI,'#244b49','#fff');}
    }
    for(const z of [1,22,43,62])for(const x of [-19,-6,19]){box(M.whiteGlow,x,y+3.55,z,4.4,.055,.2,0,false);box(concrete,x,y+3.77,z,.14,.22,80);}
    // A small, fixed pool of lights plus emissive strips keeps mobile rendering bounded.
    for(const z of [3,29,58]){const light=new THREE.PointLight('#d7eee8',90,43,2);light.position.set(0,y+3.3,z);root.add(light);lights.push(light);}
    for(let z=-10;z<64;z+=2.1){box(paint[level],-32.1,y+.028,z,1.2,.026,.12,0,false);}
    for(const z of [1,22,43,61])label('商场电梯 ↑  /  微空港快线 ←',1,y+2.9,z,6,Math.PI,level?'#345573':'#376953','#fff4d6');
    label(`B${level+1}  /  PARKING`,-7,y+2.1,66.78,12,Math.PI,level?'#345573':'#376953','#fff4d6');
    // Wheel stops and raised crossing paint orient the arrival area without blocking it.
    for(let i=0;i<7;i++)box(M.ivory,7.1+i*.44,y+.03,56.2,.22,.03,1.6,0,false);
    const startZ=level?39:5,r=level?2:2.6,path=new THREE.CurvePath(),v=(x,z)=>new THREE.Vector3(x,y+1.13,z);
    path.add(new THREE.LineCurve3(v(-18,startZ),v(29-r,startZ)));
    path.add(new THREE.QuadraticBezierCurve3(v(29-r,startZ),v(29,startZ),v(29,startZ+r)));
    path.add(new THREE.LineCurve3(v(29,startZ+r),v(29,exitZ-r)));
    path.add(new THREE.QuadraticBezierCurve3(v(29,exitZ-r),v(29,exitZ),v(29+r,exitZ)));
    path.add(new THREE.LineCurve3(v(29+r,exitZ),v(40,exitZ)));
    const points=path.getSpacedPoints(240);driveRoutes.push({floor:level+5,points,length:path.getLength(),exitZ});
    for(let i=0;i<points.length;i+=9){const p=points[i],q=points[Math.min(i+1,240)],angle=Math.atan2(q.x-p.x,q.z-p.z);box(paint[level],p.x,y+.036,p.z,.09,.022,.6,angle,false);}
    for(const x of [-16,8,24])label('车辆出口  →',x,y+2.7,startZ+1.8,3.6,Math.PI,level?'#345573':'#376953','#fff4d6');
  }
  // Continuous two-way vehicle ramp outside the retail footprint, with B1 and B2 turn-offs.
  const vertices=[];for(const [a,b] of [[-20,9],[9,15],[15,44],[44,47]]){const ya=vehicleRampHeight(a),yb=vehicleRampHeight(b);vertices.push(40.5,ya,a,47.5,ya,a,47.5,yb,b,40.5,ya,a,47.5,yb,b,40.5,yb,b);}
  const rampGeometry=new THREE.BufferGeometry();rampGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));rampGeometry.computeVertexNormals();
  const ramp=new THREE.Mesh(rampGeometry,new THREE.MeshStandardMaterial({color:'#566365',roughness:.85,side:THREE.DoubleSide}));ramp.receiveShadow=true;ramp.castShadow=true;root.add(ramp);
  for(let i=0;i<32;i++){const z=-19+i*2,y=vehicleRampHeight(z);box(M.ivory,44,y+.018,z,.06,.025,.75,0,false);}
  box(concrete,47.6,-3.7,12,.24,9,66);
  for(const [a,b] of [[-21,8.9],[15.1,40.9]])box(concrete,40.4,-3.7,(a+b)/2,.24,9,b-a);
  label('地下停车 ↓  B1 / B2',44,2.5,-20,6,Math.PI,'#294b45','#fff0c8');
  for(const x of [40.7,47.3])box(M.bronze,x,1.3,-20,.12,2.6,.12);
  return {walkables,obstacles,spaces,lights,driveRoutes,levels:2,ramp:{x:44,z0:-20,z1:44,y0:0,y1:-8.4}};
}
