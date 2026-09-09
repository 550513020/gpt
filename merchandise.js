import * as THREE from './vendor/three.module.js';

export function createMerchandise(api){
  const {box,inst,sphere,tube,unitCylinder:C,unitTorus:T,mats:M,bear,necklace,stats}=api;
  const counts=stats.inventory||(stats.inventory={});
  const mat=(color,r=.4,m=0)=>new THREE.MeshStandardMaterial({color,roughness:r,metalness:m});
  const jade=new THREE.MeshPhysicalMaterial({color:'#237b4e',roughness:.22,clearcoat:.7,transmission:.1,thickness:.04});
  const agate=mat('#96362b',.24),ivory=mat('#fff2d7',.42),beef=mat('#aa4247',.67),salmon=mat('#f39165',.59),steel=mat('#cad2d4',.23,.85);
  const inks=[M.blue,M.coral,M.teal,M.pink,M.gold];
  const add=kind=>counts[kind]=(counts[kind]||0)+1;
  function ring(x,y,z,r,material,vertical=false){inst(T,material,x,y,z,r,r,r,vertical?0:Math.PI/2);}
  function goods(kind,x,y,z,s=1,index=0){
    add(kind);const color=inks[index%inks.length];
    if(kind==='plush'){bear(x,y,z,s,index);return;}
    if(kind==='necklace'){necklace(x,y,z,s);return;}
    if(kind==='blindbox'){
      box(color,x,y+.2*s,z,.31*s,.4*s,.29*s);box(ivory,x,y+.2*s,z-.151*s,.23*s,.25*s,.009*s);
      sphere(index%2?M.pink:M.teal,x,y+.22*s,z-.166*s,.062*s,.066*s,.009*s);
      for(const dx of [-.05,.05])sphere(M.darkMetal,x+dx*s,y+.24*s,z-.179*s,.01*s);
      box(M.gold,x,y+.065*s,z-.159*s,.12*s,.018*s,.01*s);box(ivory,x,y+.404*s,z,.29*s,.016*s,.27*s);
    }else if(kind==='figure'){
      inst(C,M.black,x,y+.035*s,z,.2*s,.07*s,.2*s);
      for(const dx of [-.085,.085]){box(M.darkMetal,x+dx*s,y+.2*s,z,.1*s,.3*s,.12*s);box(ivory,x+dx*s,y+.065*s,z-.06*s,.12*s,.07*s,.2*s);}
      box(color,x,y+.45*s,z,.31*s,.28*s,.18*s);sphere(ivory,x,y+.72*s,z,.18*s,.18*s,.16*s);
      box(M.black,x,y+.79*s,z+.025*s,.31*s,.11*s,.28*s);
      tube(new THREE.Vector3(x-.2*s,y+.53*s,z),new THREE.Vector3(x-.3*s,y+.3*s,z-.08*s),.048*s,color);
      tube(new THREE.Vector3(x+.2*s,y+.53*s,z),new THREE.Vector3(x+.34*s,y+.67*s,z-.03*s),.048*s,color);
      for(const dx of [-.065,.065])sphere(M.black,x+dx*s,y+.73*s,z-.155*s,.021*s);
    }else if(kind==='cards'){
      box(M.bronze,x,y+.03*s,z,.46*s,.06*s,.37*s);
      for(let i=0;i<3;i++){
        const xx=x+(i-1)*.12*s,zz=z-i*.023*s;
        box(ivory,xx,y+.205*s,zz,.18*s,.32*s,.009*s);box(inks[(index+i)%5],xx,y+.23*s,zz-.009*s,.15*s,.21*s,.008*s);
        sphere(M.gold,xx,y+.25*s,zz-.017*s,.047*s,.05*s,.008*s);
        for(let j=0;j<3;j++)box(M.darkMetal,xx,y+(.09+j*.018)*s,zz-.017*s,.13*s,.007*s,.006*s);
      }
    }else if(kind==='stationery'){
      for(let i=0;i<4;i++)box(inks[(i+index)%5],x,y+(.025+i*.045)*s,z,.33*s,.04*s,.46*s);
      inst(C,ivory,x+.27*s,y+.12*s,z,.09*s,.23*s,.09*s);
      for(let i=0;i<5;i++)box(inks[i],x+(.23+i*.021)*s,y+.26*s,z+(i%2)*.035*s,.014*s,.27*s,.014*s);
    }else if(kind==='gold'){
      box(M.velvet,x,y+.04*s,z,.5*s,.08*s,.38*s);
      ring(x-.1*s,y+.105*s,z,.14*s,M.gold);ring(x+.13*s,y+.105*s,z+.07*s,.08*s,M.gold);
      box(M.gold,x+.13*s,y+.16*s,z-.12*s,.09*s,.075*s,.035*s);
    }else if(kind==='jade'||kind==='agate'){
      const material=kind==='jade'?jade:agate;box(M.ivory,x,y+.035*s,z,.46*s,.06*s,.35*s);
      ring(x-.07*s,y+.105*s,z,.14*s,material);ring(x+.15*s,y+.07*s,z+.05*s,.07*s,M.gold);
      sphere(material,x+.15*s,y+.15*s,z-.055*s,.055*s,.08*s,.032*s);
      for(let j=0;j<10;j++){const a=j*Math.PI/5;sphere(material,x+Math.cos(a)*.18*s,y+.1*s,z+Math.sin(a)*.12*s,.027*s);}
    }else if(kind==='watch'){
      box(M.velvet,x,y+.06*s,z,.38*s,.11*s,.6*s);box(index%2?M.tan:steel,x,y+.13*s,z,.17*s,.032*s,.5*s);
      inst(C,index%2?M.gold:steel,x,y+.167*s,z,.143*s,.055*s,.143*s);inst(C,index%2?M.ivory:M.blue,x,y+.2*s,z,.122*s,.012*s,.122*s);
      box(M.gold,x,y+.213*s,z-.03*s,.012*s,.006*s,.08*s);box(M.gold,x+.035*s,y+.215*s,z,.08*s,.006*s,.011*s);
      for(let j=0;j<12;j++){const a=j*Math.PI/6;sphere(ivory,x+Math.sin(a)*.101*s,y+.214*s,z+Math.cos(a)*.101*s,.008*s);}
    }
  }
  function food(kind,x,y,z,s=1){
    add(kind);inst(C,M.ivory,x,y,z,.24*s,.026*s,.24*s);
    if(kind==='beef')for(let j=0;j<5;j++){
      const xx=x+(j%3-1)*.105*s,zz=z+(Math.floor(j/3)-.5)*.13*s;
      inst(C,beef,xx,y+.062*s,zz,.053*s,.1*s,.053*s,0,0,Math.PI/2);ring(xx-.055*s,y+.062*s,zz,.038*s,ivory,true);
      box(ivory,xx,y+.112*s,zz,.09*s,.009*s,.016*s);
    }else if(kind==='mushrooms')for(let j=0;j<4;j++){
      const xx=x+Math.sin(j*2.4)*.12*s,zz=z+Math.cos(j*2.4)*.12*s;
      inst(C,ivory,xx,y+.05*s,zz,.02*s,.09*s,.02*s);sphere(M.tan,xx,y+.104*s,zz,.082*s,.038*s,.082*s);
    }else if(kind==='greens')for(let j=0;j<7;j++)sphere(j%2?M.leafLight:M.leaf,x+Math.sin(j*2.4)*.13*s,y+(.04+j*.008)*s,z+Math.cos(j*2.4)*.1*s,.12*s,.025*s,.055*s);
    else if(kind==='shrimp')for(let j=0;j<4;j++){
      const xx=x+(j%2-.5)*.21*s,zz=z+(Math.floor(j/2)-.5)*.19*s;
      for(let k=0;k<6;k++){const a=k*.4;sphere(salmon,xx+Math.cos(a)*.058*s,y+.06*s,zz+Math.sin(a)*.068*s,(.024-k*.002)*s,.024*s,.029*s);}
    }else if(kind==='tofu')for(let j=0;j<6;j++)box(ivory,x+(j%3-1)*.105*s,y+.055*s,z+(Math.floor(j/3)-.5)*.14*s,.087*s,.075*s,.113*s);
    else if(kind==='meatballs')for(let j=0;j<6;j++)sphere(j%2?ivory:M.tan,x+Math.sin(j*2.4)*.14*s,y+.058*s,z+Math.cos(j*2.4)*.14*s,.055*s);
    else if(kind==='lotus')for(let j=0;j<3;j++){
      const xx=x+(j-1)*.105*s;inst(C,ivory,xx,y+.038*s,z,.11*s,.022*s,.11*s);
      for(let k=0;k<6;k++){const a=k*Math.PI/3;inst(C,M.tan,xx+Math.sin(a)*.061*s,y+.051*s,z+Math.cos(a)*.061*s,.016*s,.003*s,.016*s);}
    }
  }
  return {goods,food};
}
