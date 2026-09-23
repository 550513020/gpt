import * as THREE from './vendor/three.module.js';

export function buildWaterGardens(api){
  const {root,box,slab,inst,mats:M,unitCylinder:C,label,runtime}=api;
  const state={mode:'summer',pools:[],particleCount:0};
  const stone=new THREE.MeshStandardMaterial({color:'#d8d3bd',roughness:.82,normalMap:M.stone.normalMap});
  const water=new THREE.MeshPhysicalMaterial({color:'#488e88',roughness:.18,metalness:.34,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.8});
  const clock={value:0};
  water.onBeforeCompile=shader=>{shader.uniforms.gardenTime=clock;shader.vertexShader='varying vec2 gardenUV;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngardenUV=position.xz;');shader.fragmentShader='uniform float gardenTime;varying vec2 gardenUV;\n'+shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(sin(gardenUV.x*16.+gardenTime*.65)*.025,cos(gardenUV.y*13.-gardenTime*.5)*.025,0.));');};
  const glow=new THREE.MeshBasicMaterial({color:'#b6e4da'});
  function blocked(x,z,w,d,base){runtime.exteriorBlocks.push({x,z,w,d,base});}
  function pool(x,z,w,d,base=0,large=false){
    slab(stone,x,base+.02,z,w,d,.28,.12);blocked(x,z,w,d,base);
    // A dark recessed bed, thick stone coping and a low water plane give real depth.
    box(M.darkMarble,x,base+.27,z,w-.24,.025,d-.24);
    const surface=new THREE.Mesh(new THREE.PlaneGeometry(w-.25,d-.25),water);surface.geometry.rotateX(-Math.PI/2);surface.position.set(x,base+.345,z);root.add(surface);
    for(const dx of [-1,1])box(stone,x+dx*(w/2-.12),base+.39,z,.24,.17,d-.34);
    for(const dz of [-1,1])box(stone,x,base+.39,z+dz*(d/2-.12),w,.17,.24);
    box(glow,x,base+.409,z+d/2-.28,w-.7,.012,.018,0,false);
    const jets=new THREE.Group();root.add(jets);
    const count=large?48:0,positions=new Float32Array(count*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const points=new THREE.Points(g,new THREE.PointsMaterial({color:'#e4fffa',size:.027,transparent:true,opacity:.55,depthWrite:false}));jets.add(points);
    if(large){
      for(const dz of [-2,0,2]){inst(C,M.bronze,x,base+.415,z+dz,.08,.035,.08);}
      for(const dx of [-w/2-.75,w/2+.75]){
        slab(M.walnut,x+dx,base+.41,z, .72,3.1,.13,.14);box(stone,x+dx,base+.22,z,.48,.36,2.6);blocked(x+dx,z,.75,3.1,base);
      }
      for(let i=0;i<5;i++){const px=x+(i%2?-.95:1.1),pz=z+(i-2)*1.15;inst(C,M.rock,px,base+.31,pz,.23,.065,.3);}
      for(const dz of [-2.6,2.3]){inst(C,M.leafDark,x+1.35,base+.352,z+dz,.23,.008,.19);inst(C,M.cream,x+1.35,base+.37,z+dz,.055,.035,.055);}
      label('水岸小憩 · 靠近唤醒涌泉',x,base+.35,z-d/2-.13,2.1,Math.PI,'#5c6a60','#efe8d3');
    }else{
      box(M.darkMarble,x,base+.76,z+.35,w-.3,.75,.08);
      box(water,x,base+.77,z+.295,w-.43,.66,.025,0,false);
      box(M.bronze,x,base+1.15,z+.3,w-.25,.035,.15);
    }
    const entry={x,z,w,d,base,jets,summerJets:count};state.pools.push(entry);state.particleCount+=count;
    const update=(dt,time,camera)=>{
      const p=camera?.position,near=p&&Math.hypot(p.x-x,p.z-z)<13&&Math.abs(p.y-base)<5;
      jets.visible=state.mode==='summer'&&Boolean(near)&&large;
      if(!jets.visible)return;
      for(let i=0;i<count;i++){const t=(time*.6+i/count)%1,a=i*2.399,r=Math.sin(t*Math.PI)*.12;positions[i*3]=x+Math.cos(a)*r;positions[i*3+1]=base+.43+4*t*(1-t)*.65;positions[i*3+2]=z+((i%3)-1)*2+Math.sin(a)*r;}g.attributes.position.needsUpdate=true;
    };update.position=new THREE.Vector3(x,base,z);runtime.updates.push(update);
  }
  pool(-32,-22,5.2,7.5,0,true);pool(32,-22,5.2,7.5,0,true);
  for(const base of [4.65,9.3,13.95])pool(-6.3,-6.4,.85,1.25,base);
  state.setMode=mode=>{state.mode=['summer','winter','still'].includes(mode)?mode:'summer';water.color.set(state.mode==='winter'?'#658b82':'#488e88');glow.color.set(state.mode==='winter'?'#ffcd82':'#b6e4da');for(const p of state.pools)p.jets.visible=false;};
  runtime.updates.push((dt,time)=>{if(state.mode!=='still')clock.value=time;});
  runtime.waterGardens=state;return state;
}
