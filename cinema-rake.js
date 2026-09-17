import * as THREE from './vendor/three.module.js';

// Rear entrance climbs to row 4, then three shallow steps connect each row.
// Heights are shared by rendering and navigation, so the camera follows the floor.
export const ROW_RISES=[1.35,.85,.4,0];
export function cinemaRakeSections(cz){
  const sections=[];
  for(let i=0;i<9;i++)sections.push({a:cz-3.75+i*2.05/9,b:cz-3.75+(i+1)*2.05/9,h:.15*(i+1)});
  let a=cz-1.7;
  for(let row=0;row<4;row++){
    const end=cz-1.1+row*1.6+.5;
    sections.push({a,b:end,h:ROW_RISES[row]});
    if(row<3){for(let k=0;k<3;k++)sections.push({a:end+k*.2,b:end+(k+1)*.2,h:ROW_RISES[row]+(ROW_RISES[row+1]-ROW_RISES[row])*(k+1)/3});a=end+.6;}
  }
  return sections;
}
export function cinemaFloorOffset(room,x,z){
  if(!room.cinema||!room.cinema.halls.some(h=>Math.abs(x-h.x)<4.17))return 0;
  const sections=room.cinema.rake;
  for(let i=0;i<sections.length;i++){
    const s=sections[i];if(z<s.a||z>s.b)continue;
    // Blend the footstep rise over 9 cm to avoid a sharp first-person camera jolt.
    const previous=i?sections[i-1].h:0,t=Math.min(1,Math.max(0,(z-s.a)/.09));
    return previous+(s.h-previous)*t;
  }
  return 0;
}
export function buildCinemaRake(api,room,x){
  const {inst,mats:M}=api,cube=new THREE.BoxGeometry(1,1,1);
  const carpet=new THREE.MeshStandardMaterial({color:'#20212a',roughness:1});
  const edge=new THREE.MeshBasicMaterial({color:'#9b9372'});
  for(const s of room.cinema.rake){
    const h=.08+s.h,z=(s.a+s.b)/2;
    inst(cube,carpet,x,room.base+h/2,z,8.34,h,s.b-s.a);
    // Low luminous nosings only in the centre and side aisles, never across chairs.
    for(const [dx,width] of [[-3.8,.55],[0,1.1],[3.8,.55]])inst(cube,edge,x+dx,room.base+h+.008,s.a+.018,width,.012,.026,0,0,0,false);
  }
}
