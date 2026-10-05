import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { CompanyPreview, Country } from "./data/world";

type Atlas3DProps = {
  countries: Country[];
  selected: string;
  onSelect: (id: string) => void;
  showCompanies?: boolean;
  onCompany?: (company: CompanyPreview) => void;
};

type GeoPoint = [number, number];

const W = 32;
const D = 23;

const countryPolygons: Record<string, GeoPoint[]> = {
  lirania: [
    [12, 31], [14, 23], [22, 17], [31, 14], [40, 17],
    [39, 24], [37, 31], [39, 39], [35, 47], [38, 54], [36, 61],
    [30, 63], [27, 68], [22, 71], [18, 67], [15, 60], [12, 52],
    [14, 43], [12, 37]
  ],
  slavoriya: [
    [40, 17], [48, 14], [58, 18],
    [57, 27], [60, 35], [57, 43], [61, 50], [58, 57], [60, 64],
    [55, 61], [49, 64], [43, 60], [36, 61], [38, 54], [35, 47],
    [39, 39], [37, 31], [39, 24]
  ],
  darvast: [
    [58, 18], [68, 15], [77, 18], [86, 25], [91, 34], [92, 42],
    [89, 50], [85, 57], [82, 63], [84, 69], [80, 75], [73, 79],
    [66, 77], [60, 73], [60, 64], [58, 57], [61, 50], [57, 43],
    [60, 35], [57, 27]
  ],
  estraviya: [
    [36, 61], [43, 60], [49, 64], [55, 61], [60, 64], [60, 73],
    [56, 78], [51, 83], [45, 86], [39, 85], [33, 81], [29, 76],
    [27, 70], [30, 63]
  ],
  saverniya: [
    [60, 64], [66, 77], [73, 79], [80, 75], [84, 69], [87, 73],
    [88, 80], [84, 86], [78, 90], [70, 92], [63, 90], [56, 88],
    [51, 83], [56, 78], [60, 73]
  ]
};

const capitalGeo: Record<string, GeoPoint> = {
  slavoriya: [48, 42],
  lirania: [27, 43],
  darvast: [72, 43],
  estraviya: [45, 72],
  saverniya: [72, 80]
};

const labelGeo: Record<string, GeoPoint> = {
  slavoriya: [47, 37],
  lirania: [25, 43],
  darvast: [74, 42],
  estraviya: [43, 75],
  saverniya: [72, 84]
};


const cityEconomyProfile: Record<string,{sites:number;factories:number;highRises:number;trees:number;people:number;port:boolean;portBonus:number}> = {
  slavoriya:{sites:108,factories:20,highRises:18,trees:220,people:72,port:false,portBonus:0},
  lirania:{sites:102,factories:10,highRises:20,trees:205,people:68,port:true,portBonus:1},
  darvast:{sites:112,factories:27,highRises:9,trees:165,people:64,port:false,portBonus:0},
  estraviya:{sites:116,factories:12,highRises:30,trees:230,people:80,port:false,portBonus:0},
  saverniya:{sites:110,factories:11,highRises:14,trees:250,people:78,port:true,portBonus:1}
};
function coastalPoint(countryId:string): GeoPoint | null {
  const poly=countryPolygons[countryId];
  let best:GeoPoint|null=null,bestScore=Infinity;
  for(let v=10;v<=90;v+=1){for(let u=10;u<=90;u+=1){
    if(!pointInPolygon(u,v,poly)) continue;
    const edge=[pointInPolygon(u+1.6,v,poly),pointInPolygon(u-1.6,v,poly),pointInPolygon(u,v+1.6,poly),pointInPolygon(u,v-1.6,poly)].filter(Boolean).length;
    if(edge>2) continue;
    const d=Math.hypot(u-capitalGeo[countryId][0],v-capitalGeo[countryId][1]);
    if(d<bestScore){best=[u,v];bestScore=d;}
  }}
  return best;
}
function makePort(x:number,z:number,scale=1){
  const g=new THREE.Group();
  const quay=new THREE.Mesh(new THREE.BoxGeometry(.82*scale,.055,.22*scale),new THREE.MeshStandardMaterial({color:"#59676b",roughness:.9}));
  quay.position.y=.04; g.add(quay);
  for(let i=0;i<3;i++){
    const crane=new THREE.Group();
    const mast=new THREE.Mesh(new THREE.BoxGeometry(.018,.34*scale,.018),new THREE.MeshStandardMaterial({color:"#d1a25d",roughness:.75}));
    mast.position.set((-0.27+i*.27)*scale,.22,0); crane.add(mast);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.20*scale,.018,.018),new THREE.MeshStandardMaterial({color:"#d1a25d",roughness:.75}));
    arm.position.set((-0.18+i*.27)*scale,.38*scale,0); crane.add(arm); g.add(crane);
  }
  g.position.set(x,surfaceHeight(x,z)+.03,z); g.castShadow=true; return g;
}
function makeFactory(x:number,z:number,scale=1){
  const g=makeModernBuilding(x,z,scale,3);
  for(let i=0;i<2;i++){
    const chimney=new THREE.Mesh(new THREE.CylinderGeometry(.035*scale,.045*scale,.42*scale,8),new THREE.MeshStandardMaterial({color:"#566267",roughness:.85}));
    chimney.position.set((i-.5)*.22*scale,.28*scale,.10*scale); g.add(chimney);
  }
  return g;
}

const colorStops = [
  { h: 0.00, c: new THREE.Color("#496b48") },
  { h: 0.18, c: new THREE.Color("#69875a") },
  { h: 0.36, c: new THREE.Color("#8f9a68") },
  { h: 0.56, c: new THREE.Color("#6f745c") },
  { h: 0.73, c: new THREE.Color("#66645a") },
  { h: 0.88, c: new THREE.Color("#9b9a8b") },
  { h: 1.00, c: new THREE.Color("#e7e5d8") }
];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function hash(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, z: number) {
  const x0 = Math.floor(x), z0 = Math.floor(z);
  const fx = x - x0, fz = z - z0;
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = hash(x0, z0), b = hash(x0 + 1, z0);
  const c = hash(x0, z0 + 1), d = hash(x0 + 1, z0 + 1);
  return (a + (b - a) * sx) * (1 - sz) + (c + (d - c) * sx) * sz;
}

function fbm(x: number, z: number) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i += 1) {
    value += smoothNoise(x * freq, z * freq) * amp;
    freq *= 2;
    amp *= 0.5;
  }
  return value;
}

function ridge(x: number, z: number, cx: number, cz: number, angle: number, length: number, width: number, height: number) {
  const dx = x - cx;
  const dz = z - cz;
  const along = dx * Math.cos(angle) + dz * Math.sin(angle);
  const across = -dx * Math.sin(angle) + dz * Math.cos(angle);
  const a = Math.exp(-(along * along) / (length * length));
  const b = Math.exp(-(across * across) / (width * width));
  return a * b * height;
}

const SELECTED_RELIEF_SCALE = 0.34;

function surfaceHeight(x: number, z: number) {
  return terrainHeight(x, z) * SELECTED_RELIEF_SCALE;
}

function terrainHeight(x: number, z: number) {
  const nx = x / W + 0.5;
  const nz = z / D + 0.5;
  const low = 0.18 + fbm(nx * 3.2, nz * 3.2) * 0.26;

  const central =
    ridge(x, z, -2.7, -1.6, 0.55, 10.5, 1.35, 1.75) +
    ridge(x, z, 1.3, -1.0, 0.46, 9.0, 1.1, 0.82) +
    ridge(x, z, 5.0, -0.2, 0.30, 7.5, 1.0, 0.65);

  const secondary =
    ridge(x, z, -6.5, 2.8, -0.12, 6.0, 1.4, 0.9) +
    ridge(x, z, 7.1, 2.2, 0.72, 7.0, 1.6, 0.85);

  const plateau = Math.exp(-(((x - 8.0) ** 2) / 42 + ((z + 0.5) ** 2) / 24)) * 0.55;
  const southernHills = Math.exp(-(((x + 2.0) ** 2) / 60 + ((z - 6.4) ** 2) / 18)) * 0.55;

  const riverValley =
    Math.exp(-((x + 0.4) ** 2) / 1.5 - ((z - 1.6) ** 2) / 100) * 1.1 +
    Math.exp(-((x - 5.0) ** 2) / 2.0 - ((z - 1.8) ** 2) / 70) * 0.8;

  const dryEast = clamp((x - 5) / 14, 0, 1);
  return clamp(low + central + secondary + plateau + southernHills - riverValley * 0.38 + dryEast * 0.08, 0.08, 2.45);
}

function worldFromGeo([u, v]: GeoPoint): THREE.Vector3 {
  return new THREE.Vector3((u - 50) * 0.32, 0, (v - 50) * 0.24);
}

function heightColor(h: number, x: number, z: number) {
  const t = clamp(h / 2.45, 0, 1);
  let color = colorStops[colorStops.length - 1].c.clone();
  for (let i = 0; i < colorStops.length - 1; i += 1) {
    if (t >= colorStops[i].h && t <= colorStops[i + 1].h) {
      const span = colorStops[i + 1].h - colorStops[i].h;
      color = colorStops[i].c.clone().lerp(colorStops[i + 1].c, (t - colorStops[i].h) / span);
      break;
    }
  }

  const forest = Math.max(0, Math.sin(x * 0.52 + z * 0.31) * 0.5 + 0.5) * Math.max(0, 1 - Math.abs(z + 1) / 12);
  const dry = clamp((x - 3.0) / 11, 0, 1);
  if (h < 2.1 && forest > 0.62) color.lerp(new THREE.Color("#294f39"), 0.28);
  if (h < 1.7 && z > 2.2) color.lerp(new THREE.Color("#6e714d"), 0.20);
  if (dry > 0.4 && h < 2.8) color.lerp(new THREE.Color("#9a845d"), dry * 0.30);
  if (h > 1.85) color.lerp(new THREE.Color("#e7e4d8"), clamp((h - 1.85) / 0.6, 0, 1) * 0.24);
  return color;
}

function pointInPolygon(u: number, v: number, poly: GeoPoint[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    const hit = ((yi > v) !== (yj > v)) && (u < (xj - xi) * (v - yi) / ((yj - yi) || 1e-6) + xi);
    if (hit) inside = !inside;
  }
  return inside;
}

function isLand(u: number, v: number) {
  return Object.values(countryPolygons).some((poly) => pointInPolygon(u, v, poly));
}

function makeTerrain(selectedId?: string) {
  const nx = 150, nz = 108;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let z = 0; z <= nz; z += 1) {
    for (let x = 0; x <= nx; x += 1) {
      const px = (x / nx - 0.5) * W;
      const pz = (z / nz - 0.5) * D;
      const edge = Math.min((x / nx) * 7, ((nx - x) / nx) * 7, (z / nz) * 7, ((nz - z) / nz) * 7);
      const geoU=x / nx * 100, geoV=z / nz * 100;
      const land = isLand(geoU, geoV);
      const selectedLand = selectedId ? pointInPolygon(geoU, geoV, countryPolygons[selectedId]) : false;
      const rawHeight=terrainHeight(px,pz);
      const h=land ? Math.max(-0.03,(selectedLand ? rawHeight*0.34 : 0.08 + rawHeight*0.035) * clamp(edge,0,1)) : -0.48;
      positions.push(px,h,pz);
      const c=selectedLand ? heightColor(h,px,pz) : new THREE.Color("#68747a");
      if(land&&!selectedLand)c.lerp(new THREE.Color("#8b9495"),0.28);
      colors.push(c.r,c.g,c.b);
    }
  }

  for (let z = 0; z < nz; z += 1) {
    for (let x = 0; x < nx; x += 1) {
      const a = z * (nx + 1) + x;
      const b = a + 1;
      const c = a + nx + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
    flatShading: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function makeLine(points: THREE.Vector3[], color: number, opacity = 1, width = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  const line = new THREE.Line(geometry, material);
  line.userData.width = width;
  return line;
}

function polygonLine(poly: GeoPoint[], yOffset = 0.06) {
  const points = poly.map((p) => {
    const v = worldFromGeo(p);
    v.y = surfaceHeight(v.x, v.z) + yOffset;
    return v;
  });
  points.push(points[0].clone());
  return points;
}

function makeIsland(x: number, z: number, sx: number, sz: number) {
  const shape = new THREE.Shape();
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const r = 0.82 + Math.sin(i * 2.7) * 0.11;
    return [Math.cos(a) * sx * r, Math.sin(a) * sz * r] as [number, number];
  });
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach((p) => shape.lineTo(p[0], p[1]));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  geometry.rotateX(Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ color: "#6b805b", roughness: 0.94 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 0.02, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeTree(x: number, z: number, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * scale, 0.05 * scale, 0.28 * scale, 6), new THREE.MeshStandardMaterial({ color: "#5a4934", roughness: 1 }));
  trunk.position.y = 0.16 * scale;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.16 * scale, 0.42 * scale, 7), new THREE.MeshStandardMaterial({ color: "#315a3c", roughness: 0.96 }));
  crown.position.y = 0.43 * scale;
  group.add(trunk, crown);
  const h = surfaceHeight(x, z);
  group.position.set(x, h + 0.02, z);
  group.castShadow = true;
  return group;
}

function safeCompanyGeo(countryId: string, company: CompanyPreview): GeoPoint {
  const poly = countryPolygons[countryId];
  const center = capitalGeo[countryId];
  const seed = company.ticker.split("").reduce((n,ch,i)=>n + ch.charCodeAt(0) * (i + 3), countryId.length * 97);
  // Sample the whole country instead of pulling invalid coordinates back toward the capital.
  // This keeps company markers and their physical offices distributed across the map.
  for(let i=0;i<180;i++){
    const u=8+hash(seed*0.013+i*17.17, countryId.length*3.71+i*0.41)*84;
    const v=8+hash(seed*0.021+i*29.43, countryId.length*5.19+i*0.73)*84;
    const margin=pointInPolygon(u+.9,v,poly)&&pointInPolygon(u-.9,v,poly)&&pointInPolygon(u,v+.9,poly)&&pointInPolygon(u,v-.9,poly);
    const fromCapital=Math.hypot(u-center[0],v-center[1]);
    if(margin && fromCapital>4.5) return [u,v];
  }
  // Deterministic fallback: original data if it is valid, otherwise the capital vicinity.
  const original: GeoPoint = [company.x / 5, company.y / 3.5];
  if(pointInPolygon(original[0],original[1],poly)) return original;
  return [center[0]+2.2,center[1]+1.4];
}

function roadCurve(a: GeoPoint, b: GeoPoint, bend = 0.12) {
  const p1 = worldFromGeo(a), p2 = worldFromGeo(b);
  const dx = p2.x - p1.x, dz = p2.z - p1.z;
  const len = Math.max(0.1, Math.hypot(dx, dz));
  const nx = -dz / len, nz = dx / len;
  const mid = new THREE.Vector3(
    (p1.x + p2.x) / 2 + nx * bend * len,
    0,
    (p1.z + p2.z) / 2 + nz * bend * len
  );
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(p1.x, surfaceHeight(p1.x,p1.z)+0.078, p1.z),
    new THREE.Vector3(mid.x, surfaceHeight(mid.x,mid.z)+0.078, mid.z),
    new THREE.Vector3(p2.x, surfaceHeight(p2.x,p2.z)+0.078, p2.z)
  ]);
  return curve;
}
function inCountryRoad(countryId:string,a:GeoPoint,b:GeoPoint,bend=0): THREE.CatmullRomCurve3 {
  const poly=countryPolygons[countryId];
  const candidates=[bend,0,-bend*.7,bend*.45];
  for(const amount of candidates){
    const curve=roadCurve(a,b,amount);
    const samples=curve.getPoints(18);
    let ok=true;
    for(const p of samples){
      const u=p.x/0.32+50, v=p.z/0.24+50;
      if(!pointInPolygon(u,v,poly)){ok=false;break;}
    }
    if(ok)return curve;
  }
  return roadCurve(a,b,0);
}
function makeCar(curve: THREE.CatmullRomCurve3, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.13*scale,0.055*scale,0.24*scale),
    new THREE.MeshStandardMaterial({color:"#d8e3e6",roughness:.7})
  );
  body.position.y=.035*scale;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(.09*scale,.045*scale,.11*scale),
    new THREE.MeshStandardMaterial({color:"#486b78",roughness:.45,metalness:.15})
  );
  cabin.position.set(0,.075*scale,-.01*scale);
  group.add(body,cabin);
  group.userData.roadCurve=curve;
  group.userData.roadT=Math.random();
  return group;
}
function makeSidewalk(curve: THREE.CatmullRomCurve3, width = 0.055) {
  const samples=curve.getPoints(24), vertices:number[]=[], indices:number[]=[];
  samples.forEach((p,i)=>{
    const prev=samples[Math.max(0,i-1)], next=samples[Math.min(samples.length-1,i+1)];
    const dx=next.x-prev.x,dz=next.z-prev.z,len=Math.max(.001,Math.hypot(dx,dz));
    const nx=-dz/len,nz=dx/len;
    const lx=p.x+nx*width*1.9,lz=p.z+nz*width*1.9,rx=p.x-nx*width*1.9,rz=p.z-nz*width*1.9;
    vertices.push(lx,surfaceHeight(lx,lz)+.058,lz,rx,surfaceHeight(rx,rz)+.058,rz);
  });
  for(let i=0;i<samples.length-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:"#a6aaa0",roughness:.95,metalness:0,side:THREE.DoubleSide}));
  mesh.receiveShadow=true;
  return mesh;
}
function makePerson(x:number,z:number,scale=.45){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.025*scale,.032*scale,.11*scale,6),new THREE.MeshStandardMaterial({color:"#7f9eab",roughness:.9}));
  body.position.y=.09*scale;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.035*scale,7,6),new THREE.MeshStandardMaterial({color:"#caa58d",roughness:1}));
  head.position.y=.17*scale; g.add(body,head);
  g.position.set(x,surfaceHeight(x,z)+.04,z); g.castShadow=true; return g;
}
function makeParking(x:number,z:number,scale=.6){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.BoxGeometry(.46*scale,.018,.30*scale),new THREE.MeshStandardMaterial({color:"#4b5355",roughness:1}));
  base.position.y=.018; g.add(base);
  for(let i=0;i<3;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(.018,.006,.22*scale),new THREE.MeshStandardMaterial({color:"#d7d3bd",roughness:1}));line.position.set((-1+i)*.14*scale,.032,0);g.add(line);}
  g.position.set(x,surfaceHeight(x,z),z); return g;
}

function makeModernBuilding(x:number,z:number,scale=1,type=0) {
  const group=new THREE.Group();
  const tower=type%3===0;
  const industrial=type%4===3;
  const width=(industrial?.48:tower?.28:.34)*scale;
  const depth=(industrial?.36:tower?.28:.30)*scale;
  const height=(industrial?.26:tower?(0.62+(type%4)*.12):.32)*scale;
  const body=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),new THREE.MeshStandardMaterial({color:industrial?"#65777c":tower?"#6f8490":"#7e8f91",roughness:.7,metalness:industrial?.18:.06}));
  body.position.y=height/2;
  group.add(body);
  if(tower){
    const glass=new THREE.Mesh(new THREE.BoxGeometry(width*.72,height*.78,depth*.76),new THREE.MeshStandardMaterial({color:"#3f6773",roughness:.32,metalness:.18,emissive:"#0a2027",emissiveIntensity:.18,transparent:true,opacity:.88}));
    glass.position.y=height*.52; group.add(glass);
  } else {
    const roof=new THREE.Mesh(new THREE.BoxGeometry(width*1.05,.045*scale,depth*1.05),new THREE.MeshStandardMaterial({color:industrial?"#39494e":"#515d62",roughness:.8}));
    roof.position.y=height+.025*scale; group.add(roof);
  }
  if(industrial){
    for(let i=0;i<2;i++){
      const tank=new THREE.Mesh(new THREE.CylinderGeometry(.06*scale,.06*scale,.18*scale,10),new THREE.MeshStandardMaterial({color:"#9ba9a8",roughness:.65,metalness:.22}));
      tank.position.set((i-.5)*.17*scale,.15*scale,.18*scale); group.add(tank);
    }
  }
  group.position.set(x,surfaceHeight(x,z)+.025,z);
  group.castShadow=true; group.receiveShadow=true;
  return group;
}

function makeHighway(curve: THREE.CatmullRomCurve3, width = 0.24) {
  const group = new THREE.Group();
  const samples = curve.getPoints(32);
  const vertices:number[]=[];
  const uvs:number[]=[];
  const indices:number[]=[];
  samples.forEach((p,i)=>{
    const prev=samples[Math.max(0,i-1)], next=samples[Math.min(samples.length-1,i+1)];
    const dx=next.x-prev.x, dz=next.z-prev.z;
    const len=Math.max(.001,Math.hypot(dx,dz));
    const nx=-dz/len, nz=dx/len;
    const leftX=p.x+nx*width*.5, leftZ=p.z+nz*width*.5;
    const rightX=p.x-nx*width*.5, rightZ=p.z-nz*width*.5;
    const leftY=surfaceHeight(leftX,leftZ)+.035;
    const rightY=surfaceHeight(rightX,rightZ)+.035;
    vertices.push(leftX,leftY,leftZ,rightX,rightY,rightZ);
    uvs.push(0,i/(samples.length-1),1,i/(samples.length-1));
  });
  for(let i=0;i<samples.length-1;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const road=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:"#27353a",roughness:.92,metalness:.04,side:THREE.DoubleSide}));
  road.receiveShadow=true; road.castShadow=true; group.add(road);
  const lane=new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(samples.map(p=>{const q=p.clone();q.y=surfaceHeight(q.x,q.z)+.052;return q;})),
    new THREE.LineBasicMaterial({color:0xd9ded6,transparent:true,opacity:.82})
  );
  group.add(lane);
  return group;
}

function makeCityBuilding(x:number,z:number,scale=1,type=0) {
  const building=makeModernBuilding(x,z,scale,type);
  return building;
}

function makeSnowCap(geo: GeoPoint, size: number) {
  const p = worldFromGeo(geo);
  const h = surfaceHeight(p.x, p.z);
  const shape = new THREE.Shape();
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2;
    const r = size * (0.72 + 0.18 * Math.sin(i * 1.9));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.65;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geoMesh = new THREE.ShapeGeometry(shape);
  geoMesh.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ color: "#f2f1e7", roughness: 0.92 });
  const mesh = new THREE.Mesh(geoMesh, material);
  mesh.position.set(p.x, h + 0.06, p.z);
  return mesh;
}

export function Atlas3D({ countries, selected, onSelect, showCompanies = false, onCompany }: Atlas3DProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const capitalRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const companyRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onSelectRef = useRef(onSelect);
  const onCompanyRef = useRef(onCompany);
  onSelectRef.current = onSelect;
  onCompanyRef.current = onCompany;

  useEffect(() => {
    const host = hostRef.current;
    const overlay = overlayRef.current;
    if (!host || !overlay) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07131d");
    scene.fog = new THREE.Fog("#07131d", 32, 58);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    const selectedPoly = countryPolygons[selected];
    const centerGeo = selectedPoly.reduce((acc, p) => [acc[0] + p[0] / selectedPoly.length, acc[1] + p[1] / selectedPoly.length] as GeoPoint, [0, 0]);
    const centerWorld = worldFromGeo(centerGeo);
    const target = new THREE.Vector3(centerWorld.x, 0.5, centerWorld.z);
    camera.position.set(centerWorld.x, 20.5, centerWorld.z + 20.5);
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor("#062536");
    host.insertBefore(renderer.domElement, host.firstChild);
    renderer.domElement.className = "atlas-3d-canvas";

    const hemi = new THREE.HemisphereLight("#d9e7e1", "#162b2d", 1.35);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight("#fff3d8", 3.4);
    sun.position.set(-10, 18, -9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 55;
    sun.shadow.bias = -0.00015;
    scene.add(sun);

    const fill = new THREE.DirectionalLight("#86a8b1", 0.7);
    fill.position.set(14, 8, 12);
    scene.add(fill);

    const terrain = makeTerrain(selected);
    scene.add(terrain);

    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 58, 1, 1),
      new THREE.MeshStandardMaterial({ color: "#0a4055", roughness: 0.58, metalness: 0.12 })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.34;
    ocean.receiveShadow = true;
    scene.add(ocean);

    const shallows = new THREE.Mesh(
      new THREE.RingGeometry(12, 28, 96, 2),
      new THREE.MeshStandardMaterial({ color: "#22627a", roughness: 0.4, transparent: true, opacity: 0.24, side: THREE.DoubleSide })
    );
    shallows.rotation.x = -Math.PI / 2;
    shallows.position.y = -0.30;
    scene.add(shallows);

    const borderGroup = new THREE.Group();
    countries.forEach((country) => {
      const line = makeLine(
        polygonLine(countryPolygons[country.id]),
        selected === country.id ? 0xf4e5b7 : 0x9da8a8,
        selected === country.id ? 0.98 : 0.42
      );
      line.userData.countryId = country.id;
      borderGroup.add(line);
    });
    scene.add(borderGroup);

    // Rivers removed from the atlas overlay: the previous synthetic blue tubes read as floating lines.
    const selectedCountry = countries.find((c) => c.id === selected);
    if (selectedCountry) {
      const capital = capitalGeo[selectedCountry.id];
      const selectedPoly = countryPolygons[selectedCountry.id];
      const companyGeos = selectedCountry.companies.map(company => safeCompanyGeo(selectedCountry.id, company));
      const roadCurves: THREE.CatmullRomCurve3[] = [];
      const nodes:[GeoPoint,number][]=[capital,...companyGeos].map((geo,index)=>[geo,index]);
      const connected:number[]=[0], remaining:number[]=nodes.slice(1).map((_,i)=>i+1);
      while(remaining.length){
        let bestR=0,bestC=connected[0],bestD=Infinity;
        remaining.forEach(r=>{
          connected.forEach(cc=>{
            const dx=nodes[r][0][0]-nodes[cc][0][0], dz=nodes[r][0][1]-nodes[cc][0][1];
            const d=dx*dx+dz*dz;
            if(d<bestD){bestD=d;bestR=r;bestC=cc;}
          });
        });
        const bend=(hash(bestR*4.3, selectedCountry.id.length)-.5)*.18;
        const curve=inCountryRoad(selectedCountry.id,nodes[bestC][0],nodes[bestR][0],bend);
        if(curve){ roadCurves.push(curve); scene.add(makeHighway(curve,.23)); }
        connected.push(bestR); remaining.splice(remaining.indexOf(bestR),1);
      }
      companyGeos.forEach((geo,index)=>{
        const p=worldFromGeo(geo);
        scene.add(makeTree(p.x+.28,p.z+.18,.55+(index%3)*.08));
        scene.add(makeTree(p.x-.22,p.z+.26,.45+(index%2)*.1));
        scene.add(makeModernBuilding(p.x+.34,p.z-.18,.85+(index%3)*.10,index));
        scene.add(makeModernBuilding(p.x-.38,p.z+.12,.68+(index%2)*.12,index+1));
        scene.add(makeModernBuilding(p.x+.02,p.z-.48,.62,index+2));
      });
      // Dense modern city fabric: fill quiet parts of the selected country with small, varied districts.
      const citySites:GeoPoint[]=[];
      const cityProfile=cityEconomyProfile[selectedCountry.id]??cityEconomyProfile.saverniya;
      for(let i=0;i<520&&citySites.length<cityProfile.sites;i++){
        const u=16+hash(i*2.41,selectedCountry.id.length*5.7)*74;
        const v=16+hash(i*3.17+9,selectedCountry.id.length*7.1)*74;
        const inside=pointInPolygon(u,v,selectedPoly);
        const margin=pointInPolygon(u+.9,v,selectedPoly)&&pointInPolygon(u-.9,v,selectedPoly)&&pointInPolygon(u,v+.9,selectedPoly)&&pointInPolygon(u,v-.9,selectedPoly);
        const spaced=citySites.every(([su,sv])=>Math.hypot(u-su,v-sv)>2.15);
        if(inside&&margin&&spaced){
          citySites.push([u,v]);
          const p=worldFromGeo([u,v]);
          const type=citySites.length%7;
          const scale=.32+hash(i*4.2,selectedCountry.id.length)*.42;
          scene.add(makeCityBuilding(p.x,p.z,scale,type));
          if(citySites.length%3===0) scene.add(makeTree(p.x+.24,p.z-.16,.35+scale*.18));
          if(citySites.length<=cityProfile.highRises && citySites.length%2===0) scene.add(makeModernBuilding(p.x+.18,p.z-.16,0.78+(citySites.length%4)*.08,0));
          if(citySites.length<=cityProfile.factories && citySites.length%2===1) scene.add(makeFactory(p.x-.16,p.z+.14,0.72+(citySites.length%3)*.10));
        }
      }
      // Local streets: connect nearby districts instead of drawing arbitrary long diagonals.
      const localPairs=new Set<string>();
      for(let i=0;i<citySites.length;i++){
        const nearest=citySites.map((q,j)=>({j,d:j===i?Infinity:Math.hypot(q[0]-citySites[i][0],q[1]-citySites[i][1])}))
          .sort((a,b)=>a.d-b.d).slice(0,2);
        nearest.forEach(({j})=>{
          const key=i<j?i+"-"+j:j+"-"+i;
          if(localPairs.has(key)) return;
          localPairs.add(key);
          const curve=inCountryRoad(selectedCountry.id,citySites[i],citySites[j],(hash(i*7.1,j*3.3)-.5)*.055);
          scene.add(makeHighway(curve,.095));
          scene.add(makeSidewalk(curve,.022));
          roadCurves.push(curve);
        });
      }
      for(let i=0;i<cityProfile.trees;i++){
        const u=10+hash(i*2.17,selectedCountry.id.length*3.1+i*.11)*80;
        const v=10+hash(i*3.43+41,selectedCountry.id.length*2.2+i*.17)*80;
        if(pointInPolygon(u,v,selectedPoly)){
          const p=worldFromGeo([u,v]);
          scene.add(makeTree(p.x,p.z,.34+hash(i*1.7,4)*.34));
        }
      }
      }
      if(cityProfile.port){ const coast=coastalPoint(selectedCountry.id); if(coast){ const pp=worldFromGeo(coast); scene.add(makePort(pp.x,pp.z,1.15)); } }
      for(let i=0;i<Math.min(24,roadCurves.length);i++){
        const car=makeCar(roadCurves[i],.72+(i%4)*.10);
        car.userData.roadT=(i*0.071)%1;
        scene.add(car);
      }
      // Pedestrians and parking clusters stay close to built-up districts.
      citySites.slice(0,Math.min(cityProfile.people,citySites.length)).forEach((geo,i)=>{
        const p=worldFromGeo(geo);
        if(i%4===0) scene.add(makeParking(p.x+.34,p.z+.22,.75));
        scene.add(makePerson(p.x-.18,p.z+.20,.8+(i%3)*.12));
        if(i%5===0) scene.add(makePerson(p.x+.16,p.z-.08,.62));
      });
      const capitalPoint = worldFromGeo(capital);
      scene.add(makeModernBuilding(capitalPoint.x+.42,capitalPoint.z+.22,1.45,0));
      scene.add(makeModernBuilding(capitalPoint.x-.46,capitalPoint.z-.18,1.65,1));
      scene.add(makeModernBuilding(capitalPoint.x+.02,capitalPoint.z-.52,1.25,3));
    } else {
      countries.forEach((country) => {
        const poly = countryPolygons[country.id];
        for (let i = 0; i < 18; i += 1) {
          const u = 18 + hash(i * 1.91 + country.id.length, i * 2.13) * 70;
          const v = 18 + hash(i * 2.71, country.id.length * 4.1) * 70;
          if (pointInPolygon(u, v, poly)) {
            const p = worldFromGeo([u, v]);
            scene.add(makeTree(p.x, p.z, 0.3 + hash(i, country.id.length) * 0.2));
          }
        }
      });
    }


    const islandGeo: GeoPoint[] = [[91,76],[94,70],[9,58],[88,17]];
    islandGeo.forEach((geo,index)=>{
      const p=worldFromGeo(geo);
      const island=new THREE.Mesh(
        new THREE.CylinderGeometry(.34-(index%2)*.08,.48-(index%2)*.08,.10,10),
        new THREE.MeshStandardMaterial({color:"#667b61",roughness:1})
      );
      island.position.set(p.x,.02,p.z);
      island.scale.z=.72;
      island.castShadow=true;
      island.receiveShadow=true;
      scene.add(island);
      const tree=makeTree(p.x+.08,p.z-.04,.55);
      scene.add(tree);
    });

    const selectedMeshes: THREE.Mesh[] = [];
    countries.forEach((country) => {
      const poly = countryPolygons[country.id];
      const shape = new THREE.Shape();
      poly.forEach(([u, v], i) => {
        const p = worldFromGeo([u, v]);
        if (i === 0) shape.moveTo(p.x, p.z);
        else shape.lineTo(p.x, p.z);
      });
      shape.closePath();
      const geometry = new THREE.ShapeGeometry(shape);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(country.color),
        transparent: true,
        opacity: selected === country.id ? 0.28 : 0,
        roughness: 1,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.08;
      mesh.userData.countryId = country.id;
      selectedMeshes.push(mesh);
      scene.add(mesh);
    });

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const countryMeshes = selectedMeshes;
    let hoveredCountry = "";
    let drag = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    let zoom = 1.22;
    let panX = 0;
    let panZ = 0;

    const updateCamera = () => {
      const distance = 23 / zoom;
      camera.position.set(centerWorld.x + panX, distance * 0.62, centerWorld.z + distance * 0.78 + panZ);
      target.set(centerWorld.x + panX * 0.55, 0.15, centerWorld.z + panZ * 0.42);
      camera.lookAt(target);
    };

    const updateOverlay = () => {
      const rect = host.getBoundingClientRect();
      const project = (p: THREE.Vector3) => {
        const q = p.clone();
        q.y = surfaceHeight(q.x, q.z) + 0.52;
        q.project(camera);
        return { x: (q.x * 0.5 + 0.5) * rect.width, y: (-q.y * 0.5 + 0.5) * rect.height, z: q.z };
      };

      countries.forEach((country) => {
        const label = labelRefs.current[country.id];
        const capital = capitalRefs.current[country.id];
        const lp = project(worldFromGeo(labelGeo[country.id]));
        const cp = project(worldFromGeo(capitalGeo[country.id]));
        if (label) {
          label.style.transform = `translate3d(${lp.x}px,${lp.y}px,0) translate(-50%,-50%)`;
          label.style.opacity = lp.z > 1 ? "0" : selected === country.id ? "1" : "0.62";
        }
        if (capital) {
          capital.style.transform = `translate3d(${cp.x}px,${cp.y}px,0) translate(-50%,-50%)`;
          capital.style.opacity = cp.z > 1 && country.id === selected ? "0" : country.id === selected ? "1" : "0";
        }
      });

      if (showCompanies) {
        const selectedCountry = countries.find((c) => c.id === selected);
        selectedCountry?.companies.forEach((company) => {
          const marker = companyRefs.current[company.ticker];
          if (!marker) return;
          const p = project(worldFromGeo(safeCompanyGeo(selected, company)));
          marker.style.transform = `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%)`;
          marker.style.opacity = p.z > 1 ? "0" : "1";
        });
      }
    };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      updateOverlay();
    };

    const pointerDown = (event: PointerEvent) => {
      drag = true;
      moved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (!drag) {
        const hits = raycaster.intersectObject(terrain, false);
        let nextHover = "";
        if (hits.length) {
          const p = hits[0].point;
          const u = p.x / 0.32 + 50;
          const v = p.z / 0.24 + 50;
          const hitCountry = countries.find((c) => pointInPolygon(u, v, countryPolygons[c.id]));
          nextHover = hitCountry?.id ?? "";
        }
        if (nextHover !== hoveredCountry) {
          hoveredCountry = nextHover;
          countryMeshes.forEach((mesh) => {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.opacity = mesh.userData.countryId === selected ? 0.20 : mesh.userData.countryId === hoveredCountry ? 0.15 : 0.035;
          });
          countries.forEach((country) => {
            const label = labelRefs.current[country.id];
            label?.classList.toggle("hovered", country.id === hoveredCountry);
          });
        }
        renderer.domElement.style.cursor = hoveredCountry ? "pointer" : "grab";
        return;
      }
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      panX = clamp(panX - dx * 0.018 / zoom, -2.8, 2.8);
      panZ = clamp(panZ + dy * 0.015 / zoom, -2.2, 2.2);
      lastX = event.clientX;
      lastY = event.clientY;
      updateCamera();
      updateOverlay();
    };
    const pointerUp = (event: PointerEvent) => {
      drag = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      zoom = clamp(zoom * Math.exp(-event.deltaY * 0.001), 0.82, 1.55);
      updateCamera();
      updateOverlay();
    };
    const click = (event: MouseEvent) => {
      if (moved) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(terrain, false);
      if (hits.length) {
        const p = hits[0].point;
        const u = p.x / 0.32 + 50;
        const v = p.z / 0.24 + 50;
        const inside = (poly: GeoPoint[]) => {
          let hit = false;
          for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
            const cross = ((yi > v) !== (yj > v)) && (u < (xj - xi) * (v - yi) / ((yj - yi) || 1e-6) + xi);
            if (cross) hit = !hit;
          }
          return hit;
        };
        const country = countries.find((c) => inside(countryPolygons[c.id]));
        if (country) onSelectRef.current(country.id);
      }
    };

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    renderer.domElement.addEventListener("click", click);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    updateCamera();

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      scene.traverse((obj)=>{
        const curve=obj.userData.roadCurve as THREE.CatmullRomCurve3|undefined;
        if(curve){
          obj.userData.roadT=(obj.userData.roadT+0.0009)%1;
          const p=curve.getPointAt(obj.userData.roadT);
          const ahead=curve.getPointAt((obj.userData.roadT+0.01)%1);
          obj.position.set(p.x,terrainHeight(p.x,p.z)+.11,p.z);
          obj.lookAt(ahead.x,terrainHeight(ahead.x,ahead.z)+.11,ahead.z);
        }
      });
      updateOverlay();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);
      renderer.domElement.removeEventListener("click", click);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else if (material) material.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [countries, selected, showCompanies]);

  const selectedCountry = countries.find((c) => c.id === selected);

  return (
    <div className="atlas atlas-3d">
      <div className="atlas-head"><span>АТЛАС · 3D PHYSICAL TERRAIN</span><span>СЕВЕР ↑ · DRAG / ZOOM</span></div>
      <div className="atlas-3d-viewport" ref={hostRef}>
        <div className="atlas-3d-overlay" ref={overlayRef}>
          {null}
          {countries.map((country) => (
            <button
              key={country.id}
              ref={(el) => { capitalRefs.current[country.id] = el; }}
              className={`atlas-capital-marker ${selected === country.id ? "selected" : ""}`}
              onClick={() => onSelect(country.id)}
              type="button"
            >
              <i /><span>{country.capital}</span>
            </button>
          ))}
          {showCompanies && selectedCountry?.companies.map((company) => (
            <button
              key={company.ticker}
              ref={(el) => { companyRefs.current[company.ticker] = el; }}
              className="atlas-company-marker premium-company-marker"
              type="button"
              onClick={() => onCompanyRef.current?.(company)}
            >
              <b>{company.ticker}</b>
            </button>
          ))}
        </div>
        <div className="atlas-3d-watermark">WEBGL · TERRAIN MESH · REAL SHADOWS</div>
      </div>
      <div className="map-key">
        <span><b className="dot" /> столица</span>
        <span><b className="mount" /> физический рельеф</span>
        <span><b className="company-dot" /> компания · нажми</span><span><b className="water-dot" /> вода</span>
      </div>
    </div>
  );
}
