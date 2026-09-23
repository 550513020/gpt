import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// Small deterministic textures shared by every paper tub and popcorn kernel.
// They are generated once, with no image downloads or per-frame effect pass.
export function concessionTextures(){
  const n=128,data=new Uint8Array(n*n*4);let seed=613;
  for(let i=0;i<n*n;i++){seed=(seed*1664525+1013904223)>>>0;const v=170+(seed%70);data.set([v,v,v,255],i*4);}
  const grain=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.magFilter=THREE.LinearFilter;grain.minFilter=THREE.LinearMipmapLinearFilter;grain.generateMipmaps=true;grain.needsUpdate=true;
  const parts=[];for(const [x,y,z,sx,sy,sz]of [[0,0,0,.58,.54,.5],[-.48,.22,0,.5,.7,.46],[.43,.16,.05,.58,.54,.52],[.02,.24,.47,.57,.63,.47],[.02,.42,-.36,.48,.61,.47]]){
    const g=new THREE.IcosahedronGeometry(1,0),p=g.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i),zz=p.getZ(i),v=1+.11*Math.sin(xx*14+yy*17+zz*12);p.setXYZ(i,xx*sx*v+x,yy*sy*v+y,zz*sz*v+z);}g.computeVertexNormals();parts.push(g);
  }
  const kernel=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());return {grain,kernel};
}
