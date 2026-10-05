import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
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

function terrainHeight(x: number, z: number) {
  const nx = x / W + 0.5;
  const nz = z / D + 0.5;
  const low = 0.18 + fbm(nx * 3.2, nz * 3.2) * 0.26;

  const central =
    ridge(x, z, -2.7, -1.6, 0.55, 10.5, 1.35, 5.2) +
    ridge(x, z, 1.3, -1.0, 0.46, 9.0, 1.1, 4.2) +
    ridge(x, z, 5.0, -0.2, 0.30, 7.5, 1.0, 3.3);

  const secondary =
    ridge(x, z, -6.5, 2.8, -0.12, 6.0, 1.4, 2.1) +
    ridge(x, z, 7.1, 2.2, 0.72, 7.0, 1.6, 2.0);

  const plateau = Math.exp(-(((x - 8.0) ** 2) / 42 + ((z + 0.5) ** 2) / 24)) * 1.6;
  const southernHills = Math.exp(-(((x + 2.0) ** 2) / 60 + ((z - 6.4) ** 2) / 18)) * 1.1;

  const riverValley =
    Math.exp(-((x + 0.4) ** 2) / 1.5 - ((z - 1.6) ** 2) / 100) * 1.1 +
    Math.exp(-((x - 5.0) ** 2) / 2.0 - ((z - 1.8) ** 2) / 70) * 0.8;

  const dryEast = clamp((x - 5) / 14, 0, 1);
  return clamp(low + central + secondary + plateau + southernHills - riverValley * 0.38 + dryEast * 0.08, 0.08, 8.7);
}

function worldFromGeo([u, v]: GeoPoint): THREE.Vector3 {
  return new THREE.Vector3((u - 50) * 0.32, 0, (v - 50) * 0.24);
}

function heightColor(h: number, x: number, z: number) {
  const t = clamp(h / 8.7, 0, 1);
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
  if (h > 6.8) color.lerp(new THREE.Color("#e7e4d8"), clamp((h - 6.8) / 1.9, 0, 1) * 0.84);
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

function makeTerrain() {
  const nx = 150, nz = 108;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let z = 0; z <= nz; z += 1) {
    for (let x = 0; x <= nx; x += 1) {
      const px = (x / nx - 0.5) * W;
      const pz = (z / nz - 0.5) * D;
      const edge = Math.min((x / nx) * 7, ((nx - x) / nx) * 7, (z / nz) * 7, ((nz - z) / nz) * 7);
      const land = isLand(x / nx * 100, z / nz * 100);
      const h = land ? Math.max(-0.08, terrainHeight(px, pz) * clamp(edge, 0, 1)) : -0.48;
      positions.push(px, h, pz);
      const c = heightColor(h, px, pz);
      colors.push(c.r, c.g, c.b);
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
    v.y = terrainHeight(v.x, v.z) + yOffset;
    return v;
  });
  points.push(points[0].clone());
  return points;
}

function makeRiver(points: GeoPoint[], width = 0.08) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => {
    const v = worldFromGeo(p);
    v.y = terrainHeight(v.x, v.z) + 0.045;
    return v;
  }));
  const geometry = new THREE.TubeGeometry(curve, 48, width, 6, false);
  const material = new THREE.MeshStandardMaterial({
    color: "#7bbbc8",
    roughness: 0.28,
    metalness: 0.05,
    emissive: "#163b43",
    emissiveIntensity: 0.12
  });
  return new THREE.Mesh(geometry, material);
}

function makeLake(points: GeoPoint[]) {
  const shape = new THREE.Shape();
  points.forEach(([u, v], i) => {
    const p = worldFromGeo([u, v]);
    if (i === 0) shape.moveTo(p.x, p.z);
    else shape.lineTo(p.x, p.z);
  });
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color: "#4d94aa",
    roughness: 0.18,
    metalness: 0.08,
    transparent: true,
    opacity: 0.88
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.07;
  return mesh;
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

function makeSnowCap(geo: GeoPoint, size: number) {
  const p = worldFromGeo(geo);
  const h = terrainHeight(p.x, p.z);
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
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const capitalRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const companyRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const host = hostRef.current;
    const overlay = overlayRef.current;
    if (!host || !overlay) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#062536");
    scene.fog = new THREE.Fog("#062536", 25, 48);

    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    const target = new THREE.Vector3(0, 0.5, 0);
    camera.position.set(0, 17.5, 17.5);
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

    const terrain = makeTerrain();
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
        selected === country.id ? 0xf4e5b7 : 0xcbd7ca,
        selected === country.id ? 0.95 : 0.68
      );
      line.userData.countryId = country.id;
      borderGroup.add(line);
    });
    scene.add(borderGroup);

    const riverSets: GeoPoint[][] = [
      [[47, 22], [46, 31], [47, 39], [45, 48], [44, 57], [46, 66], [45, 73], [43, 81]],
      [[40, 28], [42, 35], [41, 43], [39, 52], [37, 61], [35, 70]],
      [[54, 25], [53, 34], [55, 43], [58, 52], [63, 61], [67, 69]],
      [[63, 30], [61, 39], [60, 48], [63, 57], [68, 65]],
      [[73, 36], [69, 44], [66, 52], [64, 60]],
      [[31, 37], [34, 45], [37, 53], [41, 59]],
      [[51, 49], [50, 58], [52, 66], [55, 75]],
      [[70, 54], [73, 61], [77, 68], [79, 76]]
    ];
    riverSets.forEach((points, i) => scene.add(makeRiver(points, i === 0 ? 0.11 : 0.055)));

    scene.add(makeLake([[39, 59], [41, 57], [44, 58], [45, 60], [42, 62], [39, 61]]));
    scene.add(makeLake([[66, 61], [69, 59], [72, 60], [73, 63], [70, 65], [67, 64]]));
    scene.add(makeLake([[51, 76], [54, 75], [56, 77], [55, 79], [52, 79]]));

    scene.add(makeIsland(-12.1, -4.7, 1.0, 0.52));
    scene.add(makeIsland(13.8, 6.0, 0.72, 0.42));
    scene.add(makeIsland(-10.0, 8.0, 0.48, 0.31));

    [[47, 23], [53, 25], [61, 30], [40, 29]].forEach((p, i) => scene.add(makeSnowCap(p as GeoPoint, 0.6 + i * 0.05)));

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
        opacity: selected === country.id ? 0.20 : 0.035,
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
    let zoom = 1;
    let panX = 0;
    let panZ = 0;

    const updateCamera = () => {
      const distance = 24 / zoom;
      camera.position.set(panX, distance * 0.76, distance * 0.76 + panZ);
      target.set(panX, 0.25, panZ * 0.32);
      camera.lookAt(target);
    };

    const updateOverlay = () => {
      const rect = host.getBoundingClientRect();
      const project = (p: THREE.Vector3) => {
        const q = p.clone();
        q.y = terrainHeight(q.x, q.z) + 0.52;
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
          label.style.opacity = lp.z > 1 ? "0" : selected === country.id ? "1" : "0.78";
        }
        if (capital) {
          capital.style.transform = `translate3d(${cp.x}px,${cp.y}px,0) translate(-50%,-50%)`;
          capital.style.opacity = cp.z > 1 ? "0" : "1";
        }
      });

      if (showCompanies) {
        const selectedCountry = countries.find((c) => c.id === selected);
        selectedCountry?.companies.forEach((company) => {
          const marker = companyRefs.current[company.ticker];
          if (!marker) return;
          const p = project(worldFromGeo([company.x / 5, company.y / 3.5]));
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
      panX = clamp(panX - dx * 0.018 / zoom, -4.2, 4.2);
      panZ = clamp(panZ + dy * 0.015 / zoom, -3.2, 3.2);
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
      zoom = clamp(zoom * Math.exp(-event.deltaY * 0.001), 0.82, 1.75);
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
        if (country) onSelect(country.id);
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
  }, [countries, selected, onSelect, showCompanies]);

  const selectedCountry = countries.find((c) => c.id === selected);

  return (
    <div className="atlas atlas-3d">
      <div className="atlas-head"><span>АТЛАС · 3D PHYSICAL TERRAIN</span><span>СЕВЕР ↑ · DRAG / ZOOM</span></div>
      <div className="atlas-3d-viewport" ref={hostRef}>
        <div className="atlas-3d-overlay" ref={overlayRef}>
          {countries.map((country) => (
            <button
              key={country.id}
              ref={(el) => { labelRefs.current[country.id] = el; }}
              className={`atlas-country-label ${selected === country.id ? "selected" : ""}`}
              onClick={() => onSelect(country.id)}
              type="button"
            >
              <span className={`flag flag-${country.id}`}><i /></span>
              <span>{country.name.toUpperCase()}</span>
            </button>
          ))}
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
              className="atlas-company-marker"
              type="button"
              onClick={() => onCompany?.(company)}
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
        <span><b className="company-dot" /> компания · нажми</span>
      </div>
    </div>
  );
}
