import * as THREE from './vendor/three.module.js';

export function addShoppers(model,navigator){
  const group=new THREE.Group();group.name='Mall visitors';model.root.add(group);const agents=[];
  const sphere=new THREE.SphereGeometry(1,10,8),box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8);
  const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.86});const skin=[mat('#bd886a'),mat('#e0b395'),mat('#a67453')],hair=mat('#332a24'),shoes=mat('#e5e5d8'),trousers=mat('#435659');
  const shirt=['#ad7259','#738978','#c5b584','#65869b','#a298b2','#b78787'].map(mat);
  const paths=[];
  for(const [f,start,end] of [[0,{x:-1,z:12},{x:1,z:34}],[0,{x:-10,z:-11.5},{x:11,z:-11.5}],[1,{x:10.7,z:43.8},{x:10.7,z:53}],[2,{x:10.7,z:44},{x:10.7,z:52}]]){const path=navigator.plan(start,end,f);paths.push([...path,...path.slice().reverse().slice(1)]);}
  for(const type of ['toys','clothes','hotpot','ktv']){const room=model.runtime.rooms.find(r=>r.spec.type===type);paths.push(room.route.points.map(p=>new THREE.Vector3(p.x,room.base+1.7,p.z)));}
  paths.forEach((path,index)=>{
    const person=new THREE.Group(),limbs=[];group.add(person);
    const mesh=(geo,material,x,y,z,sx,sy,sz,parent=person)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;};
    mesh(sphere,skin[index%3],0,1.52,0,.135,.17,.135);mesh(sphere,hair,0,1.62,.02,.14,.1,.14);mesh(cylinder,skin[index%3],0,1.31,0,.065,.14,.065);mesh(sphere,shirt[index%6],0,1.04,0,.235,.32,.135);
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.11,.8,0);person.add(leg);mesh(cylinder,trousers,0,-.29,0,.085,.55,.085,leg);mesh(sphere,skin[index%3],0,-.57,0,.065,.11,.07,leg);mesh(box,shoes,0,-.68,-.05,.145,.12,.27,leg);limbs.push({part:leg,sign:side});
      const arm=new THREE.Group();arm.position.set(side*.22,1.21,0);person.add(arm);mesh(cylinder,shirt[index%6],side*.016,-.1,0,.075,.21,.075,arm);mesh(cylinder,skin[index%3],side*.03,-.3,0,.048,.3,.048,arm);mesh(sphere,skin[index%3],side*.03,-.46,0,.047,.075,.047,arm);limbs.push({part:arm,sign:-side});
    }
    if(index%2){mesh(box,mat('#b58b56'),.29,.6,0,.24,.28,.12);const handle=new THREE.Mesh(new THREE.TorusGeometry(.072,.01,5,12),trousers);handle.position.set(.29,.8,0);person.add(handle);}
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(.3,18),new THREE.MeshBasicMaterial({color:'#253b33',transparent:true,opacity:.14,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;person.add(shadow);
    const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths.at(-1)+path[i].distanceTo(path[i-1]));agents.push({person,path,lengths,total:lengths.at(-1),limbs,offset:index*13.3});
  });
  function tick(dt,time,camera){for(const a of agents){const distance=(time*.76+a.offset)%a.total;let i=1;while(i<a.lengths.length-1&&a.lengths[i]<distance)i++;const start=a.path[i-1],end=a.path[i],t=(distance-a.lengths[i-1])/(a.lengths[i]-a.lengths[i-1]||1);a.person.position.lerpVectors(start,end,t);a.person.position.y-=1.7;const dx=end.x-start.x,dz=end.z-start.z;a.person.rotation.y=Math.atan2(-dx,-dz);a.limbs.forEach(({part,sign})=>part.rotation.x=Math.sin(time*5+a.offset)*.34*sign);const distanceToCamera=a.person.position.distanceTo(camera.position);a.person.visible=distanceToCamera>.9&&distanceToCamera<(model.runtime.animationRadius||45);}}
  return {group,agents,tick};
}
