import * as THREE from './vendor/three.module.js';

export function buildRooftop(api){
  const {box,slab,inst,sphere,tube,mats:M,unitCylinder:C,unitTorus:T,glassGroup,balustrade,root,label}=api;
  const y=18.68,flights=[],walkables=[],obstacles=[];
  const turf=new THREE.MeshStandardMaterial({color:'#376b48',roughness:.97});
  const stripe=new THREE.MeshStandardMaterial({color:'#427754',roughness:.98});
  function rail(a,b,height=1.12){
    tube(new THREE.Vector3(a[0],y+height,a[1]),new THREE.Vector3(b[0],y+height,b[1]),.025,M.bronze);
    const length=Math.hypot(b[0]-a[0],b[1]-a[1]),pane=new THREE.Mesh(new THREE.PlaneGeometry(length,height),balustrade);
    pane.position.set((a[0]+b[0])/2,y+height/2,(a[1]+b[1])/2);pane.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);glassGroup.add(pane);
    for(let t=0;t<=1;t+=1/Math.ceil(length/2.5))box(M.bronze,THREE.MathUtils.lerp(a[0],b[0],t),y+height/2,THREE.MathUtils.lerp(a[1],b[1],t),.027,height,.027);
  }
  for(const cx of [-16,16]){
    slab(M.stone,cx,y-.03,0,23.8,19.8,3.3,.025);walkables.push({x:cx,z:0,w:23.8,d:19.8,r:3.3,y});
    const points=[[-11.8,-6.8],[-10.8,-8.6],[-8.4,-9.8],[8.4,-9.8],[10.8,-8.6],[11.8,-6.8],[11.8,6.8],[10.8,8.6],[8.4,9.8],[-8.4,9.8],[-10.8,8.6],[-11.8,6.8],[-11.8,-6.8]];
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1];
      if((cx<0&&a[0]>10&&a[1]>5)||(cx>0&&a[0]<-10&&a[1]>5))continue;
      if(a[1]===9.8&&b[1]===9.8){const openings=cx>0?[[11.55,16.35],[18.85,21.15]]:[[-21.15,-18.85]],cuts=[cx+b[0],cx+a[0],...openings.flat()].sort((a,b)=>a-b);for(let k=0;k<cuts.length-1;k++){const mid=(cuts[k]+cuts[k+1])/2;if(mid<cx+b[0]||mid>cx+a[0]||openings.some(([lo,hi])=>mid>lo&&mid<hi))continue;rail([cuts[k],9.8],[cuts[k+1],9.8]);}}
      else if((cx<0&&a[0]===11.8&&b[0]===11.8)||(cx>0&&a[0]===-11.8&&b[0]===-11.8)){rail([cx+a[0],a[1]],[cx+a[0],5.85]);}
      else rail([cx+a[0],a[1]],[cx+b[0],b[1]]);
    }
  }
  slab(M.concrete,0,y-.23,7,9.3,2.2,.15,.23);walkables.push({x:0,z:7,w:9.3,d:2.2,y});rail([-4.65,5.9],[4.65,5.9]);rail([-4.65,8.1],[4.65,8.1]);
  function planter(x,z,w=2.2,d=1.05,tall=false){
    obstacles.push({x,z,w:w+.35,d:d+.35,base:y});
    slab(M.concrete,x,y+.02,z,w,d,.18,.52);box(M.soil,x,y+.56,z,w-.12,.045,d-.12);
    for(let i=0;i<18;i++)sphere(i%3?M.leaf:M.leafLight,x+Math.sin(i*2.4)*(w*.4),y+.68+(i%3)*.075,z+Math.cos(i*2.4)*(d*.34),.24,.24,.22);
    if(tall){tube(new THREE.Vector3(x,y+.5,z),new THREE.Vector3(x+.08,y+2.55,z),.07,M.bark);for(let i=0;i<16;i++)sphere(i%2?M.leafLight:M.leaf,x+Math.sin(i*2.4)*.85,y+2.55+Math.cos(i*.7)*.3,z+Math.cos(i*2.4)*.75,.46,.31,.42);}
  }
  for(const x of [-24.8,-7.2])for(const z of [-5,1,7])planter(x,x===-7.2&&z===7?4.5:z,2.0,1.1,z!==1);
  for(const z of [-7.9,7.9])for(const x of [-21,-16,-11])if(!(x===-21&&z===7.9))planter(x,z,3.4,1.1);
  slab(M.wood,-16,y+.03,0,10.8,10,.7,.05);
  for(const x of [-19.4,-12.6])for(const z of [-3.2,3.2]){
    slab(M.walnut,x,y+.45,z,2.55,.8,.14,.13);for(const dx of [-.95,.95])box(M.darkMetal,x+dx,y+.22,z,.11,.44,.52);
    inst(C,M.marble,x,y+.53,z+(z<0?1.45:-1.45),.53,.08,.53);inst(C,M.bronze,x,y+.29,z+(z<0?1.45:-1.45),.055,.48,.055);
  }
  for(const x of [-20.8,-11.2])for(const z of [-4.5,4.5])box(M.bronze,x,y+1.75,z,.09,3.5,.09);
  for(let i=0;i<21;i++)box(M.wood,-20.8+i*.48,y+3.55,0,.12,.15,9.6);
  label('ROOF GARDEN · 空中花园',-16,y+.18,8.2,6,Math.PI,'#5b6b4d','#eadbbe');
  // Garden café: open centre walk, planted edges and shaded seating islands.
  const sage=new THREE.MeshStandardMaterial({color:'#8aa087',roughness:.9});
  slab(M.wood,16,y+.055,-.3,16,14,.8,.06);
  function obstacle(x,z,w,d){obstacles.push({x,z,w,d,base:y});}
  slab(M.marble,20.6,y+.15,4.2,6.2,1.5,.25,.91);obstacle(20.6,4.2,6.3,1.6);
  box(M.walnut,20.6,y+.71,4.97,6.2,1.1,.18);
  box(M.darkMetal,21.7,y+1.43,4.2,1.15,.6,.7);box(M.black,18.3,y+1.43,4.05,.48,.4,.08);
  for(const x of [20.7,21.15,22.55]){inst(C,M.ivory,x,y+1.17,3.91,.1,.17,.1);inst(C,M.bronze,x,y+1.26,3.91,.08,.012,.08);}
  label('云上咖啡 · GARDEN CAFÉ',20.6,y+2.7,5.22,6,Math.PI,'#496852','#f4e7ca');
  for(const x of [17.5,23.8])for(const z of [2.8,5.4])box(M.bronze,x,y+1.65,z,.085,3.3,.085);
  for(let j=0;j<18;j++)box(M.wood,17.5+j*.37,y+3.35,4.1,.11,.13,3.2);
  for(const x of [10,16,22])for(const z of [-5.2,-.4]){
    inst(C,M.marble,x,y+.79,z,.78,.08,.78);inst(C,M.bronze,x,y+.42,z,.06,.74,.06);obstacle(x,z,1.65,1.65);
    for(const side of [-1,1]){slab(sage,x+side*1.2,y+.32,z,.65,.7,.12,.18);box(sage,x+side*1.48,y+.78,z,.13,.68,.7);obstacle(x+side*1.2,z,.72,.75);}
    inst(C,M.ivory,x-.2,y+.9,z,.09,.13,.09);inst(C,M.cream,x+.2,y+.86,z,.19,.065,.19);
  }
  for(const x of [7.2,24.7])for(const z of [-5.5,.1,6.3])planter(x,z,1.2,2.1,true);
  for(const x of [11,16,21])planter(x,-8.1,3.2,1.05);
  // Flower beds use restrained variations in foliage and flower colour.
  for(const x of [9,13]){planter(x,4.5,2.5,1.4);for(let j=0;j<18;j++)sphere(j%3?M.cream:M.pink,x+Math.sin(j*2.4),y+.94,4.5+Math.cos(j*2.4)*.46,.065,.09,.065);}
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
  return {y,flights,walkables,obstacles};
}
