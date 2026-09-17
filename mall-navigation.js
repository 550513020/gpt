import * as THREE from './vendor/three.module.js';
import { fixtureBlocks } from './shop-routes.js?v=11';
import { circulationHeight } from './circulation.js?v=11';

export const LEVELS=[0,4.65,9.3,13.95,18.68,-4.2,-8.4];
export const levelAt=y=>LEVELS.reduce((best,h,i)=>Math.abs(y-h-1.7)<Math.abs(y-LEVELS[best]-1.7)?i:best,0);
const inRect=(x,z,p,margin=0)=>Math.abs(x-p.x)<=p.w/2-margin&&Math.abs(z-p.z)<=p.d/2-margin;
export function roundedDistance(x,z,cx,cz,w,d,r){const qx=Math.abs(x-cx)-w/2+r,qz=Math.abs(z-cz)-d/2+r;return Math.min(Math.max(qx,qz),0)+Math.hypot(Math.max(qx,0),Math.max(qz,0))-r;}
function segmentDistance(x,z,s){const dx=s.bx-s.ax,dz=s.bz-s.az,t=THREE.MathUtils.clamp(((x-s.ax)*dx+(z-s.az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-s.ax-t*dx,z-s.az-t*dz);}

export function createMallNavigator(model){
  const rooms=model.runtime.rooms,barriers=Array.from({length:LEVELS.length},()=>[]),seen=new Set(),world=[];
  model.root.updateMatrixWorld(true);
  model.glassGroup.traverse(o=>{
    if(!o.isMesh||o.material!==model.balustrade)return;
    const attr=o.geometry.attributes.position,index=o.geometry.index,ids=index?index.array:Array.from({length:attr.count},(_,i)=>i);
    for(let i=0;i<ids.length;i+=3){const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(attr,ids[i+j]).applyMatrix4(o.matrixWorld));const ys=vertices.map(p=>p.y),height=Math.max(...ys)-Math.min(...ys);if(height<.6||height>1.5)continue;
      const pairs=[];for(const a of vertices)if(!pairs.some(b=>Math.hypot(a.x-b.x,a.z-b.z)<.005))pairs.push(a);if(pairs.length!==2)continue;
      const [a,b]=pairs,f=levelAt(Math.min(...ys)+1.7),key=[f,...[`${a.x.toFixed(3)},${a.z.toFixed(3)}`,`${b.x.toFixed(3)},${b.z.toFixed(3)}`].sort()].join(':');if(seen.has(key))continue;seen.add(key);
      barriers[f].push({ax:a.x,az:a.z,bx:b.x,bz:b.z,minX:Math.min(a.x,b.x)-.25,maxX:Math.max(a.x,b.x)+.25,minZ:Math.min(a.z,b.z)-.25,maxZ:Math.max(a.z,b.z)+.25});
    }
  });
  for(const x of [-3,3])for(const z of [15,23,31])world.push({x,z,w:2.05,d:2.05,base:0});
  for(const [x,z] of [[-1.75,18],[1.75,27.4],[-2.3,35]])world.push({x,z,w:1.05,d:1.05,base:0});
  world.push({x:-.2,z:54.6,w:4.4,d:6.4,base:0});
  for(const z of [46.5,51.6])world.push({x:-7.5,z,w:3,d:.8,base:0},{x:-5.6,z,w:1.02,d:1.02,base:0});
  for(const y of [0,4.65])for(const x of [-11,11])world.push({x,z:38.8,w:15,d:.55,base:y});
  for(const y of LEVELS.slice(0,4))for(const z of [-7.65,1.1,10.8,34.5])if(!(y===13.95&&z===34.5))for(const x of [-3.36,3.36])world.push({x,z,w:.48,d:.76,base:y});
  world.push(...model.services.blockers,...model.air.obstacles,...model.roof.obstacles,...model.runtime.exteriorBlocks,...model.parking.obstacles);
  const rects=LEVELS.map((y,f)=>[
    ...model.parking.walkables.filter(p=>Math.abs(p.y-y)<.1),
    ...model.atrium.walkables.filter(p=>Math.abs(p.y-y)<.1),...model.services.walkables.filter(p=>Math.abs(p.y-y)<.1),...model.express.walkables.filter(p=>Math.abs(p.y-y)<.1),
    ...(f===4?[...model.roof.walkables,...model.air.walkables]:f>0&&f<4?[{x:0,z:8.5,w:11.4,d:2.2,y},{x:0,z:33.6,w:13,d:2.2,y},{x:0,z:37.65,w:3.15,d:6.4,y},...[-20,20].map(x=>({x,z:12.2,w:4.6,d:4.65,y}))]:[])
  ]);
  function supported(x,z,f){
    if(f===0)return x>-42&&x<42&&z>-30&&z<68.1&&!(x>40.2&&z>-21.3&&z<45.3);
    if(f<4&&model.runtime.terraces.some(r=>Math.abs(r.y-LEVELS[f])<.1&&roundedDistance(x,z,r.x,r.z,r.w,r.d,r.r)<-.1))return true;
    return rects[f].some(p=>p.r?roundedDistance(x,z,p.x,p.z,p.w,p.d,p.r)<-.14:inRect(x,z,p,.01));
  }
  function clear(x,z,f,doors=false){
    if(!supported(x,z,f))return false;const y=LEVELS[f];
    for(const r of rooms){if(Math.abs(r.base-y)>.1)continue;const sd=roundedDistance(x,z,r.cx,r.cz,r.w,r.d,2.6),entry=Math.abs(x-r.cx)<1.13&&Math.abs(z-r.entry.z)<.55;
      if(Math.abs(sd)<.26&&!entry)return false;
      if(sd<.1){if(fixtureBlocks(r,x,z,.21))return false;
        if(z>r.cz+r.d/2-.8)return false;
        if(Math.abs(Math.abs(x-r.cx)-(r.w/2-.53))<.21&&Math.abs(z-r.cz-.55)<(r.d-3.8)/2+.2)return false;
      }
      if(doors&&r.door&&r.door.open<.85&&Math.abs(x-r.cx)<1.4&&Math.abs(z-r.door.z)<.27)return false;
    }
    if(f<4&&Math.abs(z-63.22)<.32&&Math.abs(x)<12.3&&Math.abs(x+3.5)>1.0)return false;
    if(model.atrium.flights.some(r=>(f===r.lowerFloor||f===r.upperFloor)&&Math.abs(x-r.x)<.87&&z>44.3&&z<54.95))return false;
    if([model.atrium.lift,model.express].some(l=>Math.abs(x-l.x)<1.42&&Math.abs(z-l.z)<1.42))return false;
    if(f===0&&Math.hypot(x-model.fountain.x,z-model.fountain.z)<model.fountain.radius+.23)return false;
    if(world.some(b=>Math.abs(b.base-y)<.1&&inRect(x,z,b,-.19)))return false;
    return !barriers[f].some(b=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ&&segmentDistance(x,z,b)<.19);
  }
  const cache=new Map(),step=.42,minX=-33.6,minZ=-13.5,nx=190,nz=199;
  function grid(f){if(cache.has(f))return cache.get(f);const free=new Uint8Array(nx*nz);for(let i=0;i<free.length;i++)free[i]=clear(minX+(i%nx)*step,minZ+Math.floor(i/nx)*step,f)?1:0;cache.set(f,free);return free;}
  const coord=i=>new THREE.Vector3(minX+(i%nx)*step,0,minZ+Math.floor(i/nx)*step);
  function closest(p,f){const free=grid(f);let best=-1,dist=Infinity;for(let i=0;i<free.length;i++)if(free[i]){const v=coord(i),d=(v.x-p.x)**2+(v.z-p.z)**2;if(d<dist){dist=d;best=i;}}if(dist>2.5**2)throw Error(`No walkable point near ${p.x},${p.z} at ${f+1}F`);return best;}
  const edgeCache=new Map();
  function edgeClear(a,b,f){
    const key=f*nx*nz*2+Math.min(a,b)*2+(Math.abs(a-b)===1?0:1);
    if(edgeCache.has(key))return edgeCache.get(key);
    const p=coord(a),q=coord(b);let free=true;
    for(let k=1;k<6;k++){const t=k/6;if(!clear(p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t,f)){free=false;break;}}
    edgeCache.set(key,free);return free;
  }
  function plan(from,to,f){
    const free=grid(f),a=closest(from,f),b=closest(to,f),prev=new Int32Array(free.length).fill(-1),queue=[a];prev[a]=a;
    // Breadth-first routes deliberately use square corners, so they cannot cut
    // through the corner of a glass balustrade as a spline sometimes does.
    for(let k=0;k<queue.length&&prev[b]<0;k++){const i=queue[k],ix=i%nx,iz=Math.floor(i/nx);for(const n of [ix>0?i-1:-1,ix<nx-1?i+1:-1,iz>0?i-nx:-1,iz<nz-1?i+nx:-1])if(n>=0&&free[n]&&prev[n]<0&&edgeClear(i,n,f)){prev[n]=i;queue.push(n);}}
    if(prev[b]<0)throw Error(`Disconnected ${f+1}F: ${from.x},${from.z} -> ${to.x},${to.z}`);
    const ids=[b];while(ids.at(-1)!==a)ids.push(prev[ids.at(-1)]);ids.reverse();const points=ids.map(i=>coord(i).setY(LEVELS[f]+1.7));
    if(clear(from.x,from.z,f))points.unshift(new THREE.Vector3(from.x,LEVELS[f]+1.7,from.z));if(clear(to.x,to.z,f))points.push(new THREE.Vector3(to.x,LEVELS[f]+1.7,to.z));
    // Reduce only collinear runs; geometry-safe corners remain exact.
    const corners=points.filter((p,i)=>!i||i===points.length-1||Math.abs((p.x-points[i-1].x)*(points[i+1].z-p.z)-(p.z-points[i-1].z)*(points[i+1].x-p.x))>.0001);
    const result=[corners[0]];
    for(let i=0;i<corners.length-1;){let next=i+1;for(let j=corners.length-1;j>i+1;j--){const a=corners[i],b=corners[j],count=Math.ceil(a.distanceTo(b)/.07);let safe=true;for(let k=1;k<count;k++){const t=k/count;if(!clear(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,f)){safe=false;break;}}if(safe){next=j;break;}}result.push(corners[next]);i=next;}
    return result;
  }
  function move(position,delta){
    const out=position.clone(),steps=Math.max(1,Math.ceil(delta.length()/.12)),part=delta.clone().divideScalar(steps);
    function tryPoint(x,z){
      const stair=circulationHeight(model.atrium,x,z,out.y)??circulationHeight(model.roof,x,z,out.y),f=levelAt(out.y);
      const onFlight=[...model.atrium.flights,...model.roof.flights].some(r=>Math.abs(x-r.x)<r.width/2-.13&&z>=Math.min(r.z0,r.z1)&&z<=Math.max(r.z0,r.z1)&&stair!==null);
      const onComb=model.atrium.walkables.some(r=>r.w<1.2&&inRect(x,z,r,-.055)&&Math.abs(out.y-r.y-1.7)<.85);
      const lift=[model.atrium.lift,model.express].find(l=>Math.abs(x-l.x)<1.3&&Math.abs(z-l.z)<1.8)||model.atrium.lift,atCab=Math.abs(x-lift.x)<1.08&&z>lift.z-1.45&&z<lift.z+1.03&&Math.abs(out.y-lift.cabin.position.y-1.7)<.55&&lift.open>.85;
      if(!(onFlight||onComb||atCab||clear(x,z,f,true)))return false;
      out.x=x;out.z=z;out.y=(onFlight||onComb)&&stair!==null?stair:atCab?lift.cabin.position.y+1.7:LEVELS[f]+1.7;return true;
    }
    for(let i=0;i<steps;i++)if(!tryPoint(out.x+part.x,out.z+part.z)){tryPoint(out.x+part.x,out.z);tryPoint(out.x,out.z+part.z);}
    return out;
  }
  return {plan,clear,supported,move,barriers,world,rects,closest,grid,coord,step};
}
