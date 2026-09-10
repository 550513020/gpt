import * as THREE from './vendor/three.module.js';

export function fixtureBlocks(room,x,z,radius=.24){return room.blockers.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius);}

// Route cells reserve one metre of clear width around the centreline. They are
// derived from the same furniture footprints used by first-person collision.
export function planCustomerRoute(room,root,routeGroup){
  const {cx,cz,w,d,base,spec}=room,step=.3,margin=.5;
  const minX=cx-w/2+.9,minZ=cz-d/2+.6,nx=Math.floor((w-1.8)/step)+1,nz=Math.floor((d-1.5)/step)+1;
  const point=id=>({x:minX+(id%nx)*step,z:minZ+Math.floor(id/nx)*step});
  const free=new Uint8Array(nx*nz);
  for(let id=0;id<free.length;id++){const p=point(id);free[id]=fixtureBlocks(room,p.x,p.z,margin)?0:1;}
  const neighbours=id=>{const x=id%nx,z=Math.floor(id/nx);return [x>0?id-1:-1,x<nx-1?id+1:-1,z>0?id-nx:-1,z<nz-1?id+nx:-1].filter(i=>i>=0&&free[i]);};
  function closest(x,z,mask=free){let best=-1,dist=Infinity;for(let i=0;i<mask.length;i++)if(mask[i]){const p=point(i),v=(p.x-x)**2+(p.z-z)**2;if(v<dist){dist=v;best=i;}}return best;}
  const start=closest(cx,minZ),connected=new Uint8Array(free.length),queue=[start];connected[start]=1;
  for(let k=0;k<queue.length;k++)for(const n of neighbours(queue[k]))if(!connected[n]){connected[n]=1;queue.push(n);}
  const reverse=['toys','bags','japanese','ktv'].includes(spec.type)?-1:1;
  const targets=[{x:cx-reverse*w*.25,z:cz-1},{x:cx-reverse*w*.23,z:cz+d*.29},{x:cx+reverse*w*.23,z:cz+d*.29},{x:cx+reverse*w*.23,z:cz-1},room.checkout.queue];
  const stops=[start,...targets.map(p=>closest(p.x,p.z,connected)),start],ids=[];
  function path(a,b){const prev=new Int32Array(free.length).fill(-1),q=[a];prev[a]=a;for(let k=0;k<q.length&&prev[b]<0;k++)for(const n of neighbours(q[k]))if(prev[n]<0){prev[n]=q[k];q.push(n);}const route=[b];while(route[route.length-1]!==a)route.push(prev[route[route.length-1]]);return route.reverse();}
  for(let i=0;i<stops.length-1;i++)ids.push(...path(stops[i],stops[i+1]).slice(i?1:0));
  const points=ids.map(point),geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p.x,base+(spec.type==='cinema'?.93:.285),p.z)));
  const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'#40cbb5',transparent:true,opacity:.8,depthTest:false}));line.renderOrder=20;line.userData.excludeAO=true;routeGroup.add(line);
  const arrows=new THREE.Group();for(let i=8;i<points.length;i+=14){const a=points[i-1],b=points[i],direction=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize(),arrow=new THREE.ArrowHelper(direction,new THREE.Vector3(b.x,base+.29,b.z),.55,0x40cbb5,.2,.14);arrow.userData.excludeAO=true;arrows.add(arrow);}routeGroup.add(arrows);
  return {clearWidth:margin*2,points,closed:ids[0]===ids[ids.length-1],connectedCells:queue.length,stops:stops.map(point),entryDistance:Math.abs(point(start).x-cx)};
}

export function shopBlocks(model,position,x,z){
  const f=model.fountain;if(Math.hypot(x-f.x,z-f.z)<f.radius+.27&&position.y<3)return true;
  for(const room of model.runtime.rooms){
    if(Math.abs(position.y-room.base-1.8)>1.5)continue;
    const inside=(px,pz)=>Math.abs(px-room.cx)<room.w/2&&Math.abs(pz-room.cz)<room.d/2;
    const before=inside(position.x,position.z),after=inside(x,z);
    if(before!==after){
      const atDoor=Math.abs(x-room.entry.x)<1.14&&z<room.entry.z+.6&&position.z<room.entry.z+.6;
      if(!atDoor||(room.door&&room.door.open<.85))return true;
    }
    if(after&&fixtureBlocks(room,x,z))return true;
  }
  return false;
}
