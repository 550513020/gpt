import * as THREE from './vendor/three.module.js';

export function buildRooftop(api){
  const {box,slab,inst,sphere,tube,mats:M,unitCylinder:C,unitTorus:T,glassGroup,balustrade,root,label}=api;
  const y=18.68,flights=[],walkables=[];
  const turf=new THREE.MeshStandardMaterial({color:'#376b48',roughness:.97});
  const stripe=new THREE.MeshStandardMaterial({color:'#427754',roughness:.98});
  function rail(a,b,height=1.12){
    tube(new THREE.Vector3(a[0],y+height,a[1]),new THREE.Vector3(b[0],y+height,b[1]),.025,M.bronze);
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]),pane=new THREE.Mesh(new THREE.PlaneGeometry(length,height),balustrade);
    pane.position.set((a[0]+b[0])/2,y+height/2,(a[1]+b[1])/2);pane.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);glassGroup.add(pane);
    for(let t=0;t<=1;t+=1/Math.ceil(length/2.5))box(M.bronze,THREE.MathUtils.lerp(a[0],b[0],t),y+height/2,THREE.MathUtils.lerp(a[1],b[1],t),.027,height,.027);
  }
  for(const cx of [-16,16]){
    slab(M.stone,cx,y-.03,0,23.8,19.8,3.3,.025);walkables.push({x:cx,z:0,w:23,d:19,y});
    const points=[[-11.8,-6.8],[-10.8,-8.6],[-8.4,-9.8],[8.4,-9.8],[10.8,-8.6],[11.8,-6.8],[11.8,6.8],[10.8,8.6],[8.4,9.8],[-8.4,9.8],[-10.8,8.6],[-11.8,6.8],[-11.8,-6.8]];
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1];
      if((cx<0&&a[0]>10&&a[1]>5)||(cx>0&&a[0]<-10&&a[1]>5))continue;
      if(cx>0&&a[1]===9.8&&b[1]===9.8){rail([cx+a[0],a[1]],[16.35,9.8]);rail([11.55,9.8],[cx+b[0],b[1]]);}
      else if((cx<0&&a[0]===11.8&&b[0]===11.8)||(cx>0&&a[0]===-11.8&&b[0]===-11.8)){rail([cx+a[0],a[1]],[cx+a[0],5.85]);}
      else rail([cx+a[0],a[1]],[cx+b[0],b[1]]);
    }
  }
  slab(M.concrete,0,y-.23,7,9.3,2.2,.15,.23);walkables.push({x:0,z:7,w:9.3,d:2.2,y});rail([-4.65,5.9],[4.65,5.9]);rail([-4.65,8.1],[4.65,8.1]);
  function planter(x,z,w=2.2,d=1.05,tall=false){
    slab(M.concrete,x,y+.02,z,w,d,.18,.52);box(M.soil,x,y+.56,z,w-.12,.045,d-.12);
    for(let i=0;i<18;i++)sphere(i%3?M.leaf:M.leafLight,x+Math.sin(i*2.4)*(w*.4),y+.68+(i%3)*.075,z+Math.cos(i*2.4)*(d*.34),.24,.24,.22);
    if(tall){tube(new THREE.Vector3(x,y+.5,z),new THREE.Vector3(x+.08,y+2.55,z),.07,M.bark);for(let i=0;i<16;i++)sphere(i%2?M.leafLight:M.leaf,x+Math.sin(i*2.4)*.85,y+2.55+Math.cos(i*.7)*.3,z+Math.cos(i*2.4)*.75,.46,.31,.42);}
  }
  for(const x of [-24.8,-7.2])for(const z of [-5,1,7])planter(x,z,2.0,1.1,z!==1);
  for(const z of [-7.9,7.9])for(const x of [-21,-16,-11])planter(x,z,3.4,1.1);
  slab(M.wood,-16,y+.03,0,10.8,10,.7,.05);
  for(const x of [-19.4,-12.6])for(const z of [-3.2,3.2]){
    slab(M.walnut,x,y+.45,z,2.55,.8,.14,.13);for(const dx of [-.95,.95])box(M.darkMetal,x+dx,y+.22,z,.11,.44,.52);
    inst(C,M.marble,x,y+.53,z+(z<0?1.45:-1.45),.53,.08,.53);inst(C,M.bronze,x,y+.29,z+(z<0?1.45:-1.45),.055,.48,.055);
  }
  for(const x of [-20.8,-11.2])for(const z of [-4.5,4.5])box(M.bronze,x,y+1.75,z,.09,3.5,.09);
  for(let i=0;i<21;i++)box(M.wood,-20.8+i*.48,y+3.55,0,.12,.15,9.6);
  label('ROOF GARDEN · 空中花园',-16,y+.18,8.2,6,Math.PI,'#5b6b4d','#eadbbe');
  // A compact practice pitch fits the right roof, with a perimeter path outside.
  slab(turf,16,y+.065,-.4,8.5,13,.1,.035);
  for(let j=0;j<7;j++)box(j%2?stripe:turf,16,y+.107,-6.0+j*1.86,8.43,.004,1.83,0,false);
  for(const x of [11.8,20.2])box(M.ivory,x,y+.115,-.4,.045,.009,12.85,0,false);
  for(const z of [-6.78,-.4,5.98])box(M.ivory,16,y+.115,z,8.42,.009,.045,0,false);
  inst(T,M.ivory,16,y+.118,-.4,1.18,1.18,1.18,Math.PI/2,0,0,false);
  const netPoints=[];
  function net(a,b,height,spacing=.32,ground=y){
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let h=0;h<=height;h+=spacing)netPoints.push(a[0],ground+h,a[1],b[0],ground+h,b[1]);
    for(let d=0;d<=length;d+=spacing){const t=d/length,x=THREE.MathUtils.lerp(a[0],b[0],t),z=THREE.MathUtils.lerp(a[1],b[1],t);netPoints.push(x,ground,a[1]+(b[1]-a[1])*t,x,ground+height,z);}
  }
  for(const z of [-6.62,5.82]){
    const back=z+(z<0?-.68:.68);for(const x of [14.7,17.3]){tube(new THREE.Vector3(x,y+.13,z),new THREE.Vector3(x,y+1.73,z),.043,M.ivory);tube(new THREE.Vector3(x,y+1.73,z),new THREE.Vector3(x,y+1.73,back),.035,M.ivory);net([x,z],[x,back],1.6,.15,y+.13);}
    tube(new THREE.Vector3(14.7,y+1.73,z),new THREE.Vector3(17.3,y+1.73,z),.043,M.ivory);net([14.7,back],[17.3,back],1.6,.15,y+.13);
    for(const x of [14.4,17.6])box(M.ivory,x,y+.115,z+(z<0?.8:-.8),.04,.009,1.55,0,false);box(M.ivory,16,y+.115,z+(z<0?1.56:-1.56),3.2,.009,.04,0,false);
  }
  for(const x of [10.8,21.2]){net([x,-7.6],[x,6.9],2.6);for(const z of [-7.6,-2.8,2,6.9])box(M.darkMetal,x,y+1.32,z,.046,2.64,.046);}
  net([10.8,-7.6],[21.2,-7.6],2.6);net([10.8,6.9],[15.1,6.9],2.6);net([16.9,6.9],[21.2,6.9],2.6);
  for(const x of [15.1,16.9])box(M.darkMetal,x,y+1.32,6.9,.046,2.64,.046);
  const netG=new THREE.BufferGeometry();netG.setAttribute('position',new THREE.Float32BufferAttribute(netPoints,3));root.add(new THREE.LineSegments(netG,new THREE.LineBasicMaterial({color:'#455447',transparent:true,opacity:.52})));
  sphere(M.ivory,17.1,y+.34,.3,.22);for(let i=0;i<10;i++){const a=i*2.4,b=i/9*Math.PI;sphere(M.black,17.1+Math.sin(b)*Math.cos(a)*.214,y+.34+Math.cos(b)*.214,.3+Math.sin(b)*Math.sin(a)*.214,.047);}
  for(const z of [-5,0,5])planter(24.3,z,1.3,2.4,z!==0);
  // Switchback stairs begin on the 4F terrace, passing through a railing opening.
  const mid=(13.95+y)/2;
  for(const f of [{x:12.4,z0:9.2,z1:13,y0:13.95,y1:mid},{x:15.3,z0:13,z1:9.2,y0:mid,y1:y}]){
    for(let i=0;i<15;i++){const t=(i+.5)/15;box(M.concrete,f.x,f.y0+(f.y1-f.y0)*(i+1)/15-.09,THREE.MathUtils.lerp(f.z0,f.z1,t),1.7,.18,.262);}
    for(const dx of [-.93,.93]){tube(new THREE.Vector3(f.x+dx,f.y0+1.02,f.z0),new THREE.Vector3(f.x+dx,f.y1+1.02,f.z1),.025,M.bronze);for(let i=0;i<=5;i++){const t=i/5;box(M.bronze,f.x+dx,THREE.MathUtils.lerp(f.y0,f.y1,t)+.5,THREE.MathUtils.lerp(f.z0,f.z1,t),.025,1,.025);}}
    flights.push({...f,width:1.7});
  }
  for(const p of [{x:13.85,z:13.7,w:4.65,d:1.4,y:mid},{x:15.3,z:8.65,w:2.0,d:1.25,y},{x:12.4,z:8.75,w:2.0,d:1.05,y:13.95}]){slab(M.concrete,p.x,p.y-.19,p.z,p.w,p.d,.08,.19);walkables.push(p);}
  tube(new THREE.Vector3(11.55,mid+1.05,14.37),new THREE.Vector3(16.15,mid+1.05,14.37),.028,M.bronze);
  label('屋顶花园 ↑',12.4,15.7,9.2,1.5,Math.PI,'#536849','#f2e4c5');
  return {y,flights,walkables};
}
