import * as THREE from './vendor/three.module.js';

export function addPlantVariety(api){
  const {inst,tube,sphere,mats:M,unitCylinder:C,runtime}=api;
  const leaf=(color)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.88,side:THREE.DoubleSide});m.userData.foliage=true;return m;};
  const green=leaf('#3d704d'),lime=leaf('#86a653'),pale=leaf('#c8c28e'),purple=leaf('#9a85ab');
  const blade=new THREE.Shape();blade.moveTo(0,0);blade.quadraticCurveTo(.22,.35,0,1);blade.quadraticCurveTo(-.22,.35,0,0);const leafGeo=new THREE.ShapeGeometry(blade,3);
  const split=new THREE.Shape();split.moveTo(0,0);for(const [x,y] of [[-.34,.1],[-.55,.32],[-.2,.28],[-.59,.5],[-.29,.44],[-.45,.73],[-.14,.63],[0,1],[.14,.63],[.45,.73],[.29,.44],[.59,.5],[.2,.28],[.55,.32],[.34,.1]])split.lineTo(x,y);split.closePath();const splitGeo=new THREE.ShapeGeometry(split);
  const plants=[];
  function bamboo(x,y,z){for(let stem=0;stem<5;stem++){const xx=x+Math.sin(stem*2.4)*.31,zz=z+Math.cos(stem*2.4)*.28,h=1.7+stem*.15;inst(C,lime,xx,y+h/2,zz,.026,h,.026);for(let k=1;k<6;k++){const yy=y+k*h/6;inst(C,green,xx,yy,zz,.035,.045,.035);const a=k*2.4+stem;for(let j=0;j<3;j++)inst(leafGeo,j%2?green:lime,xx+Math.cos(a)*j*.07,yy,zz+Math.sin(a)*j*.07,.24,.48,.4,.4,a,.7);}}plants.push({species:'竹',x,y,z});}
  function fern(x,y,z){for(let a=0;a<8;a++){const ang=a*Math.PI/4;for(let j=1;j<6;j++){const r=j*.095,yy=y+.18+Math.sin(j/6*Math.PI)*.38;for(const side of [-1,1])inst(leafGeo,green,x+Math.cos(ang)*r,yy,z+Math.sin(ang)*r,.18*(1-j/8),.25,.2,1.0,ang+side*.75,0);}}plants.push({species:'蕨类',x,y,z});}
  function monstera(x,y,z){for(let j=0;j<7;j++){const a=j*2.4,h=.5+(j%3)*.22,xx=x+Math.sin(a)*.3,zz=z+Math.cos(a)*.3;tube(new THREE.Vector3(x,y,z),new THREE.Vector3(xx,y+h,zz),.011,green);inst(splitGeo,j%3?green:lime,xx,y+h,zz,.49,.52,.5,-.65,a,.2);}plants.push({species:'龟背竹',x,y,z});}
  function grass(x,y,z){for(let j=0;j<23;j++){const a=j*2.4,r=.18*Math.sqrt(j/23);inst(leafGeo,j%3?lime:pale,x+Math.sin(a)*r,y,z+Math.cos(a)*r,.09,.58+(j%5)*.06,.1,.23,a,(j%2?1:-1)*.24);}plants.push({species:'观赏草',x,y,z});}
  function flowers(x,y,z){for(let j=0;j<7;j++){const a=j*2.4,xx=x+Math.sin(a)*.28,zz=z+Math.cos(a)*.28;inst(leafGeo,green,xx,y+.08,zz,.38,.43,.3,-.65,a,0);for(let k=0;k<8;k++){const b=k*2.4;sphere(k%4?purple:pale,xx+Math.cos(b)*.11,y+.47+Math.sin(k)*.06,zz+Math.sin(b)*.11,.073,.056,.073);}}plants.push({species:'绣球',x,y,z});}
  const types=[bamboo,fern,monstera,grass,flowers];
  for(const x of [-28,28])for(const [j,z] of [-11.5,1,20].entries())types[(j+(x>0?2:0))%5](x,.14,z);
  for(const [j,z] of [15,23,31].entries())for(const x of [-3,3])types[(j+(x>0?1:0))%5](x,.22,z);
  for(const x of [-24.8,-7.2])for(const [j,z] of [-5,1,4.5].entries())types[(j+2)%5](x,19.28,z);
  for(const [j,x] of [-21,-16,-11].entries())types[(j+3)%5](x,19.28,-7.9);
  runtime.plantVarieties=plants;return plants;
}
