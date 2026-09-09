import * as THREE from './vendor/three.module.js';

export function addClothBanners(root){
  if(typeof document==='undefined')return [];
  const plans=[{x:-6.6,title:'潮汐之后',subtitle:'AFTER THE TIDE',footer:'光幕影院 · 即将上映',bg:'#263f50',ink:'#eac08a',kind:0},{x:-1.5,title:'璟 · 玉',subtitle:'THE JADE COLLECTION',footer:'璟序珠宝 · 东方玉色',bg:'#274d3d',ink:'#ddc797',kind:1},{x:3.6,title:'好奇心事务所',subtitle:'COLLECT THE EVERYDAY',footer:'MOMO 杂物社 · 新品季',bg:'#bd6557',ink:'#f1d8ae',kind:2}];
  return plans.map(plan=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1536;const c=canvas.getContext('2d');
    c.fillStyle=plan.bg;c.fillRect(0,0,512,1536);c.fillStyle=plan.ink;
    if(plan.kind===0){c.beginPath();c.arc(320,480,138,0,Math.PI*2);c.fill();for(let i=0;i<8;i++){c.strokeStyle=i%2?'#668e9a':'#a4b4ac';c.lineWidth=8;c.beginPath();for(let x=0;x<520;x+=4){const y=690+i*43+Math.sin(x*.012+i*.4)*35;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
    if(plan.kind===1){c.strokeStyle='#83ae81';c.lineWidth=72;c.beginPath();c.ellipse(256,670,128,168,-.3,0,Math.PI*2);c.stroke();c.strokeStyle=plan.ink;c.lineWidth=3;c.beginPath();c.ellipse(256,670,176,224,.3,0,Math.PI*2);c.stroke();}
    if(plan.kind===2){for(let j=0;j<5;j++){const x=115+(j%2)*170,y=450+Math.floor(j/2)*155;c.fillStyle=['#f1d8ae','#8ea6a0','#d3ab71'][j%3];c.fillRect(x-64,y-64,128,128);c.fillStyle=plan.bg;c.beginPath();c.arc(x-22,y-8,10,0,7);c.arc(x+22,y-8,10,0,7);c.fill();}}
    c.textAlign='center';c.fillStyle=plan.ink;c.font='bold 47px "Microsoft YaHei",sans-serif';c.fillText(plan.title,256,230,465);c.font='18px Georgia,serif';c.fillText(plan.subtitle,256,285,460);c.font='22px "Microsoft YaHei",sans-serif';c.fillText(plan.footer,256,1320,468);c.font='16px Georgia';c.fillText('RIVERSIDE / 2026',256,1400);
    for(let y=0;y<1536;y+=3){c.fillStyle=y%2?'#ffffff07':'#00000009';c.fillRect(0,y,512,1);}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
    const geometry=new THREE.PlaneGeometry(3.2,9.6,24,48),p=geometry.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*8)*.043+Math.sin(p.getY(i)*1.4)*.025);geometry.computeVertexNormals();
    const cloth=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({map:texture,roughness:.94,sheen:.5,sheenColor:'#e8dac5',side:THREE.DoubleSide}));cloth.position.set(plan.x,12.4,62.75);cloth.rotation.y=Math.PI;cloth.castShadow=true;cloth.receiveShadow=true;root.add(cloth);return cloth;
  });
}
