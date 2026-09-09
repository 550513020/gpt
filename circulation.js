import * as THREE from './vendor/three.module.js';

export function buildCirculation(api){
  const {root,box,slab,inst,tube,glassGroup,mats:M,balustrade,glazing,label}=api;
  const flights=[],walkables=[],landings=[];
  const steel=new THREE.MeshStandardMaterial({color:'#727b7a',roughness:.38,metalness:.72});
  const rubber=new THREE.MeshStandardMaterial({color:'#202721',roughness:.82});
  function platform(x,y,z,w,d){slab(M.marble,x,y-.24,z,w,d,.11,.23);walkables.push({x,z,w,d,y});}
  function rail(x,z,y,w,alongZ=false){
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,1.05),balustrade);mesh.position.set(x,y+.55,z);if(alongZ)mesh.rotation.y=Math.PI/2;glassGroup.add(mesh);
    box(M.bronze,x,y+1.08,z,alongZ?.033:w,.034,alongZ?w:.033);
  }
  for(let floor=0;floor<4;floor++){
    const y=floor*4.65;
    for(const z of [42.55,56.65]){
      if(floor>0){platform(-6.25,y,z,7.9,3.5);rail(-2.32,z,y,3.5,true);}
      landings.push({floor,x:-5.18,z,w:4.55,d:3.15,y});
    }
    if(floor>0){
      rail(-5.55,40.85,y,6.5);rail(-5.55,58.4,y,6.5);
      for(const x of [-10.7,10.7])walkables.push({x,z:52,w:3.12,d:22.3,y});
      for(const z of [41.75,61.85])walkables.push({x:0,z,w:24.3,d:2.2,y});
    }
  }
  // Parallel banks stack vertically. Both directions have flat comb plates and
  // more than 3 m of unobstructed space beyond the balustrade ends.
  for(let floor=0;floor<3;floor++)for(const [bank,x] of [-6.35,-4].entries()){
    const y0=floor*4.65,y1=y0+4.65,z0=45.6,z1=53.65,steps=31,width=1.08;
    for(let i=0;i<steps;i++){
      const t=(i+.5)/steps,z=z0+(z1-z0)*t,y=y0+(y1-y0)*(i+1)/steps;
      box(steel,x,y-.075,z,width,.15,(z1-z0)/steps+.008);
      box(M.gold,x,y+.004,z-.115,width-.025,.012,.019,0,false);
      for(let k=-5;k<=5;k++)box(rubber,x+k*.09,y+.006,z,.012,.008,.2,0,false);
    }
    for(const [z,y] of [[44.95,y0],[54.3,y1]])box(steel,x,y-.045,z,1.08,.09,1.3);
    for(const dx of [-.73,.73]){
      const a=new THREE.Vector3(x+dx,y0-.25,z0),b=new THREE.Vector3(x+dx,y1-.25,z1),length=a.distanceTo(b);
      const g=new THREE.BoxGeometry(.22,.5,length);g.rotateX(-Math.atan2(y1-y0,z1-z0));inst(g,M.concrete,x+dx,(y0+y1)/2-.22,(z0+z1)/2);
      const points=[x+dx,y0,z0,x+dx,y1,z1,x+dx,y1+.86,z1,x+dx,y0,z0,x+dx,y1+.86,z1,x+dx,y0+.86,z0];
      const pane=new THREE.BufferGeometry();pane.setAttribute('position',new THREE.Float32BufferAttribute(points,3));pane.computeVertexNormals();glassGroup.add(new THREE.Mesh(pane,balustrade));
      tube(new THREE.Vector3(x+dx,y0+.9,z0),new THREE.Vector3(x+dx,y1+.9,z1),.045,rubber);
      for(const [z,y] of [[44.95,y0],[54.3,y1]]){box(M.concrete,x+dx,y+.2,z,.22,.45,1.3);box(rubber,x+dx,y+.9,z,.085,.07,1.3);}
    }
    const direction=bank===0?'up':'down';
    label(direction==='up'?'↑ UP':'↓ DOWN',x,y0+.3,44.25,.78,Math.PI,direction==='up'?'#37684b':'#466275','#fff6da');
    flights.push({x,width:1.2,z0,z1,y0,y1,direction,flatStart:44.3,flatEnd:54.95});
    for(const [z,y] of [[44.95,y0],[54.3,y1]])walkables.push({x,z,w:1.14,d:1.3,y});
  }
  // Lift doors face a dedicated 3 m waiting area, connected to the side gallery.
  const liftX=7.1,liftZ=59.05,floors=[0,4.65,9.3,13.95],landingDoors=[];
  for(const y of floors){
    if(y>0){platform(7.75,y,56.17,5.45,3.05);platform(9.68,y,59.36,1.65,3.35);rail(5.02,56.17,y,3.05,true);rail(7.12,54.65,y,4.2);rail(8.855,59.36,y,3.35,true);rail(5.4,57.7,y,.75);}
    landings.push({floor:floors.indexOf(y),x:7.1,z:56.15,w:3.2,d:3.0,y,lift:true});
    label(y===0?'1F':`${floors.indexOf(y)+1}F`,8.78,y+2.18,57.65,.54,Math.PI,'#67553e','#fff5d4');
    for(const dx of [-.92,.92])box(M.bronze,liftX+dx,y+1.24,liftZ-1.35,.11,2.48,.14);
    box(M.bronze,liftX,y+2.51,liftZ-1.35,1.95,.11,.14);
    const pair=[];
    for(const side of [-1,1]){const door=new THREE.Mesh(new THREE.PlaneGeometry(.88,2.42),glazing);door.position.set(liftX+side*(y===0?1.22:.44),y+1.3,liftZ-1.37);glassGroup.add(door);pair.push(door);}
    landingDoors.push(pair);
  }
  for(const dx of [-1.35,1.35])for(const dz of [-1.35,1.35])box(M.bronze,liftX+dx,9.2,liftZ+dz,.105,18.4,.105);
  for(const dx of [-1.28,1.28]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.64,18.1),glazing);p.rotation.y=Math.PI/2;p.position.set(liftX+dx,9.1,liftZ);glassGroup.add(p);}
  const rear=new THREE.Mesh(new THREE.PlaneGeometry(2.64,18.1),glazing);rear.position.set(liftX,9.1,liftZ+1.3);glassGroup.add(rear);
  for(const x of [liftX-.92,liftX+.92])box(steel,x,9.1,liftZ+1.04,.07,18.2,.1);
  const cabin=new THREE.Group();cabin.position.set(liftX,.04,liftZ);root.add(cabin);
  function moving(mat,x,y,z,w,h,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);cabin.add(m);return m;}
  moving(M.marble,0,.02,0,2.4,.1,2.4);moving(M.wood,0,2.65,0,2.4,.12,2.4);moving(M.warmGlow,0,2.57,0,1.5,.025,1.5);
  for(const x of [-1.18,1.18])moving(M.bronze,x,1.3,.95,.06,2.6,.06);
  const cabinGlass=new THREE.Group();glassGroup.add(cabinGlass);cabinGlass.position.copy(cabin.position);
  for(const x of [-1.17,1.17]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.35,2.48),glazing);p.rotation.y=Math.PI/2;p.position.set(x,1.33,0);cabinGlass.add(p);}
  const doors=[];
  for(const side of [-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.87,2.42),glazing);p.position.set(side*.44,1.3,-1.23);cabinGlass.add(p);doors.push(p);}
  doors.forEach((door,i)=>door.position.x=(i?1:-1)*1.22);
  return {flights,walkables,landings,lift:{cabin,cabinGlass,doors,landingDoors,floors,x:liftX,z:liftZ}};
}

export function circulationHeight(circulation,x,z,eyeY){
  let result=null,best=.85;
  for(const f of circulation.flights){
    if(Math.abs(x-f.x)>f.width/2)continue;const t=(z-f.z0)/(f.z1-f.z0);if(t<0||t>1)continue;
    const y=f.y0+(f.y1-f.y0)*t+1.7,d=Math.abs(y-eyeY);if(d<best){best=d;result=y;}
  }
  for(const p of circulation.walkables){if(Math.abs(x-p.x)>p.w/2||Math.abs(z-p.z)>p.d/2)continue;const y=p.y+1.7,d=Math.abs(y-eyeY);if(d<best){best=d;result=y;}}
  return result;
}
