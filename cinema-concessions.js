import {concessionTextures} from './food-materials.js?v=15';
import * as THREE from './vendor/three.module.js';

export function buildCinemaConcessions(api,room){
  const {box,slab,inst,sphere,tube,label,glassGroup,mats:M,unitCylinder:C}=api,{cx,cz,base:y}=room;
  const mat=(c,r=.7,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const textures=concessionTextures();
  const red=mat('#a7332c'),paper=mat('#f1e6cd',.95),steel=mat('#b7c1bb',.29,.68),kernel=mat('#ffe5a0',.95),toast=mat('#d49e52',.94),cola=mat('#2c170c',.26);
  paper.bumpMap=textures.grain;paper.bumpScale=.0016;paper.roughnessMap=textures.grain;red.bumpMap=textures.grain;red.bumpScale=.0007;kernel.bumpMap=textures.grain;kernel.bumpScale=.0035;kernel.roughness=.82;toast.bumpMap=textures.grain;toast.bumpScale=.002;
  const crease=mat('#96652e',.94),butter=mat('#f3d18b',.75);
  const glass=new THREE.MeshPhysicalMaterial({color:'#e6f7f4',transparent:true,opacity:.1,roughness:.055,depthWrite:false,forceSinglePass:true,side:THREE.DoubleSide,envMapIntensity:.5});
  const x=cx+4.7,z=cz-7.22,width=6.15,depth=1.05;
  slab(red,x,y+.13,z,width,depth,.14,.88);box(M.marble,x,y+1.045,z,width+.09,.09,depth+.08);
  const bucketGeo=new THREE.CylinderGeometry(.155,.108,.29,16,1,true),stripeGeo=new THREE.CylinderGeometry(.157,.11,.29,16,1,true,0,Math.PI/8),lipGeo=new THREE.TorusGeometry(.154,.008,4,16),puffGeo=textures.kernel;
  const buckets=[];
  function bucket(xx,yy,zz,index){
    inst(bucketGeo,paper,xx,yy+.145,zz);inst(C,paper,xx,yy+.012,zz,.11,.012,.11);
    for(let j=0;j<8;j++)inst(stripeGeo,red,xx,yy+.145,zz,1,1,1,0,j*Math.PI/4,0);
    inst(lipGeo,paper,xx,yy+.29,zz,1,1,1,Math.PI/2);
    // A filled crown made of small irregular kernels, always in paper containers.
    for(let k=0;k<24;k++){const a=k*2.39996,rr=.132*Math.sqrt((k+.5)/24),height=.29+.052*(1-rr/.15)+(k%3)*.008;inst(puffGeo,k%6?kernel:butter,xx+Math.cos(a)*rr,yy+height,zz+Math.sin(a)*rr,.034,.03+(k%3)*.004,.032,.15*(k%3),a,0);}
    for(let k=0;k<7;k++){const a=k*2.39996,rr=.116*Math.sqrt((k+.5)/7);sphere(crease,xx+Math.cos(a)*rr,yy+.342+(k%2)*.01,zz+Math.sin(a)*rr,.009,.006,.007);}
    buckets.push({x:xx,y:yy,z:zz,paper:true,kernels:24});
  }
  // Three transparent sliding doors reveal rows of filled takeaway paper tubs.
  const gx=x-.82,gz=z+.03,gw=3.58,gh=1.15,gd=.9,bottom=y+1.1;
  box(steel,gx,bottom+.025,gz,gw,.05,gd);box(red,gx,bottom+gh+.055,gz,gw+.08,.14,gd+.05);
  for(const side of [-1,1]){box(steel,gx+side*gw/2,bottom+gh/2,gz,.05,gh,gd);const p=new THREE.Mesh(new THREE.PlaneGeometry(gd,gh),glass);p.position.set(gx+side*(gw/2-.012),bottom+gh/2,gz);p.rotation.y=Math.PI/2;glassGroup.add(p);}
  for(const zz of [gz-gd/2,gz+gd/2])for(let bay=0;bay<3;bay++){const xx=gx-gw/2+(bay+.5)*gw/3,p=new THREE.Mesh(new THREE.PlaneGeometry(gw/3-.025,gh),glass);p.position.set(xx,bottom+gh/2,zz);glassGroup.add(p);if(zz>gz){box(steel,xx-gw/6+.023,bottom+gh/2,zz+.017,.03,gh,.024);box(M.bronze,xx+.39,bottom+gh/2,zz+.04,.025,.2,.025);}}
  for(let row=0;row<2;row++){const yy=bottom+.07+row*.5;box(steel,gx,yy-.035,gz,gw-.08,.035,gd-.07);for(let col=0;col<9;col++)for(const dz of [-.21,.2])bucket(gx-1.55+col*.387,yy,gz+dz,col+row*18);}
  label('现制爆米花 · 纸桶装',gx,bottom+gh+.05,gz+gd/2+.035,3.3,0,'#98352c','#fff0cc');
  // Cola dispenser, drip tray and lidded paper cups on the adjoining worktop.
  const dx=x+1.77,dz=z+.08;box(M.darkMetal,dx,y+1.76,dz,.91,1.2,.66);box(red,dx,y+2.18,dz+.338,.88,.32,.025);
  label('COLA / 可乐',dx,y+2.18,dz+.355,.82,0,'#98352c','#fff0cc');box(steel,dx,y+1.13,dz+.21,1.0,.05,.68);
  for(const side of [-1,1]){box(M.black,dx+side*.22,y+1.72,dz+.4,.12,.15,.14);box(M.ivory,dx+side*.22,y+1.91,dz+.348,.2,.14,.016);}
  const cupGeo=new THREE.CylinderGeometry(.104,.073,.29,12,1,true);
  for(let k=0;k<5;k++){const xx=dx-.45+(k%3)*.31,zz=z+.18-Math.floor(k/3)*.31;inst(cupGeo,red,xx,y+1.265,zz);inst(C,cola,xx,y+1.396,zz,.095,.012,.095);inst(C,paper,xx,y+1.421,zz,.109,.029,.109);tube(new THREE.Vector3(xx,y+1.43,zz),new THREE.Vector3(xx+.025,y+1.7,zz),.009,paper);}
  // A single compact POS joins the snack counter at its left end.
  box(M.black,x-2.81,y+1.43,z+.1,.39,.35,.06);box(M.teal,x-2.81,y+1.43,z+.139,.32,.28,.009);
  label('可乐 · 爆米花柜台',x,y+.65,z+depth/2+.023,5.65,0,'#98352c','#fff0cc');
  room.checkout={x,z,width,depth,queue:{x:x+.15,z:z+1.72}};
  room.concessions={x,z,width,depth,buckets,glassDoors:3,paperContainers:true,materialDetail:true,lobedKernels:true,colaCups:5,dispenser:true,queue:room.checkout.queue};
  (room.props??=[]).push('paperBucketPopcornCounter','colaDispenser');
}
