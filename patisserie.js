import * as THREE from './vendor/three.module.js';

// Small repeated pieces share geometry and are instanced by the scene builder.
export function createPatisserie(api,room){
  const {inst,sphere,box,mats:M,unitCylinder:C,unitTorus:T}=api;
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78});
  const crust=mat('#bb743c'),custard=mat('#f4ca60'),chocolate=mat('#4d2922'),cream=mat('#fff0ce');
  const flavors=['#d898ae','#9aaf70','#c1a0c8','#e1b970'].map(mat);
  const fluted=new THREE.CylinderGeometry(.17,.12,.09,12);
  const inventory=room.bakery.pastries||(room.bakery.pastries={});
  function pastry(kind,x,y,z,flavor=0){
    inventory[kind]=(inventory[kind]||0)+1;
    inst(C,M.ivory,x,y+.006,z,.23,.012,.22);
    const color=flavors[flavor%4];
    if(kind==='macaron'){
      inst(C,color,x,y+.045,z,.15,.055,.15);inst(C,cream,x,y+.081,z,.142,.028,.142);inst(C,color,x,y+.119,z,.15,.05,.15);
    }else if(kind==='eggTart'||kind==='fruitTart'){
      inst(fluted,crust,x,y+.057,z);inst(T,crust,x,y+.107,z,.16,.16,.16,Math.PI/2);inst(C,custard,x,y+.095,z,.139,.018,.139);
      if(kind==='eggTart')for(let k=0;k<5;k++)sphere(chocolate,x+Math.cos(k*2.4)*.078,y+.108,z+Math.sin(k*2.4)*.072,.025,.003,.014);
      else for(let k=0;k<5;k++)sphere(k%2?M.coral:color,x+Math.cos(k*1.26)*.08,y+.139,z+Math.sin(k*1.26)*.08,.039,.043,.035);
    }else if(kind==='eclair'){
      sphere(crust,x,y+.074,z,.23,.068,.092);sphere(chocolate,x,y+.131,z,.21,.019,.08);for(let k=-2;k<=2;k++)box(cream,x+k*.069,y+.148,z,.016,.012,.126,.22);
    }else if(kind==='strawberryCake'){
      box(crust,x,y+.04,z,.3,.06,.26);box(cream,x,y+.11,z,.3,.08,.26);box(color,x,y+.163,z,.3,.028,.26);
      for(const dx of [-.075,.075])sphere(M.coral,x+dx,y+.23,z,.058,.072,.056);
    }else if(kind==='cookie'){
      inst(C,crust,x,y+.04,z,.17,.046,.17);for(let k=0;k<6;k++)sphere(chocolate,x+Math.cos(k*2.4)*.105,y+.067,z+Math.sin(k*2.4)*.097,.028,.012,.022);
    }else{
      inst(fluted,chocolate,x,y+.12,z,.8,2.3,.8);inst(C,crust,x,y+.226,z,.12,.015,.12);
    }
  }
  return {pastry};
}
