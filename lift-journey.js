import * as THREE from './vendor/three.module.js';

export function setLiftPose(lift,y,open,dockFloor=-1){
  lift.cabin.position.y=lift.cabinGlass.position.y=y+.04;lift.open=open;lift.dockFloor=dockFloor;
  lift.doors.forEach((p,i)=>p.position.x=(i?1:-1)*(.44+open*.78));
  lift.landingDoors.forEach((pair,f)=>pair.forEach((p,i)=>p.position.x=lift.x+(i?1:-1)*(.44+(f===dockFloor?open:0)*.78)));
}

export function createLiftJourney(lift,from,to){
  const y0=lift.floors[from],y1=lift.floors[to],initialY=lift.cabin.position.y-.04;
  const callTime=Math.abs(initialY-y0)<.1?0:1.2+Math.abs(initialY-y0)/(lift.fast?4:2);
  const phases=[...(callTime?[{key:'call',label:'候梯 · 轿厢正在到达',duration:callTime}]:[]),{key:'open',label:'电梯到达 · 开门',duration:1.1},{key:'enter',label:'进入电梯 · 可拖动环顾',duration:2.0},{key:'close',label:'关门 · 准备出发',duration:1.1},{key:'travel',label:`${to>=5?'B'+(to-4):to===4?'RF':to+1+'F'} · 观光电梯运行中`,duration:2+Math.abs(y1-y0)/(lift.fast?4:1.8)},{key:'arrive',label:'已到达 · 开门',duration:1.1},{key:'exit',label:'走出轿厢 · 前往回廊',duration:2}];
  let index=0,elapsed=0,done=false;
  const smooth=t=>t*t*(3-2*t);
  function tick(dt){if(done)return null;elapsed+=dt;while(elapsed>phases[index].duration&&index<phases.length-1){elapsed-=phases[index].duration;index++;}const phase=phases[index],t=THREE.MathUtils.clamp(elapsed/phase.duration,0,1),e=smooth(t);let y=y0,z=lift.z-2.85,lookZ=lift.z+2;
    if(phase.key==='call')setLiftPose(lift,THREE.MathUtils.lerp(initialY,y0,e),0,-1);
    if(phase.key==='open')setLiftPose(lift,y0,e,from);
    if(phase.key==='enter'){setLiftPose(lift,y0,1,from);z=THREE.MathUtils.lerp(lift.z-2.85,lift.z-.15,e);lookZ=THREE.MathUtils.lerp(lift.z+2,lift.z-8,e);}
    if(phase.key==='close'){setLiftPose(lift,y0,1-e,from);z=lift.z-.15;lookZ=lift.z-8;}
    if(phase.key==='travel'){y=THREE.MathUtils.lerp(y0,y1,e);setLiftPose(lift,y,0,-1);z=lift.z-.15;lookZ=lift.z-8;}
    if(phase.key==='arrive'){y=y1;setLiftPose(lift,y1,e,to);z=lift.z-.15;lookZ=lift.z-8;}
    if(phase.key==='exit'){y=y1;setLiftPose(lift,y1,1,to);z=THREE.MathUtils.lerp(lift.z-.15,lift.z-2.85,e);lookZ=lift.z-8;}
    if(index===phases.length-1&&t===1)done=true;
    const look=phase.key==='enter'?new THREE.Vector3(lift.x+Math.sin(Math.PI*e)*5,y+1.65,z+Math.cos(Math.PI*e)*5):new THREE.Vector3(lift.x,y+1.65,lookZ);
    return {position:new THREE.Vector3(lift.x,y+1.7,z),look,label:phase.label,phase:phase.key,done,floor:to};
  }
  return {tick,get done(){return done;},duration:phases.reduce((n,p)=>n+p.duration,0),from,to};
}
