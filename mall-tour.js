import * as THREE from './vendor/three.module.js';
import { LEVELS,levelAt } from './mall-navigation.js?v=13';
import { createLiftJourney } from './lift-journey.js?v=13';
import {createHeadingController,routeHeading,prepareRouteView,angleDelta,headingOf} from './journey-view.js?v=13';
import { LOCATIONS } from './scene.js?v=13';

const lengthOf=path=>path.slice(1).reduce((n,p,i)=>n+p.distanceTo(path[i]),0);
const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
function builder(model,navigator,start=new THREE.Vector3(16,1.7,-14)){
  const actions=[];let floor=levelAt(start.y),at=start.clone();
  function walk(title,x,z){const path=navigator.plan(at,{x,z},floor),distances=[0];for(let i=1;i<path.length;i++)distances.push(distances.at(-1)+path[i].distanceTo(path[i-1]));const length=distances.at(-1);if(length>.02){const action={kind:'walk',title,floor,path,distances,length,duration:length/2.6};prepareRouteView(action);actions.push(action);}at=path.at(-1).clone();}
  function pause(title,look,duration=4,extra={}){actions.push({kind:'pause',title,floor,position:at.clone(),look:new THREE.Vector3(...look),duration,...extra});}
  function ride(to,lift=model.atrium.lift){walk(lift.fast?'前往微空港快线':'沿回廊前往观光电梯',lift.x,lift.z-2.85);actions.push({kind:'lift',title:'候梯与乘梯',lift,from:floor,to,floor,duration:10+Math.abs(LEVELS[to]-LEVELS[floor])/(lift.fast?4:1.8)});floor=to;at=new THREE.Vector3(lift.x,LEVELS[floor]+1.7,lift.z-2.85);}
  function rest(f){const p=model.runtime.rests.find(p=>p.floor===f);if(!p)return;walk(`${f+1}F · 庭院观景休息台`,p.x,p.z);pause('坐下来，俯瞰内院与楼下人流',p.look,5,{kind:'rest',minutes:20});}
  return {actions,walk,pause,ride,rest,get at(){return at;},get floor(){return floor;},result(){return {actions,duration:actions.reduce((n,a)=>n+a.duration,0),length:actions.reduce((n,a)=>n+(a.length||0),0)};}};
}
export function buildShoppingItinerary(model,navigator,budget=2000){
  const b=builder(model,navigator),{walk,pause,ride,rest}=b,tier=budget>=5000?2:budget>=1000?1:0;let remaining=budget;
  function checkout(item,price,look){if(price<=remaining){remaining-=price;pause('收银台 · '+item,look,4.2,{kind:'checkout',item,price});return true;}pause('预算留给后面的行程 · 这次先欣赏',[...look],3);return false;}
  walk('1F · 感应门打开，进入 玩具反斗城',16,-3.8);pause('看看试驾赛道、积木、模型与卡牌',[11.2,1.3,-6.2],4);
  walk('到收银台挑选夏日盲盒',21.95,-7.45);checkout(['夏日盲盒 × 1','夏日盲盒 × 2','夏日盲盒 × 3'][tier],59*(tier+1),[23.8,1.3,-7.45]);
  walk('走进璟序珠宝，看看金饰与翡翠',-16,-4.3);pause('玻璃展柜 · 项链、金饰与腕表',[-21.4,1.3,-2.7],5);
  if(tier===2){walk('前往珠宝收银台',-21.95,-7.45);checkout('金饰项链',3600,[-23.8,1.3,-7.45]);}else pause('珠宝赏鉴 · 看看不买',[-12,1.4,3.3],3);
  ride(1);walk('2F · LINEN 夏日衣橱',13.8,18);pause('夏装、裤装、鞋履与配饰',[19.1,6.1,21.6],4);
  walk('全身镜与试衣间',13.8,28.8);pause('在镜子前看看夏日穿搭',[13.8,6.2,31.05],4);
  walk('服装收银台',18.5,16.8);checkout(['亚麻短裤','亚麻夏日套装','夏日服装与凉鞋套装'][tier],[199,399,899][tier],[20.5,5.9,16.8]);
  walk('NOMA · 浏览旅行箱与皮具',-13.8,18.2);pause('旅行箱、手袋与小配饰',[-13.8,6.2,27.3],4);
  if(tier>0){walk('PELLE · 选择一只夏日手袋',16,-4.8);pause('看看展柜中的手袋',[21,6.2,-1],4);walk('皮具工坊收银台',21.95,-7.45);checkout(tier===2?'经典皮革手袋':'夏日斜挎包',tier===2?3980:680,[23.8,6,-7.45]);}
  rest(1);ride(2);
  walk('3F · 山隐铜锅与鲜活海鲜缸',-16,-5.8);walk('沿过道走到海鲜缸前',-20.5,4.6);pause('水中的鱼、虾与蟹',[-20.5,10.75,6.25],5);
  if(tier===1){walk('凪日料 · 寿司与刺身',13.8,19.7);pause('坐下享用日料定食',[18,10.5,24],5,{kind:'rest',minutes:20});walk('日料店收银台',18.5,16.8);checkout('日料双人定食',268,[20.5,10.5,16.8]);}
  else if(tier===0){walk('麦屿面包店 · 选购与下午茶',16,-4.8);pause(remaining>=88?'坐下享用午餐':'在餐厅门边看看菜单',[20.4,10.35,-3.7],remaining>=88?5:3,{kind:remaining>=88?'rest':'pause',minutes:20});walk('面包店收银台',21.95,-7.45);checkout('面包与咖啡套餐',88,[23.8,10.6,-7.45]);}
  else {walk('火锅餐桌旁',-20.4,-5.75);pause('坐下享用鲜切与海鲜火锅',[-20.4,10.35,-3.7],5,{kind:'rest',minutes:20});walk('火锅店收银台',-21.95,-7.45);checkout('海鲜火锅双人套餐',488,[-23.8,10.6,-7.45]);}
  rest(2);ride(3);walk('4F · 中庭右侧光幕影院，穿过遮光前厅',9.45,23);pause('坐下看一会儿《牛来》',[9.45,16.15,31.05],5,{kind:'rest',minutes:20});
  walk('爆米花与可乐前台',18.5,16.8);checkout('爆米花与可乐',[38,88,108][tier],[20.5,15.7,16.8]);
  walk('沐禾足浴 · 暖水与休憩',-13.8,23.4);pause('看看足浴沙发与泡脚水盆',[-18.2,15.1,22.2],4);
  if(tier>0){pause('坐下享受足浴休憩',[-18.2,15.1,22.2],5,{kind:'rest',minutes:20});walk('足浴店服务前台',-18.5,16.8);checkout('足浴休憩服务',tier===2?298:158,[-20.5,15.2,16.8]);}
  walk('星屿 KTV · 麦克风与点歌台',-16,-5);pause('看看包厢与投影',[-11.4,16.3,5],4);
  if(tier>0){walk('KTV 前台',-21.95,-7.45);checkout('KTV 体验时段',tier===2?288:128,[-23.8,15.3,-7.45]);}
  rest(3);ride(4,model.express);
  walk('RF · 城市微空港与骑士驿站',-18.8,21.2);pause('无人机、外卖柜与黄色制服骑手',[-20,20,18.45],5);walk('观光航空站',16.4,17.7);pause('直升机、演示价目与航空装备',[13.8,21,26],6);
  walk('RF · 空中花园咖啡厅',16,2.1);pause('坐在花园里喝杯咖啡',[20.5,19.7,4.2],5,{kind:'rest',minutes:20});walk('云上咖啡收银台',18.3,2.7);checkout('花园咖啡与小蛋糕',48,[18.3,20,4.2]);
  ride(5,model.express);walk('B1 · 走过停车区与充电车位',-30.7,4);pause('地下停车与商场电梯导视',[-20,-2.8,11],4);
  ride(0,model.express);walk('返回庭院，结束本次逛街',0,-14);pause('逛街完成 · 查看模拟购物账单',[0,8,2],4,{event:{kind:'finish'}});
  return {...b.result(),budget,tier,plannedSpend:budget-remaining};
}

export function destinationPoint(key,currentFloor=0){const v=LOCATIONS[key];if(!v)throw Error('Unknown destination');const special={front:[0,-14,0],aerial:[0,-14,0],roof:[-16,-5,4],roofstairs:[12.4,8.8,3],toilets:[-3.5,65,currentFloor<4?currentFloor:0],drone:[-18.8,21.2,4],heliport:[16.4,17.7,4]};const [x,z,f]=special[key]||[v.eye[0],v.eye[2],levelAt(v.eye[1])];return {x,z,floor:f,look:v.target,title:v.title};}
export function buildDestinationItinerary(model,navigator,start,key){
  const target=destinationPoint(key,levelAt(start.y)),b=builder(model,navigator,start),from=b.floor;
  if(from!==target.floor){const candidates=[];for(const lift of [model.atrium.lift,model.express]){try{const a=navigator.plan(start,{x:lift.x,z:lift.z-2.85},from),z=navigator.plan({x:lift.x,z:lift.z-2.85},target,target.floor);candidates.push({lift,cost:lengthOf(a)+lengthOf(z)+(lift.fast?12:22)});}catch{}}
    if(!candidates.length)throw Error('没有连通的电梯路线');candidates.sort((a,b)=>a.cost-b.cost);b.ride(target.floor,candidates[0].lift);
  }
  b.walk('自动寻路 · '+target.title,target.x,target.z);b.pause(key.startsWith('rest')?'坐下来，俯瞰庭院':'已到达 · '+target.title,target.look,key.startsWith('rest')?5:2.5,key.startsWith('rest')?{kind:'rest',minutes:20}:{});return {...b.result(),destination:key,budget:null};
}
function positionAt(action,distance){const path=action.path;let i=1;while(i<action.distances.length-1&&action.distances[i]<distance)i++;const a=path[Math.max(0,i-1)],b=path[Math.min(i,path.length-1)];return a.clone().lerp(b,THREE.MathUtils.clamp((distance-action.distances[i-1])/(action.distances[i]-action.distances[i-1]||1),0,1));}
export function createShoppingTour(model,navigator){
  let itinerary=null,index=0,elapsed=0,travelled=0,active=false,paused=false,liftRun=null,balance=0;const bag=[],events=[];let dispatched=false;const heading=createHeadingController();
  function start({budget=2000,start=null,destination=null}={}){itinerary=destination?buildDestinationItinerary(model,navigator,start,destination):buildShoppingItinerary(model,navigator,Math.max(0,budget));index=elapsed=travelled=0;heading.reset();active=true;paused=false;liftRun=null;balance=budget;bag.length=events.length=0;dispatched=false;}
  function next(){index++;elapsed=travelled=0;dispatched=false;liftRun=null;if(index>=itinerary.actions.length)active=false;}
  function tick(dt,speed=1){
    if(!active||paused)return null;const action=itinerary.actions[index];elapsed+=dt*(['rest','checkout'].includes(action.kind)?1:speed);let position,look,guideYaw,label=action.title,checkout=null,clock=null;
    if(action.kind==='lift'){if(!liftRun)liftRun=createLiftJourney(action.lift,action.from,action.to);const result=liftRun.tick(dt*speed);position=result.position;look=result.look;label=result.label;if(result.done)next();}
    else if(action.kind==='walk'){
      const targetYaw=routeHeading(action,travelled);guideYaw=heading.tick(targetYaw,dt);
      const alignment=Math.abs(angleDelta(targetYaw,guideYaw));
      // Slow right down for a hairpin; travel resumes as the view faces the aisle.
      const turnScale=THREE.MathUtils.clamp(1-alignment/.75,.035,1);
      const bend=Math.abs(angleDelta(routeHeading(action,Math.min(action.length,travelled+1.8)),targetYaw));
      const advance=dt*speed*2.6*turnScale/(1+bend*1.8);travelled=Math.min(action.length,travelled+advance);position=positionAt(action,travelled);
      const door=model.runtime.doors.find(d=>Math.abs(position.x-d.x)<1.35&&Math.abs(position.z-d.z)<.6&&Math.abs(position.y-d.base-1.7)<.3);
      if(door&&door.open<.9){travelled=Math.max(0,travelled-advance);position=positionAt(action,travelled);label='感应门正在开启';}
      look=position.clone().add(new THREE.Vector3(-Math.sin(guideYaw)*6,0,-Math.cos(guideYaw)*6));
      if(travelled>=action.length&&label!=='感应门正在开启')next();
    }else{
      position=action.position.clone();look=action.look.clone();
      const following=itinerary.actions[index+1];
      const target=following?.kind==='walk'&&action.duration-elapsed<3?routeHeading(following,0):(heading.yaw??headingOf(position,look));
      guideYaw=heading.tick(target,dt);
      if(action.kind==='rest'){const seated=smooth(elapsed/.85)*(1-smooth((elapsed-4.15)/.85));position.y-=seated*.57;clock={seconds:Math.ceil(action.minutes*60*(1-THREE.MathUtils.clamp((elapsed-1)/3,0,1))),progress:THREE.MathUtils.clamp((elapsed-1)/3,0,1),seated};}
      if(action.kind==='checkout'){const paid=elapsed>=2;if(paid&&!dispatched){dispatched=true;balance-=action.price;const item={item:action.item,price:action.price};bag.push(item);events.push({kind:'buy',...item});}checkout={item:action.item,price:action.price,before:balance+(paid?action.price:0),after:balance-(paid?0:action.price),paid};}
      if(action.event&&!dispatched&&elapsed>.7){dispatched=true;events.push(action.event);}
      if(elapsed>=action.duration)next();
    }
    if(guideYaw===undefined)guideYaw=heading.tick(headingOf(position,look),dt);
    // A level horizon, including on raked cinema floors. Dragging remains free.
    look=position.clone().add(new THREE.Vector3(-Math.sin(guideYaw)*6,0,-Math.cos(guideYaw)*6));
    return {position,look,guideYaw,label,kind:action.kind,step:Math.min(index+1,itinerary.actions.length),steps:itinerary.actions.length,progress:Math.min(1,(index+Math.min(elapsed/(action.duration||1),.99))/itinerary.actions.length),floor:action.floor,done:!active,bag:[...bag],checkout,clock,balance,budget:itinerary.budget};
  }
  return {start,tick,stop(){active=false;paused=false;},pause(){paused=!paused;return paused;},get active(){return active;},get paused(){return paused;},get itinerary(){return itinerary;},get index(){return index;},get bag(){return bag;},get balance(){return balance;},get events(){return events;}};
}
