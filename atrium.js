import * as THREE from './vendor/three.module.js';
import { buildCirculation } from './circulation.js?v=13';
import { addClothBanners } from './banners.js?v=13';
import { perforatedSlab } from './parking.js?v=13';

// This hall extends the open street at its rear. Every landing joins a gallery.
export function buildAtrium(api){
  const {box,slab,inst,sphere,tube,glassGroup,mats:M,balustrade,glazing,unitCylinder,label,tree,rock,root}=api;
  const front=40.8,back=63.1,left=-12.3,right=12.3,top=23.05;

  const mat=(color,roughness=.6,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const travertine=mat('#d0c7b4',.77),fascia=mat('#d4cfc0',.62),steel=mat('#676d69',.35,.72),treads=mat('#747d79',.61,.55),rubber=mat('#202c28',.8);
  travertine.map=M.marble.map;travertine.normalMap=M.marble.normalMap;travertine.normalScale=new THREE.Vector2(.13,.13);travertine.roughnessMap=M.marble.roughnessMap;
  fascia.normalMap=M.concrete.normalMap;fascia.normalScale=new THREE.Vector2(.06,.06);
  perforatedSlab(box,M.wood,.07,.12,-12.25,12.25,40.5,63.5);
  // Continuous service core with a real WC doorway on every floor.
  for(let f=0;f<5;f++){
    const y=f===4?18.68:f*4.65;
    box(M.walnut,-8.4,y+2.3,63.3,7.5,4.6,.3);box(M.walnut,4.9,y+2.3,63.3,14.5,4.6,.3);
    box(M.walnut,-3.5,y+3.78,63.3,2.4,1.64,.3);
    for(let i=0;i<98;i++){const x=-12+i*.246;if(x>-4.7&&x<-2.3)continue;box(M.wood,x,y+2.3,63.08,.092,4.6,.12);}
  }
  // Perimeter galleries preserve a large unobstructed void through all floors.
  for(let f=1;f<=4;f++){
    const y=f===4?18.68:f*4.65;
    for(const x of [-10.7,10.7]){
      box(travertine,x,y-.23,52,3.1,.48,22.3);box(M.wood,x,y-.485,52,2.94,.03,22.1);
      box(M.warmGlow,x+(x<0?1.53:-1.53),y-.17,52,.022,.055,21.9,0,false);
      const segments=[[44.3,54.9],[58.4,60.75]];
      for(const [a,b] of segments){
        const panel=new THREE.Mesh(new THREE.PlaneGeometry(b-a,1.06),balustrade);panel.rotation.y=Math.PI/2;panel.position.set(x<0?-9.13:9.13,y+.55,(a+b)/2);glassGroup.add(panel);
        box(M.bronze,x<0?-9.13:9.13,y+1.08,(a+b)/2,.034,.036,b-a);
        for(let z=a;z<=b;z+=2.4)box(M.bronze,x<0?-9.13:9.13,y+.53,z,.028,1.05,.028);
      }
    }
    for(const z of [41.75,61.85]){
      box(travertine,0,y-.23,z,24.3,.48,2.2);box(M.wood,0,y-.485,z,24.15,.025,2.12);
      const railZ=z<50?z+1.1:z-1.1;const span=z<50?4.6:18.15,center=0;const panel=new THREE.Mesh(new THREE.PlaneGeometry(span,1.06),balustrade);panel.position.set(center,y+.55,railZ);glassGroup.add(panel);box(M.bronze,center,y+1.08,railZ,span,.033,.033);
      for(let x=z<50?-2.2:-8.8;x<=(z<50?2.2:8.8);x+=2.2)box(M.bronze,x,y+.53,railZ,.026,1.05,.026);
    }
  }
  // Slim column pairs and bronze beams repeat the reference's fine structure.
  for(const x of [left,right])for(const z of [41.5,48.5,55.5,62.5]){
    box(M.bronze,x,11.55,z,.22,23.1,.24);box(M.walnut,x+(x<0?.17:-.17),11.55,z,.1,23.05,.32);
  }
  for(const x of [-11.1,-7.4,-3.7,0,3.7,7.4,11.1])for(const [a,b] of x===7.4?[[40.45,57.6],[60.5,63.55]]:[[40.45,63.55]])box(M.wood,x,top,(a+b)/2,.22,.48,b-a);
  for(let z=41.1;z<=63.1;z+=2.75)for(const [a,b] of z>57.6&&z<60.5?[[-12.3,5.65],[8.55,12.3]]:[[-12.3,12.3]])box(M.bronze,(a+b)/2,top+.13,z,b-a,.18,.14);
  for(const x of [-11.8,11.8])box(M.wood,x,top-.35,52,.45,.72,23.1);
  const skyShape=new THREE.Shape();skyShape.moveTo(-12.1,-11.35);skyShape.lineTo(12.1,-11.35);skyShape.lineTo(12.1,11.35);skyShape.lineTo(-12.1,11.35);skyShape.closePath();
  const hole=new THREE.Path();hole.moveTo(5.65,-8.5);hole.lineTo(5.65,-5.6);hole.lineTo(8.55,-5.6);hole.lineTo(8.55,-8.5);hole.closePath();skyShape.holes.push(hole);
  const skylight=new THREE.Mesh(new THREE.ShapeGeometry(skyShape),glazing);skylight.rotation.x=-Math.PI/2;skylight.position.set(0,top+.29,52);glassGroup.add(skylight);
  // Glass skin on the sides, so the sky lights the galleries as well as the void.
  for(const x of [left,right]){const skin=new THREE.Mesh(new THREE.PlaneGeometry(22.0,22.5),glazing);skin.rotation.y=Math.PI/2;skin.position.set(x,11.4,52);glassGroup.add(skin);}
  const circulation=buildCirculation(api);
  addClothBanners(root);
  // Dry garden and seating beneath the bright central void.
  slab(travertine,-.2,.15,54.6,4.4,6.4,1.4,.19);
  const gravel=mat('#c5c6b6',.96);slab(gravel,-.2,.35,54.6,4.05,6.05,1.35,.025);
  tree(-.2,54.8,5.4);for(let j=0;j<7;j++)rock(-.2+Math.cos(j*2.4)*1.5,54.6+Math.sin(j*2.4)*2.4,.42+(j%3)*.14,.32);
  for(const z of [46.5,51.6]){
    slab(M.wood,-7.5,.42,z,3.0,.8,.16,.13);for(const dx of [-1.1,1.1])box(M.darkMetal,-7.5+dx,.2,z,.12,.4,.61);
    inst(unitCylinder,M.marble,-5.6,.53,z,.48,.065,.48);inst(unitCylinder,M.bronze,-5.6,.27,z,.045,.48,.045);
  }
  for(let f=1;f<=3;f++)for(const z of [46.9]){
    box(M.darkMetal,9.37,f*4.65+.21,z,.55,.45,2.25);
    for(let i=0;i<14;i++)sphere(i%2?M.leaf:M.leafLight,9.4+(i%3-1)*.12,f*4.65+.51+(i%2)*.12,z+(i-6.5)*.15,.18,.16,.2);
  }
  return {...circulation,bounds:{front,back,left,right,top}};
}

export function stairWalkingHeight(flights,x,z,eyeY){
  let result=eyeY,best=1.0;
  for(const f of flights){if(Math.abs(x-f.x)>f.width/2)continue;const t=(z-f.z0)/(f.z1-f.z0);if(t<-.04||t>1.04)continue;const y=f.y0+(f.y1-f.y0)*THREE.MathUtils.clamp(t,0,1)+1.7;const diff=Math.abs(y-eyeY);if(diff<best){best=diff;result=y;}}
  return result;
}
