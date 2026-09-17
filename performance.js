import * as THREE from './vendor/three.module.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

// Geometry is baked by material and small spatial cells. A distant shop therefore
// no longer keeps every bracelet, toy and leaf in a mall-wide instance batch alive.
export function buildSpatialBatches(batches,root){
  const buckets=new Map(),size=new THREE.Vector3(),scale=new THREE.Vector3(),pos=new THREE.Vector3(),q=new THREE.Quaternion();
  for(const batch of batches.values()){
    batch.geo.computeBoundingBox();batch.geo.boundingBox.getSize(size);
    for(const matrix of batch.matrices){
      matrix.decompose(pos,q,scale);const extent=Math.max(size.x*scale.x,size.y*scale.y,size.z*scale.z);
      const kind=batch.mat.userData.foliage?'foliage':extent<1.45?'detail':extent<3?'furniture':'structure';
      const cell=kind==='structure'?28:kind==='foliage'?12:16;
      const key=[batch.mat.uuid,batch.cast,kind,Math.floor(pos.x/cell),Math.floor(pos.y/4.65),Math.floor(pos.z/cell)].join('/');
      if(!buckets.has(key))buckets.set(key,{mat:batch.mat,cast:batch.cast,kind,entries:[]});buckets.get(key).entries.push({geo:batch.geo,matrix});
    }
  }
  const canopies=new Map(),canopyMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});
  for(const b of buckets.values()){
    const parts=b.entries.map(({geo,matrix})=>{const g=geo.clone();for(const name of Object.keys(g.attributes))if(!['position','normal','uv'].includes(name))g.deleteAttribute(name);if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!g.index){const arr=Array.from({length:g.attributes.position.count},(_,i)=>i);g.setIndex(arr);}return g.applyMatrix4(matrix);});
    const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(!geometry)throw Error('Spatial geometry merge failed');
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const mesh=new THREE.Mesh(geometry,b.mat);mesh.castShadow=b.cast;mesh.receiveShadow=true;mesh.userData.lodKind=b.kind;root.add(mesh);
    if(b.kind==='foliage'){
      const bounds=geometry.boundingBox,extent=bounds.getSize(new THREE.Vector3());
      const center=bounds.getCenter(new THREE.Vector3()),key=[Math.floor(center.x/12),Math.floor(center.y/4.65),Math.floor(center.z/12)].join('/');
      if(!canopies.has(key))canopies.set(key,{parts:[],high:[],bounds:new THREE.Box3()});
      const cluster=canopies.get(key),smallCanopies=new Map();
      // Preserve gaps between planters: one 12 m bounding ellipsoid used to fill
      // the café aisles when several unrelated shrubs shared a distant batch.
      for(const e of b.entries){const p=new THREE.Vector3().setFromMatrixPosition(e.matrix),id=[Math.floor(p.x/2.4),Math.floor(p.y/2.4),Math.floor(p.z/2.4)].join('/');if(!smallCanopies.has(id))smallCanopies.set(id,new THREE.Box3());smallCanopies.get(id).union(e.geo.boundingBox.clone().applyMatrix4(e.matrix));}
      for(const bounds of smallCanopies.values()){
        const extent=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),g=new THREE.IcosahedronGeometry(1,1);g.scale(extent.x*.5,extent.y*.5,extent.z*.5);g.translate(center.x,center.y,center.z);
        const colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=b.mat.color.r;colors[i+1]=b.mat.color.g;colors[i+2]=b.mat.color.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));cluster.parts.push(g);
      }
      cluster.high.push(mesh);cluster.bounds.union(bounds);
    }
  }
  for(const cluster of canopies.values()){
    const geometry=mergeGeometries(cluster.parts,false);cluster.parts.forEach(g=>g.dispose());
    const proxy=new THREE.Mesh(geometry,canopyMaterial);proxy.castShadow=true;proxy.receiveShadow=true;proxy.userData.lodKind='canopy';proxy.userData.highDetail=cluster.high;root.add(proxy);
    for(const mesh of cluster.high)mesh.userData.lodBounds=cluster.bounds;
  }
}

export function createScenePerformance(model,{mobile=false}={}){
  const materials=new Set(),moving=new Set([...model.atrium.lift.landingDoors.flat(),...model.express.landingDoors.flat()]);
  // Thin, nearly reflection-free glass is represented by alpha glazing. It avoids
  // rendering the entire mall a second time for physical transmission each frame.
  model.glassGroup.traverse(o=>{if(o.isMesh&&o.material.transmission>0)materials.add(o.material);});
  for(const material of materials){material.transmission=0;material.transparent=true;material.opacity=[model.atrium.lift.doorGlass,model.express.doorGlass].includes(material)?.23:.075;material.depthWrite=false;material.forceSinglePass=true;material.needsUpdate=true;}
  // Cockpit windows and jade props must not silently reactivate the expensive
  // whole-scene transmission pass after architectural glass has been simplified.
  const remaining=new Set();model.root.traverse(o=>{if(o.isMesh)for(const mat of Array.isArray(o.material)?o.material:[o.material])if(mat.transmission>0)remaining.add(mat);});
  for(const mat of remaining){const window=mat.transmission>=.4;mat.transmission=0;mat.transparent=window;mat.opacity=window?.3:1;mat.depthWrite=!window;mat.forceSinglePass=true;mat.needsUpdate=true;}
  model.root.updateMatrixWorld(true);
  const panes=new Map();
  for(const mesh of [...model.glassGroup.children]){
    if(!mesh.isMesh||!materials.has(mesh.material)||moving.has(mesh))continue;
    const p=mesh.position,key=[mesh.material.uuid,Math.floor(p.x/24),Math.floor(p.y/4.65),Math.floor(p.z/24)].join('/');
    if(!panes.has(key))panes.set(key,{mat:mesh.material,parts:[]});let g=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);if(g.index)g=g.toNonIndexed();panes.get(key).parts.push(g);model.glassGroup.remove(mesh);
  }
  for(const b of panes.values()){const g=mergeGeometries(b.parts,false);b.parts.forEach(p=>p.dispose());const mesh=new THREE.Mesh(g,b.mat);mesh.userData.lodKind='glass';model.glassGroup.add(mesh);}
  model.root.updateMatrixWorld(true);
  const entries=[],mirrors=model.runtime.rooms.flatMap(r=>r.mirrors.map(m=>m.mesh));
  model.root.traverse(o=>{if(o.userData.lodKind){const bounds=o.userData.lodBounds||new THREE.Box3().setFromObject(o);entries.push({o,bounds,kind:o.userData.lodKind,visible:true});}});
  let quality='balanced',last=-Infinity,shadowTime=-Infinity,shadowPosition=new THREE.Vector3(Infinity,Infinity,Infinity),summary={active:0,total:entries.length,near:0,proxies:0};
  function tick(camera,time,force=false){
    if(!force&&time-last<.22)return;last=time;
    const low=quality==='low',detail=low?18:mobile?26:36,furniture=low?35:mobile?48:65,foliage=low?22:mobile?30:42;
    summary={active:0,total:entries.length,near:0,proxies:0};
    for(const entry of entries){const {o,bounds,kind}=entry,d=bounds.distanceToPoint(camera.position),margin=o.visible?3:0;
      const levelVisible=!(bounds.max.y<-.5&&camera.position.y>-.2)&&!(bounds.min.y>.5&&camera.position.y<-.5);
      o.visible=levelVisible&&(kind==='detail'?d<detail+margin:kind==='furniture'?d<furniture+margin:kind==='foliage'?d<foliage+margin:kind==='canopy'?true:true);
    }
    for(const {o,kind} of entries){if(kind==='canopy')o.visible=o.visible&&!o.userData.highDetail.some(m=>m.visible);if(o.visible){summary.active++;if(kind==='detail')summary.near++;if(kind==='canopy')summary.proxies++;}}
    let nearest=null,dist=Infinity;for(const m of mirrors){const d=m.position.distanceToSquared(camera.position);if(d<dist){dist=d;nearest=m;}}
    for(const m of mirrors){m.userData.mirrorActive=m===nearest&&dist<(low?64:144);m.userData.mirrorInterval=mobile||low?800:350;}
    model.runtime.detailRadius=detail;model.runtime.animationRadius=mobile?28:45;
    const refreshShadows=time-shadowTime>1.5&&camera.position.distanceToSquared(shadowPosition)>64;
    if(refreshShadows){shadowTime=time;shadowPosition.copy(camera.position);}return refreshShadows;
  }
  return {tick,setQuality(value){quality=value;last=-Infinity;},get summary(){return summary;}};
}
