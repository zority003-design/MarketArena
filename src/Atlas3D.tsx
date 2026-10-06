import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { CompanyPreview, Country } from "./data/world";

type Atlas3DProps = {
  countries: Country[];
  selected: string;
  onSelect: (id: string) => void;
  showCompanies?: boolean;
  onCompany?: (company: CompanyPreview) => void;
  holdings?: Record<string, number>;
  home?: { housing: string; label: string };
};
type GeoPoint = [number, number];

const SHARES = 1_000_000;
const W = 32, D = 23;

const countryPolygons: Record<string, GeoPoint[]> = {
  lirania:[[12,31],[14,23],[22,17],[31,14],[40,17],[39,24],[37,31],[39,39],[35,47],[38,54],[36,61],[30,63],[27,68],[22,71],[18,67],[15,60],[12,52],[14,43],[12,37]],
  slavoriya:[[40,17],[48,14],[58,18],[57,27],[60,35],[57,43],[61,50],[58,57],[60,64],[55,61],[49,64],[43,60],[36,61],[38,54],[35,47],[39,39],[37,31],[39,24]],
  darvast:[[58,18],[68,15],[77,18],[86,25],[91,34],[92,42],[89,50],[85,57],[82,63],[84,69],[80,75],[73,79],[66,77],[60,73],[60,64],[58,57],[61,50],[57,43],[60,35],[57,27]],
  estraviya:[[36,61],[43,60],[49,64],[55,61],[60,64],[60,73],[56,78],[51,83],[45,86],[39,85],[33,81],[29,76],[27,70],[30,63]],
  saverniya:[[60,64],[66,77],[73,79],[80,75],[84,69],[87,73],[88,80],[84,86],[78,90],[70,92],[63,90],[56,88],[51,83],[56,78],[60,73]]
};
const capitalGeo: Record<string,GeoPoint> = {
  slavoriya:[48,42],lirania:[27,43],darvast:[72,43],estraviya:[45,72],saverniya:[72,80]
};
const labelGeo: Record<string,GeoPoint> = {
  slavoriya:[47,37],lirania:[25,43],darvast:[74,42],estraviya:[43,75],saverniya:[72,84]
};

function clamp(v:number,a:number,b:number){return Math.max(a,Math.min(b,v));}
function hash(x:number,z:number){const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);}
function pointInPolygon(u:number,v:number,poly:GeoPoint[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>v)!==(yj>v))&&(u<(xj-xi)*(v-yi)/((yj-yi)||1e-6)+xi))inside=!inside;}return inside;}
function worldFromGeo([u,v]:GeoPoint){return new THREE.Vector3((u-50)*.32,0,(v-50)*.24);}
function terrainHeight(x:number,z:number){const n=Math.sin(x*.42+z*.21)*.13+Math.sin(x*.17-z*.33)*.10+Math.cos(z*.28)*.08;return clamp(.24+n+(x<0?.15:0),.06,.78);}
function surfaceHeight(x:number,z:number){return terrainHeight(x,z)*.34;}

function residenceGeo(countryId:string,housing:string):GeoPoint{
  const c=capitalGeo[countryId]; const d:Record<string,[number,number]>={dormitory:[-4.8,-3.2],shared:[-2.7,-2.4],studio:[1.4,-1],apartment:[3.4,1.9],premium:[5.1,3.5]};
  const [du,dv]=d[housing]??d.studio;
  for(const p of [[c[0]+du,c[1]+dv],[c[0]+du*.55,c[1]+dv*.55],c] as GeoPoint[])if(pointInPolygon(p[0],p[1],countryPolygons[countryId]))return p;
  return c;
}
function safeCompanyGeo(countryId:string,company:CompanyPreview):GeoPoint{
  const poly=countryPolygons[countryId],c=capitalGeo[countryId];
  const seed=company.ticker.split("").reduce((n,ch,i)=>n+ch.charCodeAt(0)*(i+5),countryId.length*91);
  for(let i=0;i<240;i++){const u=8+hash(seed+i*17.3,3+i*.7)*84,v=8+hash(seed*.7+i*31.1,8+i*1.2)*84;
    if(pointInPolygon(u,v,poly)&&pointInPolygon(u+.7,v,poly)&&pointInPolygon(u-.7,v,poly)&&pointInPolygon(u,v+.7,poly)&&pointInPolygon(u,v-.7,poly)&&Math.hypot(u-c[0],v-c[1])>3)return [u,v];
  }
  return c;
}

type District={id:string;name:string;kind:"residential"|"industrial"|"business"|"retail"|"logistics"|"tech"|"civic";center:GeoPoint;size:[number,number];accent:string};
const districtKind=(sector:string):District["kind"]=>{
  if(["Нефть","Металлы","Энергетика","Промышленность","Машиностроение","Химия"].includes(sector))return "industrial";
  if(["Финансы","Страхование","Технологии","Биотех","Электроника","Робототехника"].includes(sector))return sector==="Финансы"||sector==="Страхование"?"business":"tech";
  if(["Порты","Судоходство","Логистика"].includes(sector))return "logistics";
  if(sector==="Ритейл")return "retail";
  return "civic";
};
function makeBuilding(x:number,z:number,s=1,type=0,kind="residential",controlled=false){const g=new THREE.Group();const palettes:Record<string,string[]>={residential:["#78858a","#a09b8c","#66767c","#8a7568"],industrial:["#59666a","#6b6a63","#53646b"],business:["#46636d","#5b7278","#3e5962"],retail:["#766f61","#8a7b68","#5f6f6b"],logistics:["#59666a","#6d726b","#536a70"],tech:["#4d6f73","#536783","#456b68"],civic:["#657078","#7d8179","#5e6b70"]};const list=palettes[kind]??palettes.residential,base=list[type%list.length];const profiles=[{w:.62,d:.58,h:1.05,roof:"flat"},{w:.52,d:.54,h:1.75,roof:"flat"},{w:.76,d:.64,h:.72,roof:"gable"},{w:.44,d:.48,h:2.35,roof:"flat"},{w:.70,d:.55,h:1.25,roof:"gable"},{w:.86,d:.68,h:.52,roof:"low"}];const q=profiles[type%profiles.length],h=q.h*s,w=q.w*s,d=q.d*s;const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:controlled?"#7b6940":base,roughness:.78,metalness:kind==="business"||kind==="tech"?.08:.01}));body.position.y=h/2;g.add(body);if(q.roof==="gable"){const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,.34*s,4),new THREE.MeshStandardMaterial({color:"#3a3d3c",roughness:.9}));roof.rotation.y=Math.PI/4;roof.position.y=h+.17*s;g.add(roof);}else{const roof=new THREE.Mesh(new THREE.BoxGeometry(w*1.04,.045*s,d*1.04),new THREE.MeshStandardMaterial({color:"#303b3e",roughness:.9}));roof.position.y=h+.025*s;g.add(roof);}if(type===1||type===3){const floors=Math.max(2,Math.floor(h/(.55*s)));for(let f=0;f<Math.min(floors,5);f++)for(const side of [-1,1]){const win=new THREE.Mesh(new THREE.BoxGeometry(w*.055,.13*s,.018*s),new THREE.MeshStandardMaterial({color:"#9ccbd0",emissive:"#28505a",emissiveIntensity:.22,roughness:.35}));win.position.set(side*(w*.34),(.34+f*.42)*s,d/2+.011*s);g.add(win);}}if(kind==="industrial")for(let i=0;i<2;i++){const chimney=new THREE.Mesh(new THREE.CylinderGeometry(.035*s,.045*s,.55*s,8),new THREE.MeshStandardMaterial({color:"#4b5558",roughness:1}));chimney.position.set((i-.5)*w*.5,.32*s,d*.28);g.add(chimney);}if(kind==="logistics"){const tank=new THREE.Mesh(new THREE.CylinderGeometry(.14*s,.14*s,.25*s,12),new THREE.MeshStandardMaterial({color:"#9a9d91",roughness:.8}));tank.rotation.z=Math.PI/2;tank.position.set(w*.42,.16*s,0);g.add(tank);}if(kind==="tech"){const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.012*s,.012*s,.42*s,6),new THREE.MeshStandardMaterial({color:"#b7bfc0",roughness:.7}));antenna.position.y=h+.23*s;g.add(antenna);}g.position.set(x,surfaceHeight(x,z),z);g.castShadow=true;g.receiveShadow=true;return g;}
function makeTree(x:number,z:number,s=.5){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.025*s,.04*s,.25*s,6),new THREE.MeshStandardMaterial({color:"#514536",roughness:1}));t.position.y=.13*s;const c=new THREE.Mesh(new THREE.SphereGeometry(.13*s,7,6),new THREE.MeshStandardMaterial({color:"#31563b",roughness:1}));c.position.y=.32*s;g.add(t,c);g.position.set(x,surfaceHeight(x,z),z);g.castShadow=true;return g;}
function makeCar(curve:THREE.CatmullRomCurve3,s=.7){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.12*s,.05*s,.23*s),new THREE.MeshStandardMaterial({color:"#d6dddd",roughness:.65}));b.position.y=.04*s;const c=new THREE.Mesh(new THREE.BoxGeometry(.085*s,.04*s,.105*s),new THREE.MeshStandardMaterial({color:"#45636c",roughness:.45}));c.position.y=.075*s;g.add(b,c);g.userData.roadCurve=curve;return g;}
function makePerson(curve:THREE.CatmullRomCurve3,s=.75){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.025*s,.032*s,.11*s,6),new THREE.MeshStandardMaterial({color:"#748e9a",roughness:.9}));body.position.y=.09*s;const head=new THREE.Mesh(new THREE.SphereGeometry(.035*s,7,6),new THREE.MeshStandardMaterial({color:"#c9a27e",roughness:1}));head.position.y=.17*s;g.add(body,head);g.userData.walkCurve=curve;return g;}
function roadCurve(a:GeoPoint,b:GeoPoint,bend=0){const p1=worldFromGeo(a),p2=worldFromGeo(b),dx=p2.x-p1.x,dz=p2.z-p1.z,l=Math.max(.1,Math.hypot(dx,dz)),nx=-dz/l,nz=dx/l;const mid=new THREE.Vector3((p1.x+p2.x)/2+nx*bend*l,0,(p1.z+p2.z)/2+nz*bend*l);return new THREE.CatmullRomCurve3([new THREE.Vector3(p1.x,surfaceHeight(p1.x,p1.z)+.055,p1.z),new THREE.Vector3(mid.x,surfaceHeight(mid.x,mid.z)+.055,mid.z),new THREE.Vector3(p2.x,surfaceHeight(p2.x,p2.z)+.055,p2.z)]);}
function roadMesh(curve:THREE.CatmullRomCurve3,width=.12,sidewalk=false){const pts=curve.getPoints(24),v:number[]=[],ind:number[]=[];pts.forEach((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.max(.001,Math.hypot(dx,dz)),nx=-dz/l,nz=dx/l;for(const sign of [1,-1]){const x=p.x+nx*width*sign*.5,z=p.z+nz*width*sign*.5;v.push(x,surfaceHeight(x,z)+.018,z);}});for(let i=0;i<pts.length-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;ind.push(a,c,b,b,c,d);}const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(v,3));geo.setIndex(ind);geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:sidewalk?"#a0a5a1":"#273338",roughness:.96,side:THREE.DoubleSide}));m.receiveShadow=true;return m;}

function districtForCompany(country:Country,company:CompanyPreview,index:number):District{
  const c=capitalGeo[country.id],g=safeCompanyGeo(country.id,company),kind=districtKind(company.sector);
  const offsets:Record<string,[number,number]>={industrial:[-2.8,1.4],business:[1.7,-1.7],tech:[-1.5,-2.1],logistics:[2.8,2.1],retail:[2.3,.7],civic:[0,2.7],residential:[-2.2,.3]};
  const o=offsets[kind]??[0,0];const center:GeoPoint=[clamp((g[0]*.7+c[0]*.3)+o[0],10,90),clamp((g[1]*.7+c[1]*.3)+o[1],10,90)];
  return {id:"district-"+company.ticker,name:company.sector+" квартал",kind,center,size:[4.6+(index%3)*.7,3.2+(index%2)*.6],accent:company.ticker};
}

function makeTerrain(selected:string){const nx=128,nz=88,pos:number[]=[],colors:number[]=[],ind:number[]=[];for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){const u=x/nx*100,v=z/nz*100,p=worldFromGeo([u,v]);let landId:string|undefined;for(const id of Object.keys(countryPolygons))if(pointInPolygon(u,v,countryPolygons[id])){landId=id;break;}const land=!!landId,h=land?surfaceHeight(p.x,p.z):-.18;pos.push(p.x,h,p.z);const isSelected=landId===selected,base=isSelected?new THREE.Color("#6f8065"):new THREE.Color("#525d5b"),alt=new THREE.Color("#9b987c"),c=land?base.lerp(alt,clamp((h+.02)/.48,0,1)*.32):new THREE.Color("#46565b");colors.push(c.r,c.g,c.b);}for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const a=z*(nx+1)+x,b=a+1,c=a+nx+1,d=c+1;ind.push(a,c,b,b,c,d);}const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));geo.setIndex(ind);geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98}));m.receiveShadow=true;return m;}
function makeWater(){const geo=new THREE.PlaneGeometry(34,25,1,1);const mat=new THREE.ShaderMaterial({transparent:true,uniforms:{uTime:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin((p.x+uTime*.35)*1.7)*.018+cos((p.y-uTime*.28)*2.1)*.012;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;void main(){float wave=sin(vUv.x*28.0+uTime*.8)*.035+cos(vUv.y*34.0-uTime*.6)*.025;vec3 c=mix(vec3(.035,.16,.22),vec3(.07,.29,.35),vUv.y*.25+wave);gl_FragColor=vec4(c,.94);}`});const mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=-.43;mesh.userData.waterShader=mat;return mesh;}

export function Atlas3D({countries,selected,onSelect,showCompanies=false,onCompany,holdings={},home}:Atlas3DProps){
  const hostRef=useRef<HTMLDivElement|null>(null),overlayRef=useRef<HTMLDivElement|null>(null),homeRef=useRef<HTMLDivElement|null>(null);
  const companyRefs=useRef<Record<string,HTMLButtonElement|null>>({}),labelRefs=useRef<Record<string,HTMLButtonElement|null>>({});
  const onSelectRef=useRef(onSelect),onCompanyRef=useRef(onCompany);onSelectRef.current=onSelect;onCompanyRef.current=onCompany;

  useEffect(()=>{
    const host=hostRef.current,overlay=overlayRef.current;if(!host||!overlay)return;
    const country=countries.find(c=>c.id===selected);if(!country)return;
    const scene=new THREE.Scene();scene.background=new THREE.Color("#081116");scene.fog=new THREE.Fog("#081116",30,58);
    const camera=new THREE.PerspectiveCamera(48,1,.1,100);const center=worldFromGeo(capitalGeo[selected]);const homeGeo=home?.housing?residenceGeo(selected,home.housing):capitalGeo[selected];const focus=worldFromGeo(homeGeo);const target=new THREE.Vector3(focus.x,.25,focus.z);
    camera.position.set(focus.x,14.5,focus.z+16);camera.lookAt(target);
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.insertBefore(renderer.domElement,host.firstChild);renderer.domElement.className="atlas-3d-canvas";
    scene.add(new THREE.HemisphereLight("#dce7e3","#172528",1.4));const sun=new THREE.DirectionalLight("#fff0d2",3);sun.position.set(-10,18,-8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
    const water=makeWater();scene.add(water);const terrain=makeTerrain(selected);scene.add(terrain);Object.entries(countryPolygons).forEach(([id,poly])=>{const shape=new THREE.Shape();poly.forEach(([u,v],i)=>{const p=worldFromGeo([u,v]);if(i===0)shape.moveTo(p.x,p.z);else shape.lineTo(p.x,p.z);});shape.closePath();const isSelected=id===selected,cc=countries.find(c=>c.id===id)?.color??"#6f8065";const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:new THREE.Color(isSelected?cc:"#65706f"),transparent:true,opacity:isSelected?.18:.055,depthWrite:false,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.y=.09;scene.add(mesh);});

    const countryShape=new THREE.Shape();countryPolygons[selected].forEach(([u,v],i)=>{const p=worldFromGeo([u,v]);if(i===0)countryShape.moveTo(p.x,p.z);else countryShape.lineTo(p.x,p.z);});countryShape.closePath();const countryMesh=new THREE.Mesh(new THREE.ShapeGeometry(countryShape),new THREE.MeshBasicMaterial({color:new THREE.Color(country.color),transparent:true,opacity:.09,depthWrite:false,side:THREE.DoubleSide}));countryMesh.rotation.x=-Math.PI/2;countryMesh.position.y=.09;scene.add(countryMesh);

    const districts:District[]=country.companies.map((c,i)=>districtForCompany(country,c,i));
    const companyGeos=country.companies.map((_,i)=>districts[i].center);
    const districtCenters:GeoPoint[]=[capitalGeo[selected],...districts.map(d=>d.center),residenceGeo(selected,home?.housing??"studio")];

    // The road hierarchy is generated from the economic graph: trunk routes first, local streets second.
    const trunkCurves:THREE.CatmullRomCurve3[]=[];
    for(let i=0;i<districts.length;i++){const a=districts[i].center,b= i<districts.length-1?districts[i+1].center:capitalGeo[selected];const curve=roadCurve(a,b,(i%2?-.06:.06));trunkCurves.push(curve);scene.add(roadMesh(curve,.29,true));scene.add(roadMesh(curve,.17));}
    const localCurves:THREE.CatmullRomCurve3[]=[];
    districts.forEach((d,di)=>{
      const corners:[[number,number],[number,number],[number,number],[number,number]]=[
        [d.center[0]-d.size[0]/2,d.center[1]-d.size[1]/2],[d.center[0]+d.size[0]/2,d.center[1]-d.size[1]/2],
        [d.center[0]+d.size[0]/2,d.center[1]+d.size[1]/2],[d.center[0]-d.size[0]/2,d.center[1]+d.size[1]/2]
      ];
      for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],curve=roadCurve(a,b,0);localCurves.push(curve);scene.add(roadMesh(curve,.17,true));scene.add(roadMesh(curve,.085));}
      // District buildings are purposeful: production, office, retail, or housing based on the sector.
      const company=country.companies[di];const kind=d.kind;
      const p=worldFromGeo(d.center);const owned=(holdings[company.ticker]??0)/SHARES>=.51;scene.add(makeBuilding(p.x,p.z,.82,(di+2)%6,kind,owned));for(let i=0;i<2;i++){const hp:GeoPoint=[d.center[0]-d.size[0]*.42+i*d.size[0]*.75,d.center[1]+d.size[1]*.38];if(pointInPolygon(hp[0],hp[1],countryPolygons[selected])){const q=worldFromGeo(hp);scene.add(makeBuilding(q.x,q.z,.42,(di+i+1)%6,"residential",false));}}const tp=worldFromGeo([d.center[0]+.65,d.center[1]+.62]);scene.add(makeTree(tp.x,tp.z,.5));
    });

    // Capital district: exchange, government, central bank and public square.
    const cap=worldFromGeo(capitalGeo[selected]);scene.add(makeBuilding(cap.x,cap.z,1.9,1,"business",false));scene.add(makeBuilding(cap.x-1.0,cap.z+.35,1.25,0,"civic",false));scene.add(makeBuilding(cap.x+1.05,cap.z-.35,1.1,1,"business",false));
    const square=new THREE.Mesh(new THREE.BoxGeometry(2.7,.035,1.5),new THREE.MeshStandardMaterial({color:"#737773",roughness:1}));square.position.set(cap.x,surfaceHeight(cap.x,cap.z)+.035,cap.z);scene.add(square);

    // Residential fabric is compact and connected, not random filler.
    const residentialCenter=residenceGeo(selected,home?.housing??"studio");
    for(let block=0;block<8;block++){const gx=residentialCenter[0]+(block%4-1.5)*1.25,gz=residentialCenter[1]+(Math.floor(block/4)-.5)*1.35;if(!pointInPolygon(gx,gz,countryPolygons[selected]))continue;const p=worldFromGeo([gx,gz]);scene.add(makeBuilding(p.x,p.z,.46+(block%2)*.07,(block+4)%6,"residential",false));}
    const homeP=worldFromGeo(residentialCenter);const homeBuilding=makeBuilding(homeP.x,homeP.z,home?.housing==="premium"?1.15:.72,home?.housing==="premium"?1:0,"residential",true);homeBuilding.userData.playerHome=true;scene.add(homeBuilding);
    const homeRoad=roadCurve(residentialCenter,capitalGeo[selected],.08);scene.add(roadMesh(homeRoad,.18,true));scene.add(roadMesh(homeRoad,.10));

    // Company HQ marker/building is physically tied to the exact company location.
    country.companies.forEach((company,i)=>{const p=worldFromGeo(companyGeos[i]);const kind=districtKind(company.sector);const owned=(holdings[company.ticker]??0)/SHARES>=.51;const hq=makeBuilding(p.x,p.z,1.02,i%3,kind,owned);hq.userData.companyTicker=company.ticker;hq.userData.company=company;scene.add(hq);});

    // Controlled companies get a visible economic ring; stakes get a smaller footprint.
    country.companies.forEach((company,i)=>{const p=worldFromGeo(companyGeos[i]),shares=holdings[company.ticker]??0,ownership=Math.min(100,Math.round(shares/SHARES*100));if(ownership>0){const ring=new THREE.Mesh(new THREE.RingGeometry(.28+(ownership/100)*.12,.31+(ownership/100)*.12,32),new THREE.MeshBasicMaterial({color:ownership>=51?0xd9b866:0x5ed0ae,transparent:true,opacity:.8,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,surfaceHeight(p.x,p.z)+.035,p.z);scene.add(ring);}});

    // People and vehicles move only on actual roads/sidewalks.
    const routes=[...trunkCurves,...localCurves];routes.slice(0,Math.min(18,routes.length)).forEach((curve,i)=>{const car=makeCar(curve,.7+(i%3)*.12);car.userData.roadT=(i*.071)%1;scene.add(car);});
    routes.slice(0,Math.min(22,routes.length)).forEach((curve,i)=>{const person=makePerson(curve,.7+(i%2)*.12);person.userData.walkT=(i*.11)%1;scene.add(person);});
    for(let i=0;i<30;i++){
      const d=districts[i%districts.length];
      const treeGeo:GeoPoint=[d.center[0]+(hash(i,3)-.5)*d.size[0],d.center[1]+(hash(i,7)-.5)*d.size[1]];
      const p=worldFromGeo(treeGeo);
      if(pointInPolygon(treeGeo[0],treeGeo[1],countryPolygons[selected]))scene.add(makeTree(p.x,p.z,.32+hash(i,8)*.28));
    }

    const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();let drag=false,moved=false,lastX=0,lastY=0,zoom=1.62,panX=0,panZ=0;
    const updateCamera=()=>{const dist=22/zoom;camera.position.set(focus.x+panX,dist*.66,focus.z+dist*.78+panZ);target.set(focus.x+panX*.55,.12,focus.z+panZ*.42);camera.lookAt(target);};
    const project=(p:THREE.Vector3)=>{const rect=host.getBoundingClientRect(),q=p.clone();q.y=surfaceHeight(q.x,q.z)+.65;q.project(camera);return{x:(q.x*.5+.5)*rect.width,y:(-q.y*.5+.5)*rect.height,z:q.z};};
    const updateOverlay=()=>{const hm=homeRef.current;if(hm){const q=project(homeP);hm.style.transform=`translate3d(${q.x}px,${q.y}px,0) translate(-50%,-100%)`;hm.style.opacity=q.z>1?"0":"1";}if(showCompanies)country.companies.forEach((c,i)=>{const el=companyRefs.current[c.ticker];if(!el)return;const q=project(worldFromGeo(companyGeos[i]));el.style.transform=`translate3d(${q.x}px,${q.y}px,0) translate(-50%,-50%)`;el.style.opacity=q.z>1?"0":"1";});countries.forEach(c=>{const el=labelRefs.current[c.id];if(!el)return;const q=project(worldFromGeo(labelGeo[c.id]));el.style.transform=`translate3d(${q.x}px,${q.y}px,0) translate(-50%,-50%)`;el.style.opacity=q.z<1?(c.id===selected?"1":".72"):"0";});};
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();updateOverlay();};
    const down=(e:PointerEvent)=>{drag=true;moved=false;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};
    const move=(e:PointerEvent)=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;panX=clamp(panX-dx*.018/zoom,-5,5);panZ=clamp(panZ+dy*.015/zoom,-4,4);lastX=e.clientX;lastY=e.clientY;updateCamera();updateOverlay();};
    const up=(e:PointerEvent)=>{drag=false;renderer.domElement.releasePointerCapture(e.pointerId);};
    const wheel=(e:WheelEvent)=>{e.preventDefault();zoom=clamp(zoom*Math.exp(-e.deltaY*.0012),.95,3.25);updateCamera();updateOverlay();};
    const click=(e:MouseEvent)=>{if(moved)return;const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(scene.children,true);const hit=hits.find(h=>h.object.userData.companyTicker) as THREE.Intersection|undefined;if(hit){const ticker=hit.object.userData.companyTicker as string;const company=country.companies.find(c=>c.ticker===ticker);if(company)onCompanyRef.current?.(company);return;}const ground=raycaster.intersectObject(terrain,false)[0];if(ground){const u=ground.point.x/.32+50,v=ground.point.z/.24+50;const c=countries.find(x=>pointInPolygon(u,v,countryPolygons[x.id]));if(c)onSelectRef.current(c.id);}};
    renderer.domElement.addEventListener("pointerdown",down);renderer.domElement.addEventListener("pointermove",move);renderer.domElement.addEventListener("pointerup",up);renderer.domElement.addEventListener("wheel",wheel,{passive:false});renderer.domElement.addEventListener("click",click);const observer=new ResizeObserver(resize);observer.observe(host);resize();updateCamera();
    let raf=0;const render=()=>{const waterMat=water.userData.waterShader as THREE.ShaderMaterial;waterMat.uniforms.uTime.value=performance.now()/1000;raf=requestAnimationFrame(render);scene.traverse(o=>{const rc=o.userData.roadCurve as THREE.CatmullRomCurve3|undefined,wc=o.userData.walkCurve as THREE.CatmullRomCurve3|undefined;if(rc){o.userData.roadT=(o.userData.roadT+.001)%1;const p=rc.getPointAt(o.userData.roadT),a=rc.getPointAt((o.userData.roadT+.01)%1);o.position.set(p.x,surfaceHeight(p.x,p.z)+.09,p.z);o.lookAt(a.x,surfaceHeight(a.x,a.z)+.09,a.z);}if(wc){o.userData.walkT=(o.userData.walkT+.0008)%1;const p=wc.getPointAt(o.userData.walkT),a=wc.getPointAt((o.userData.walkT+.015)%1);o.position.set(p.x,surfaceHeight(p.x,p.z)+.04,p.z);o.lookAt(a.x,surfaceHeight(a.x,a.z)+.04,a.z);}});updateOverlay();renderer.render(scene,camera);};render();
    return()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointermove",move);renderer.domElement.removeEventListener("pointerup",up);renderer.domElement.removeEventListener("wheel",wheel);renderer.domElement.removeEventListener("click",click);scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const mat=m.material;if(Array.isArray(mat))mat.forEach(x=>x.dispose());else if(mat)mat.dispose();});renderer.dispose();renderer.domElement.remove();};
  },[countries,selected,showCompanies,holdings,home?.housing,home?.label]);

  const selectedCountry=countries.find(c=>c.id===selected);
  return <div className="atlas atlas-3d">
    <div className="atlas-head"><span>ЭКОНОМИЧЕСКИЙ ГОРОД · ЖИВАЯ КАРТА</span><span>DRAG · ZOOM · CLICK</span></div>
    <div className="atlas-3d-viewport" ref={hostRef}>
      <div className="atlas-3d-overlay" ref={overlayRef}>
        <div ref={homeRef} className="atlas-home-marker"><i/><span>{home?.label??"МОЙ ДОМ"}</span></div>
        {countries.map(c=><button key={c.id} ref={el=>{labelRefs.current[c.id]=el}} className="atlas-capital-marker" onClick={()=>onSelect(c.id)} type="button"><i/><span>{c.capital}</span></button>)}
        {showCompanies&&selectedCountry?.companies.map(company=>{const shares=holdings[company.ticker]??0,ownership=Math.min(100,Math.round(shares/SHARES*100)),controlled=ownership>=51;return <button key={company.ticker} ref={el=>{companyRefs.current[company.ticker]=el}} className={`atlas-company-marker premium-company-marker ${controlled?"owned control":shares>0?"owned stake":""}`} type="button" onClick={()=>onCompany?.(company)}><b>{company.ticker}</b><span>{company.name}</span><small>{controlled?"КОНТРОЛЬ 51%":shares>0?`${ownership}% ДОЛЯ`:"ПРЕДПРИЯТИЕ"}</small></button>})}
      </div>
      <div className="atlas-map-hud"><span><b>●</b> дом</span><span><b>■</b> район</span><span><b className="owned">◆</b> доля</span><span><b className="control">◆</b> контроль</span></div>
      <div className="atlas-3d-watermark">ECONOMIC CITY · PURPOSEFUL BUILDINGS · LIVE TRAFFIC</div>
    </div>
    <div className="map-key"><span><b className="dot"/> столица</span><span><b className="mount"/> районы и рельеф</span><span><b className="company-dot"/> предприятие · нажми</span><span><b className="water-dot"/> инфраструктура</span></div>
  </div>;
}
