import * as THREE from './vendor/three.module.js';

// Local 1K maps keep the public scene independent of a third-party asset server.
export async function loadSurfaceMaps(renderer){
  const loader=new THREE.TextureLoader();
  const maps={oak:{},concrete:{},marble:{},leather:{}};
  const anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const jobs=[];
  for(const [name,set] of Object.entries(maps))for(const channel of ['diff','normal','roughness']){
    jobs.push(loader.loadAsync(new URL(`./assets/materials/${name}-${channel}.jpg`,import.meta.url).href).then(texture=>{
      texture.colorSpace=channel==='diff'?THREE.SRGBColorSpace:THREE.NoColorSpace;
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      const repeat=name==='marble'?.34:name==='concrete'?.75:name==='leather'?3:1;
      texture.repeat.set(repeat,repeat);texture.anisotropy=anisotropy;
      set[channel]=texture;
    }));
  }
  const results=await Promise.allSettled(jobs);
  return {maps,loaded:results.filter(r=>r.status==='fulfilled').length,total:jobs.length};
}
