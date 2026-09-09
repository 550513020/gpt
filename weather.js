import * as THREE from './vendor/three.module.js';

export function sunDirection(mode='day'){
  return new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(mode==='dusk'?77:48),THREE.MathUtils.degToRad(225));
}
function roundedRoof(x,z,cx,cz,w,d,r){
  const qx=Math.abs(x-cx)-(w/2-r),qz=Math.abs(z-cz)-(d/2-r);
  return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)<=r;
}
export function rainSurface(x,z){
  for(const cx of [-16,16])if(roundedRoof(x,z,cx,0,25,21,3.7))return 18.8;
  for(const cx of [-13.8,13.8])if(roundedRoof(x,z,cx,24,22.5,20.5,3.7))return 14.05;
  if(Math.abs(x)<12.35&&z>40.7&&z<63.3)return 19.05;
  if(Math.abs(x)<4.65&&z>5.9&&z<8.1)return 18.75;
  return -.035;
}
export function enhanceSky(sky){
  sky.material.uniforms.cloudTime={value:0};sky.material.uniforms.stormAmount={value:0};
  sky.material.fragmentShader=sky.material.fragmentShader.replace('void main() {',`
uniform float cloudTime;
uniform float stormAmount;
float hashCloud(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noiseCloud(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hashCloud(i),hashCloud(i+vec2(1.,0.)),f.x),mix(hashCloud(i+vec2(0.,1.)),hashCloud(i+vec2(1.,1.)),f.x),f.y);}
float fbmCloud(vec2 p){float v=0.,a=.53;for(int i=0;i<5;i++){v+=a*noiseCloud(p);p=mat2(1.6,-1.2,1.2,1.6)*p+3.4;a*=.48;}return v;}
void main() {`).replace('gl_FragColor = vec4( retColor, 1.0 );',`
vec2 cp=direction.xz/max(direction.y+.12,.08)*1.3+vec2(3.6,7.1)+cloudTime*vec2(.002,.0007);
float density=fbmCloud(cp);
float cloud=smoothstep(mix(.56,.35,stormAmount),mix(.72,.6,stormAmount),density);
float lit=clamp((density-fbmCloud(cp+normalize(vSunDirection.xz)*.17))*4.0+.65,.2,1.0);
vec3 cloudColor=mix(vec3(.65,.79,.96),vec3(2.5,2.43,2.29),lit);
cloudColor=mix(cloudColor,vec3(.69,.78,.86)*(lit*.45+.5),stormAmount);
float horizon=smoothstep(.015,.13,direction.y);
retColor=mix(retColor,cloudColor,cloud*horizon*.94);
retColor=mix(retColor,vec3(.7,.79,.87),stormAmount*.45);
gl_FragColor=vec4(retColor,1.0);`);
}

export function createWeather(scene,model,sky,{mobile=false}={}){
  const group=new THREE.Group();group.name='Weather';scene.add(group);group.userData.excludeAO=true;
  const count=mobile?1500:3800,positions=new Float32Array(count*6),drops=[];
  let seed=74103;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++)drops.push({x:-44+rand()*88,z:-33+rand()*104,y:rand()*39,speed:16+rand()*9,length:.3+rand()*.5});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  const rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#d3e4ed',transparent:true,opacity:.46,depthWrite:false}));rain.frustumCulled=false;group.add(rain);
  const rippleGeometry=new THREE.RingGeometry(.045,.064,16),rippleMat=new THREE.MeshBasicMaterial({color:'#c8e0e5',transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
  const ripples=new THREE.InstancedMesh(rippleGeometry,rippleMat,180),ripplePoints=[];ripples.frustumCulled=false;group.add(ripples);
  const transform=new THREE.Object3D();
  for(let i=0;i<180;i++){let x,z;do{x=-31+rand()*62;z=-24+rand()*86;}while(rainSurface(x,z)>0);ripplePoints.push({x,z,phase:rand(),scale:.7+rand()*1.5});}
  // Puddles lie only on outdoor paving, outside roof footprints.
  const puddleMat=new THREE.MeshPhysicalMaterial({color:'#899c9c',roughness:.1,metalness:.18,transparent:true,opacity:.22,clearcoat:1,depthWrite:false});
  for(const [x,z,sx,sz] of [[-4,-14,2,1],[5,-11,1.8,.7],[-1,18,1.3,.4],[1.5,29,1,.55],[26,42,1.9,.6]]){
    const p=new THREE.Mesh(new THREE.CircleGeometry(1,32),puddleMat);p.rotation.x=-Math.PI/2;p.position.set(x,-.048,z);p.scale.set(sx,sz,1);group.add(p);
  }
  const shafts=new THREE.Group();shafts.name='Skylight sun shafts';shafts.userData.excludeAO=true;scene.add(shafts);
  const shaftMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{strength:{value:.037}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float strength;void main(){float edge=pow(sin(vUv.x*3.14159265),2.);float fade=smoothstep(0.,.16,vUv.y)*(1.-smoothstep(.65,1.,vUv.y));gl_FragColor=vec4(.97,.86,.66,edge*fade*strength);}`});
  const lightPaths=[];
  function alignShafts(direction){
    for(const child of [...shafts.children]){child.geometry.dispose();shafts.remove(child);}lightPaths.length=0;
    const raycaster=new THREE.Raycaster(),down=direction.clone().negate();
    for(const start of [new THREE.Vector3(-8.2,18.5,44.5),new THREE.Vector3(-3.4,18.5,46.1),new THREE.Vector3(1.0,18.5,49.2)]){
      raycaster.set(start,down);raycaster.near=.08;raycaster.far=34;
      const first=raycaster.intersectObject(model.root,true).find(hit=>hit.object.castShadow);
      const length=Math.min(first?.distance??(start.y/direction.y),34)-.035;if(length<.8)continue;
      const center=start.clone().addScaledVector(down,length/2),orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
      for(const turn of [0,Math.PI/2]){const g=new THREE.PlaneGeometry(1.25,length,1,1);g.rotateY(turn);const beam=new THREE.Mesh(g,shaftMaterial);beam.position.copy(center);beam.quaternion.copy(orientation);shafts.add(beam);}
      lightPaths.push({start:start.toArray(),end:start.clone().addScaledVector(down,length).toArray()});
    }
  }
  const bounce=new THREE.PointLight('#dce9ed',42,23,2);bounce.position.set(0,15.8,50);scene.add(bounce);
  const wet=[model.mats.stone,model.mats.slabTop,model.mats.concrete].map(m=>({material:m,roughness:m.roughness}));
  let raining=false;
  return {lightPaths,group,shafts,bounce,
    set(mode,direction){raining=mode==='rain';group.visible=raining;shafts.visible=mode==='day';sky.material.uniforms.stormAmount.value=raining?1:0;bounce.intensity=raining?22:mode==='dusk'?16:42;wet.forEach(({material,roughness})=>material.roughness=raining?roughness*.5:roughness);if(mode==='day')alignShafts(direction);},
    tick(dt,time){sky.material.uniforms.cloudTime.value=time;if(!raining)return;
      for(let i=0;i<count;i++){const d=drops[i];d.y-=d.speed*dt;d.x+=dt*1.6;d.z+=dt*.65;if(d.x>44)d.x=-44;if(d.z>71)d.z=-33;const floor=rainSurface(d.x,d.z);if(d.y<floor+.01)d.y=37+rand()*2;const k=i*6;positions[k]=d.x;positions[k+1]=d.y;positions[k+2]=d.z;positions[k+3]=d.x-.065;positions[k+4]=Math.min(40,d.y+d.length);positions[k+5]=d.z-.026;}
      geometry.attributes.position.needsUpdate=true;
      ripplePoints.forEach((p,i)=>{const phase=(time*1.4+p.phase)%1;transform.position.set(p.x,-.043,p.z);transform.rotation.set(-Math.PI/2,0,0);const scale=(.2+phase*4)*p.scale;transform.scale.set(scale,scale,scale);if(phase>.82)transform.scale.multiplyScalar((1-phase)/.18);transform.updateMatrix();ripples.setMatrixAt(i,transform.matrix);});ripples.instanceMatrix.needsUpdate=true;
    }
  };
}
