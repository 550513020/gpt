import * as THREE from './vendor/three.module.js';

export function addSeafoodTank(api,room,x,z){
  const {root,glassGroup,box,mats:M,vitrine,runtime,label}=api,base=room.base;
  const width=5.2,depth=1.12,bottom=base+.85,top=base+2.05;
  box(M.darkMarble,x,base+.48,z,width,.68,depth+.1);box(M.bronze,x,base+2.1,z,width+.04,.08,depth+.04);
  const tank=new THREE.Mesh(new THREE.BoxGeometry(width,1.25,depth),vitrine);tank.position.set(x,base+1.46,z);glassGroup.add(tank);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(width-.05,depth-.05),new THREE.MeshPhysicalMaterial({color:'#91c9bd',transparent:true,opacity:.24,roughness:.14,metalness:.1,side:THREE.DoubleSide}));water.rotation.x=-Math.PI/2;water.position.set(x,top-.08,z);glassGroup.add(water);
  for(const dx of [-width/2,width/2])for(const dz of [-depth/2,depth/2])box(M.bronze,x+dx,base+1.46,z+dz,.025,1.25,.025);
  box(M.whiteGlow,x,base+2.04,z,width-.1,.035,.08,0,false);
  label('鲜活海鲜 · 鱼 / 虾 / 蟹',x,base+.5,z-depth/2-.06,3.8,Math.PI,'#2e554b','#f1e1ba');
  const actors=[];
  const ellipsoid=(parent,material,px,py,pz,sx,sy,sz)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,10,7),material);m.position.set(px,py,pz);m.scale.set(sx,sy,sz);parent.add(m);return m;};
  const segment=(parent,a,b,r,material)=>{const delta=b.clone().sub(a),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),5),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());parent.add(m);};
  for(let i=0;i<12;i++){
    const group=new THREE.Group(),kind=i<5?'fish':i<9?'shrimp':'crab',mat=i%2?M.teal:M.coral;
    if(kind==='fish'){
      ellipsoid(group,i%2?M.blue:M.ivory,0,0,0,.24,.12,.055);
      const tail=new THREE.Mesh(new THREE.ConeGeometry(.1,.17,3),mat);tail.rotation.z=Math.PI/2;tail.position.x=-.26;group.add(tail);
      ellipsoid(group,M.black,.16,.035,-.052,.015,.015,.009);
      const fin=new THREE.Mesh(new THREE.ConeGeometry(.045,.13,3),mat);fin.position.set(-.03,.11,0);group.add(fin);
    }else if(kind==='shrimp'){
      for(let j=0;j<7;j++)ellipsoid(group,M.tan,(j-3)*.047,Math.sin(j*.4)*.038,0,.036-j*.002,.035-j*.002,.03);
      for(const side of [-1,1])segment(group,new THREE.Vector3(-.16,.01,side*.02),new THREE.Vector3(-.35,.03,side*.08),.005,M.bronze);
      for(let j=0;j<5;j++)for(const side of [-1,1])segment(group,new THREE.Vector3((j-2)*.042,0,0),new THREE.Vector3((j-2)*.04,-.055,side*.07),.006,M.tan);
    }else{
      ellipsoid(group,M.coral,0,0,0,.13,.055,.11);
      for(const side of [-1,1])for(let j=0;j<4;j++)segment(group,new THREE.Vector3(side*.1,0,(j-1.5)*.05),new THREE.Vector3(side*.24,-.05,(j-1.5)*.095),.012,M.tan);
      for(const side of [-1,1]){segment(group,new THREE.Vector3(side*.1,0,-.08),new THREE.Vector3(side*.2,.03,-.22),.021,M.coral);ellipsoid(group,M.coral,side*.2,.035,-.24,.045,.025,.065);}
    }
    root.add(group);actors.push({group,kind,phase:i*1.71});
  }
  const bubbleGeo=new THREE.BufferGeometry(),positions=new Float32Array(42*3);bubbleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const bubbles=new THREE.Points(bubbleGeo,new THREE.PointsMaterial({color:'#eefbff',size:.026,transparent:true,opacity:.55,depthWrite:false}));root.add(bubbles);
  const update=(dt,time)=>{
    actors.forEach(({group,kind,phase},i)=>{
      const a=time*(kind==='fish'?.3:.08)+phase;
      group.position.set(x+Math.sin(a)*(kind==='crab'?1.9:2.1),kind==='fish'?bottom+.38+(i%3)*.2+Math.sin(a*2)*.065:bottom+.1,z+Math.cos(a)*.29);
      group.rotation.y=kind==='fish'?Math.atan2(-Math.sin(a)*.29,Math.cos(a)*2.1):Math.sin(a)*.6;
    });
    for(let i=0;i<42;i++){positions[i*3]=x+(i%3-1)*2.1+Math.sin(time+i)*.024;positions[i*3+1]=bottom+((i*.047+time*.2)%1.05);positions[i*3+2]=z+.39;}bubbleGeo.attributes.position.needsUpdate=true;
  };runtime.updates.push(update);update(0,0);
  room.aquarium={x,z,width,depth,bottom,top,actors};return room.aquarium;
}

export function addFountain(api){
  const {root,glassGroup,inst,mats:M,unitCylinder:C,unitTorus:T,runtime}=api;
  const x=.4,z=47.7,radius=1.45;
  inst(C,M.darkMarble,x,.2,z,radius,.35,radius);inst(C,M.bronze,x,.39,z,radius+.02,.055,radius+.02);
  inst(C,M.water,x,.43,z,radius-.13,.025,radius-.13);
  inst(T,M.marble,x,.43,z,radius-.015,radius-.015,radius-.015,Math.PI/2);
  const jets=new THREE.Group();jets.userData.excludeAO=true;root.add(jets);
  const waterMat=new THREE.MeshPhysicalMaterial({color:'#c4e6e8',transparent:true,opacity:.5,roughness:.12,metalness:.18,depthWrite:false});
  for(let j=0;j<8;j++){
    const a=j*Math.PI/4,points=[];
    for(let k=0;k<=28;k++){const t=k/28,r=1.03*(1-t);points.push(new THREE.Vector3(x+Math.cos(a)*r,.47+4*t*(1-t)*1.3,z+Math.sin(a)*r));}
    jets.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,.016,5,false),waterMat));
  }
  const geo=new THREE.BufferGeometry(),positions=new Float32Array(128*3);geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const drops=new THREE.Points(geo,new THREE.PointsMaterial({color:'#e5f9ff',size:.044,transparent:true,opacity:.72,depthWrite:false}));jets.add(drops);
  const rings=[];for(let j=0;j<5;j++){const ring=new THREE.Mesh(new THREE.RingGeometry(.93,1,48),new THREE.MeshBasicMaterial({color:'#d7edf0',transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,.455,z);glassGroup.add(ring);rings.push(ring);}
  const update=(dt,time)=>{for(let i=0;i<128;i++){const t=(time*.57+i/16)%1,a=(i%8)*Math.PI/4,r=1.03*(1-t);positions[i*3]=x+Math.cos(a)*r;positions[i*3+1]=.47+4*t*(1-t)*1.3;positions[i*3+2]=z+Math.sin(a)*r;}geo.attributes.position.needsUpdate=true;rings.forEach((m,i)=>{const t=(time*.29+i/5)%1;m.scale.setScalar(.1+t*1.1);m.material.opacity=(1-t)*.22;});};runtime.updates.push(update);update(0,0);
  return {x,z,radius,jetCount:8,animatedDrops:128};
}
