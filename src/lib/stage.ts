import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/** Everything scroll can drive. Camera pose plus effect levels (0..1). */
export type SceneState = {
  cx: number; cy: number; cz: number;
  tx: number; ty: number; tz: number;
  orbit: number; school: number; commute: number; scan: number; dim: number; cloud: number; morph: number;
  narrow: number; focus: number; arc: number; wire: number; pin: number;
};

const INK = new THREE.Color("#0a0a09");
const YELLOW = new THREE.Color("#ffd400");
// London at dusk: brick, stucco, Notting Hill pastels, slate and tile roofs, glass towers.
const WALLS = ["#8a4636", "#9b5a42", "#6e3b30", "#b9a88a", "#e3dccb", "#d9a3a0", "#9dc7b4", "#a7bfdc", "#bba7cf", "#e8cf9a", "#7f6a58"];
const ROOFS = ["#47505c", "#3c424b", "#8e4b37", "#5a5f66"];
const GLASS = ["#5f7891", "#7590a8", "#8b929a", "#4d6278"];
const FLATS = ["#8a7f72", "#a39a8c", "#6f6a66", "#9b6a52", "#c9c2b4", "#7c5444"];
const FOG = 0.0017;
const CAR_COLOURS = ["#e9e5dc", "#2f5d9a", "#9aa0a6", "#2f5a44", "#a8352e", "#d8b23a"];
const HOUSE_SOLID = new THREE.Color("#35332d");

// The Thames, as a centreline z = f(x).
export const riverZ = (x: number) => 6 * Math.sin(x * 0.085 + 0.6) + 2.6 * Math.sin(x * 0.21) - 1.5;
const RIVER_HALF = 3.4;

const SHARD = new THREE.Vector3(13, 0, -9);
const EYE_X = -19.5;
const EYE_R = 6;
const SCHOOL = new THREE.Vector3(-1, 0, 9.5);
const PARK = new THREE.Vector3(-24, 0, -16);
const STPAULS = new THREE.Vector3(5.55, 0, -22.5);
// Our own tower, on the riverfront at the edge of the City: three glass tiers stepping back as they rise.
const HQ = new THREE.Vector3(16.65, 0, -4.5);
const HQ_TIERS = [[2.8, 14], [2.2, 17.5], [1.6, 20]];
// Bridge decks span the river; smooth ramps carry the road back down to street level.
const DECK_HALF = RIVER_HALF + 0.9;
const DECK_Y = 0.44;
const RAMP = 2.6;
export const deckY = (d: number) => {
  const t = Math.min(Math.max((d - DECK_HALF) / RAMP, 0), 1);
  return DECK_Y * (1 - t * t * (3 - 2 * t));
};
// Westminster: Parliament runs along the north bank, Big Ben at the foot of Westminster Bridge (x = -11.1).
const PARLIAMENT_X = [-9.7, -2.6];
/** The Serpentine, as an ellipse inside Hyde Park. */
const inLake = (x: number, z: number) => Math.hypot((x + 23.5) * 0.33, (z + 15) * 1.4) < 1;
const STATION = new THREE.Vector3(24, 0, 12);

const COLORSPACE = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

// Daytime sky: shared by the dome, the river and every glass surface that reflects it.
const SKY = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uHaze;
  float h21(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  vec3 skyCol(vec3 d) {
    float h = d.y;
    vec3 col = mix(uHaze, vec3(0.38, 0.62, 0.93), smoothstep(0.0, 0.06, h));
    col = mix(col, vec3(0.09, 0.3, 0.74), smoothstep(0.06, 0.75, h));
    float s = max(dot(d, uSunDir), 0.0);
    col += vec3(1.0, 0.95, 0.85) * (pow(s, 24.0) * 0.18 + smoothstep(0.9995, 0.9998, s) * 0.5);
    return h < 0.0 ? uHaze : col;
  }
`;

const houseVert = /* glsl */ `
  attribute vec3 aRand;
  attribute vec3 aColor;
  attribute vec3 aRoof;
  attribute float aKind;
  attribute float aPart;
  varying vec3 vColor;
  varying vec3 vRoof;
  varying float vKind;
  varying float vLocalY;
  varying float vSeed;
  varying float vPart;
  uniform float uNarrow;
  uniform float uQuery;
  uniform float uClear;
  uniform vec3 uFocusPos;
  varying vec3 vN;
  varying vec3 vW;
  varying float vMatch;
  void main() {
    mat4 im = instanceMatrix;
    vec4 wp = modelMatrix * im * vec4(position, 1.0);
    // Neighbours sink into the ground so the examined home stands alone.
    vec3 origin = (modelMatrix * im * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    wp.y *= 1.0 - uClear * (1.0 - smoothstep(3.0, 6.5, length(origin.xz - uFocusPos.xz)));
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix * im) * normal);
    float r = uQuery < 0.5 ? aRand.x : (uQuery < 1.5 ? aRand.y : aRand.z);
    vMatch = step(r, mix(0.055, 0.012, uNarrow));
    vColor = aColor; vRoof = aRoof; vKind = aKind; vLocalY = position.y; vPart = aPart;
    vSeed = fract(sin(dot(origin.xz, vec2(12.9898, 78.233))) * 43758.5453);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const houseFrag = /* glsl */ `
  ${SKY}
  varying vec3 vColor;
  varying vec3 vRoof;
  varying float vKind;
  varying float vLocalY;
  varying float vSeed;
  varying float vPart;
  uniform vec3 uYellow;
  uniform float uScanX;
  uniform float uBeamX;
  uniform float uScan;
  uniform float uDim;
  uniform float uFocus;
  uniform float uFog;
  uniform vec3 uFocusPos;
  varying vec3 vN;
  varying vec3 vW;
  varying float vMatch;
  // 1 inside rect r (xy min, zw max) of cell-space p, softened by the pixel footprint w so facades don't shimmer.
  float rect(vec2 p, vec2 w, vec4 r) {
    vec2 a = smoothstep(r.xy - w, r.xy + w, p) * (1.0 - smoothstep(r.zw - w, r.zw + w, p));
    return a.x * a.y;
  }
  void main() {
    vec3 n = normalize(vN);
    float diff = max(dot(n, uSunDir), 0.0);
    float side = 1.0 - step(0.5, abs(n.y));
    float facesZ = step(abs(n.x), 0.5);
    float u = mix(vW.z, vW.x, facesZ);
    vec3 V = normalize(vW - cameraPosition);
    float dist = length(vW - cameraPosition);
    // Every building weathers a little differently.
    float tone = 0.86 + 0.26 * h21(vec2(vSeed * 91.0, 3.0));
    vec3 base = (vPart > 0.5 ? vRoof : vColor) * tone;
    vec2 g; float frame = 0.0, slab = 0.0, pane = 0.0, spandrel = 0.0;
    vec3 trim = vec3(0.9, 0.88, 0.83);
    if (vKind < 0.5) {
      // Terraced house: two storeys of sash windows and a front door on the street faces, none on party walls.
      g = vec2(u / 0.46, vLocalY * 2.0);
      vec2 f = fract(g), w = fwidth(g);
      float on = facesZ * side * step(vPart, 0.5) * step(vLocalY, 0.999);
      float doorBay = on * step(g.y, 1.0) * step(mod(floor(g.x) + floor(vSeed * 7.0), 3.0), 0.5);
      frame = on * rect(f, w, vec4(0.2, 0.22, 0.8, 0.86)) * (1.0 - doorBay);
      pane = on * rect(f, w, vec4(0.27, 0.28, 0.73, 0.8)) * (1.0 - doorBay);
      float door = doorBay * rect(f, w, vec4(0.3, 0.0, 0.7, 0.84));
      float pick = h21(floor(g) + vSeed * 13.0);
      vec3 doorCol = pick < 0.25 ? vec3(0.05) : pick < 0.45 ? vec3(0.45, 0.08, 0.07) : pick < 0.65 ? vec3(0.08, 0.14, 0.3) : pick < 0.85 ? vec3(0.1, 0.25, 0.16) : vec3(0.85, 0.66, 0.15);
      // Brick courses and roof tiles, only where they're big enough to resolve.
      float course = fract(vW.y * 26.0);
      float fine = 1.0 - smoothstep(0.25, 0.6, fwidth(vW.y * 26.0));
      base *= 1.0 - 0.12 * fine * (1.0 - smoothstep(0.0, 0.14, course)) * step(vPart, 0.5) * side;
      base *= 1.0 - 0.18 * fine * (1.0 - smoothstep(0.0, 0.22, course)) * step(0.5, vPart);
      base = mix(base, trim, on * smoothstep(0.91, 0.93, vLocalY)); // cornice
      base = mix(base, doorCol, door);
    } else if (vKind < 1.5) {
      // Glass tower: vision glass between slim mullions, an opaque spandrel at every slab.
      g = vec2(u / 0.22, vW.y * 2.2);
      vec2 f = fract(g), w = fwidth(g);
      pane = side * rect(f, w, vec4(0.05, 0.22, 0.95, 1.0));
      spandrel = side * rect(f, w, vec4(0.05, 0.0, 0.95, 0.18));
      base = mix(vec3(0.4, 0.43, 0.47), base, 0.25);
    } else {
      // Apartment block: a balcony slab on every floor.
      g = vec2(u / 0.36, vW.y / 0.42);
      slab = side * (1.0 - smoothstep(0.1 - fwidth(g.y), 0.1 + fwidth(g.y), fract(g.y)));
      pane = side * rect(fract(g), fwidth(g), vec4(0.2, 0.3, 0.8, 0.86));
    }
    float detail = 1.0 - smoothstep(0.18, 0.45, max(fwidth(g).x, fwidth(g).y));
    base = mix(base, trim, frame * detail);
    base = mix(base, base * 1.3 + 0.06, slab * detail);
    // Sun as key light, sky as fill from above, a contact shadow where walls meet the pavement.
    vec3 col = base * (0.42 + 0.62 * diff + 0.18 * (0.5 + 0.5 * n.y));
    col *= mix(0.62, 1.0, smoothstep(0.0, 0.35, vW.y));
    if (vKind > 0.5 && side < 0.5) col *= 0.5;
    float fres = pow(1.0 - max(dot(-V, n), 0.0), 3.0);
    vec3 refl = skyCol(reflect(V, n));
    vec3 glass;
    if (vKind > 0.5 && vKind < 1.5) {
      // Curtain-wall panels never sit perfectly flat, so each one catches the sky a little differently.
      float wob = 0.82 + 0.36 * h21(floor(g) + vSeed * 31.0);
      // Low floors mirror the street and the buildings opposite; high floors mirror open sky.
      float above = smoothstep(0.0, 16.0, vW.y);
      glass = mix(vColor * 0.32, refl * wob * mix(vec3(0.3, 0.33, 0.37), vec3(0.6, 0.68, 0.78), above), 0.45 + 0.45 * fres);
      col = mix(col, vColor * 0.45 * (0.6 + 0.4 * diff), spandrel * detail);
    } else {
      float blind = step(0.7, h21(floor(g) + vSeed * 57.0));
      glass = mix(vec3(0.04, 0.05, 0.07), refl, 0.3 + 0.55 * fres);
      glass = mix(glass, vec3(0.62, 0.6, 0.55), blind * 0.45); // net curtains and blinds
    }
    col = mix(col, glass, pane * detail);
    col = mix(col, col * 0.85 + refl * 0.08, (1.0 - detail) * side);
    // Homes the beam has already passed keep their verdict.
    float keep = (1.0 - smoothstep(1.4, 2.6, length(vW.xz - uFocusPos.xz))) * uFocus;
    col *= 1.0 - uDim * (1.0 - keep) * 0.78;
    float passed = smoothstep(0.0, 1.5, uScanX - vW.x);
    float m = vMatch * passed;
    col = mix(col, uYellow * (0.6 + 0.35 * diff), m);
    float band = exp(-abs(vW.x - uBeamX) * 2.5) * uScan * step(abs(vW.z), 48.0);
    col += uYellow * band * 0.22;
    float fd = dist * uFog;
    col = mix(col, uHaze, 1.0 - exp(-fd * fd));
    gl_FragColor = vec4(col, 1.0);
    ${COLORSPACE}
  }
`;

const skyFrag = /* glsl */ `
  ${SKY}
  uniform float uTime;
  varying vec3 vW;
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  void main() {
    vec3 d = normalize(vW - cameraPosition);
    vec3 col = skyCol(d);
    vec2 uv = d.xz / (d.y + 0.1) * 1.1 + vec2(uTime * 0.008, uTime * 0.003);
    float cover = fbm(uv);
    float c = smoothstep(0.56, 0.8, cover) * smoothstep(0.0, 0.03, d.y);
    // Cumulus: bright tops, soft blue-grey bellies.
    float lightSide = smoothstep(-0.15, 0.25, cover - fbm(uv + uSunDir.xz * 0.12));
    vec3 cloud = mix(vec3(0.7, 0.75, 0.83), vec3(0.95, 0.96, 0.97), lightSide);
    col = mix(col, cloud, c * 0.92);
    gl_FragColor = vec4(col, 1.0);
    ${COLORSPACE}
  }
`;

const columnVert = /* glsl */ `
  attribute vec3 aRand;
  uniform float uNarrow;
  uniform float uQuery;
  uniform float uScanX;
  uniform float uTime;
  varying float vA;
  varying float vY;
  void main() {
    mat4 im = instanceMatrix;
    vec3 base = (modelMatrix * im * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float r = uQuery < 0.5 ? aRand.x : (uQuery < 1.5 ? aRand.y : aRand.z);
    float match = step(r, mix(0.055, 0.012, uNarrow));
    float grow = match * smoothstep(0.0, 6.0, uScanX - base.x);
    float h = grow * (3.0 + 5.0 * fract(aRand.x * 91.7 + aRand.z * 13.1));
    vec3 p = position;
    p.y = p.y * h;
    vY = position.y;
    vA = grow * (0.75 + 0.25 * sin(uTime * 2.0 + aRand.y * 40.0));
    gl_Position = projectionMatrix * viewMatrix * vec4(base + vec3(p.x, p.y, p.z), 1.0);
  }
`;

const columnFrag = /* glsl */ `
  uniform vec3 uYellow;
  uniform float uFade;
  varying float vA;
  varying float vY;
  void main() {
    float a = vA * (1.0 - vY) * uFade * 0.45;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uYellow * a, a);
    ${COLORSPACE}
  }
`;

const groundFrag = /* glsl */ `
  ${SKY}
  uniform vec3 uYellow;
  uniform float uTime;
  uniform vec3 uPark;
  uniform float uBeamX;
  uniform float uScan;
  uniform float uDim;
  uniform float uFog;
  varying vec3 vW;
  float riverZ(float x) { return 6.0 * sin(x * 0.085 + 0.6) + 2.6 * sin(x * 0.21) - 1.5; }
  float aa(float d, float w) { return 1.0 - smoothstep(w - fwidth(d), w + fwidth(d), d); }
  void main() {
    vec2 p = vW.xz;
    vec3 col = vec3(0.24, 0.235, 0.22);
    // Streets run every 9 units north-south of the river grid and every 11.1 units east-west.
    float rz = abs(mod(p.y + 4.5, 9.0) - 4.5);
    float rx = abs(mod(p.x + 5.55, 11.1) - 5.55);
    float road = max(aa(rz, 0.95), aa(rx, 0.85));
    col = mix(col, vec3(0.1, 0.1, 0.105), road);
    float dashZ = aa(rz, 0.035) * step(0.5, fract(p.x * 0.7)) * (1.0 - aa(rx, 0.85));
    float dashX = aa(rx, 0.035) * step(0.5, fract(p.y * 0.7)) * (1.0 - aa(rz, 0.95));
    col += vec3(0.6, 0.58, 0.52) * max(dashZ, dashX);
    float kerb = max(aa(abs(rz - 0.95), 0.03), aa(abs(rx - 0.85), 0.03));
    col += vec3(0.05) * kerb;
    float park = 1.0 - smoothstep(5.6, 6.0, length((p - vec2(-24.0, -16.0)) * vec2(1.0, 1.15)));
    col = mix(col, uPark, park);
    // The Serpentine, rippling a little in the breeze.
    float lake = 1.0 - smoothstep(0.92, 1.0, length((p - vec2(-23.5, -15.0)) * vec2(0.33, 1.4)));
    col = mix(col, vec3(0.2, 0.34, 0.42) + 0.04 * noise(p * 3.0 + uTime * 0.4), lake);
    float side = p.y - riverZ(p.x);
    float rd = abs(side);
    float river = 1.0 - smoothstep(3.25, 3.4, rd);
    if (river > 0.0) {
      // The Thames flows east: two layers of ripples drift downstream, faster mid-channel than at the banks.
      float flow = uTime * (0.9 - 0.06 * rd);
      vec2 q = vec2(p.x * 0.75 - flow * 0.6, side * 1.1);
      vec2 e = vec2(0.04, 0.0);
      #define WAVE(v) (noise(v * 2.0) + 0.45 * noise(v * 4.7 + vec2(-uTime * 0.5, uTime * 0.25)) + 0.1 * noise(v * 11.0 - uTime * 0.8))
      float h0 = WAVE(q);
      vec3 wn = normalize(vec3(-(WAVE(q + e.xy) - h0) * 0.45, 1.0, -(WAVE(q + e.yx) - h0) * 0.45));
      vec3 V = normalize(vW - cameraPosition);
      vec3 R = reflect(V, wn);
      R.y = abs(R.y);
      float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-V, wn), 0.0), 5.0);
      vec3 water = mix(vec3(0.08, 0.19, 0.24), skyCol(R) * 0.8, 0.2 + 0.65 * fres);
      water += vec3(1.0, 0.96, 0.88) * pow(max(dot(R, uSunDir), 0.0), 240.0) * 0.6;
      // Lapping foam along the embankment walls.
      water = mix(water, vec3(0.7, 0.74, 0.75), smoothstep(3.05, 3.38, rd) * smoothstep(0.6, 0.9, noise(q * 3.0)) * 0.3);
      col = mix(col, water, river);
    }
    col += vec3(0.28, 0.27, 0.25) * aa(abs(rd - 3.4), 0.06);
    float band = aa(abs(p.x - uBeamX), 0.06) * uScan * step(abs(p.y), 48.0);
    col = mix(col, uYellow, band * 0.85);
    col *= 1.0 - uDim * 0.6;
    float fd = length(vW - cameraPosition) * uFog;
    col = mix(col, uHaze, 1.0 - exp(-fd * fd));
    gl_FragColor = vec4(col, 1.0);
    ${COLORSPACE}
  }
`;

const worldVert = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const beamFrag = /* glsl */ `
  uniform vec3 uYellow;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float a = pow(1.0 - vUv.y, 2.4) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * uAlpha * 0.35;
    gl_FragColor = vec4(uYellow * a, a);
    ${COLORSPACE}
  }
`;

const uvVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const pointsVert = /* glsl */ `
  attribute vec3 aGrid;
  attribute float aSeed;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  varying float vSeed;
  varying float vM;
  void main() {
    float t = clamp((uMorph - aSeed * 0.45) / 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 drift = vec3(sin(uTime * 0.4 + aSeed * 30.0), cos(uTime * 0.33 + aSeed * 17.0), sin(uTime * 0.27 + aSeed * 11.0)) * 1.6;
    vec3 p = mix(position + drift, aGrid, t);
    vSeed = aSeed;
    vM = t;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * mix(1.0 + aSeed * 1.6, 1.0, t) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const pointsFrag = /* glsl */ `
  uniform vec3 uYellow;
  uniform float uAlpha;
  varying float vSeed;
  varying float vM;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // Loose wishes are soft dots; filters are hard square cells.
    float soft = 1.0 - smoothstep(0.1, 0.5, length(c));
    float box = step(max(abs(c.x), abs(c.y)), 0.42) - step(max(abs(c.x), abs(c.y)), 0.3);
    float a = mix(soft * 0.55, box, vM) * uAlpha;
    vec3 col = mix(vec3(0.95, 0.93, 0.87), uYellow, vM * 0.85 + (1.0 - vM) * step(0.82, vSeed));
    if (a < 0.02) discard;
    gl_FragColor = vec4(col * a, a);
    ${COLORSPACE}
  }
`;

function prism() {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0);
  s.lineTo(0.5, 0);
  s.lineTo(0, 0.55);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  g.deleteAttribute("uv");
  return g;
}

const plain = (geo: THREE.BufferGeometry) => {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.deleteAttribute("uv");
  return g;
};
const fill = (g: THREE.BufferGeometry, name: string, v: number[]) => {
  const n = g.attributes.position.count;
  const a = new Float32Array(n * v.length);
  for (let i = 0; i < n; i++) a.set(v, i * v.length);
  g.setAttribute(name, new THREE.BufferAttribute(a, v.length));
  return g;
};
const tint = (g: THREE.BufferGeometry, hex: string) => fill(plain(g), "color", new THREE.Color(hex).toArray());

/** Terraced house: ridge along the street, a chimney stack on the party wall. aPart 1 marks the roof. */
function houseGeometry() {
  const body = plain(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const chimney = plain(new THREE.BoxGeometry(0.12, 0.6, 0.2).translate(0.42, 1.42, 0));
  const roof = prism().rotateY(Math.PI / 2).translate(0, 1, 0);
  return mergeGeometries([fill(body, "aPart", [0]), fill(chimney, "aPart", [0]), fill(roof, "aPart", [1])])!;
}

function blockGeometry() {
  return fill(plain(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)), "aPart", [0]);
}

const v2 = (p: number[][]) => p.map(([x, y]) => new THREE.Vector2(x, y));

function slab(pts: THREE.Vector2[], width: number, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth: width - bevel * 2, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: 1,
  });
  return plain(g.translate(0, 0, -(width - bevel * 2) / 2));
}

/** Push each point of a polygon away from (d > 0) or toward (d < 0) its centre. */
function grow(pts: number[][], d: number) {
  const c = pts.reduce((a, [x, y]) => [a[0] + x / pts.length, a[1] + y / pts.length], [0, 0]);
  return pts.map(([x, y]) => {
    const l = Math.hypot(x - c[0], y - c[1]);
    return new THREE.Vector2(x + ((x - c[0]) / l) * d, y + ((y - c[1]) / l) * d);
  });
}

type VehicleSpec = { L: number; W: number; wr: number; wheels: number[]; top: number[][]; cabin?: number[][]; extra?: (trim: THREE.BufferGeometry[], lamps: THREE.BufferGeometry[]) => void };

/** A vehicle as three parts sharing one transform: paint (tinted per instance), trim (glass, tyres) and lamps. Front is +x. */
function vehicle({ L, W, wr, wheels, top, cabin, extra }: VehicleSpec) {
  // Side profile: along the sill, up and over each wheel arch, then the roofline from front to back.
  const outline = [new THREE.Vector2(-L / 2, 0.05)];
  for (const x of wheels) for (let i = 0; i <= 8; i++) {
    const a = Math.PI * (1 - i / 8);
    outline.push(new THREE.Vector2(x + Math.cos(a) * (wr + 0.012), wr + Math.sin(a) * (wr + 0.012)));
  }
  outline.push(new THREE.Vector2(L / 2, 0.05), ...v2(top));
  const paint = slab(outline, W, 0.006);
  const trim: THREE.BufferGeometry[] = [];
  const lamps: THREE.BufferGeometry[] = [];
  if (cabin) {
    trim.push(tint(slab(grow(cabin, 0.014), W - 0.05), "#10161c")); // windscreen, roof glass, rear window
    trim.push(tint(slab(grow(cabin, -0.012), W + 0.02), "#10161c")); // side windows
  }
  for (const x of wheels) for (const s of [-1, 1]) {
    trim.push(tint(new THREE.CylinderGeometry(wr, wr, 0.05, 14).rotateX(Math.PI / 2).translate(x, wr, s * (W / 2 - 0.02)), "#121212"));
    trim.push(tint(new THREE.CylinderGeometry(wr * 0.55, wr * 0.55, 0.054, 10).rotateX(Math.PI / 2).translate(x, wr, s * (W / 2 - 0.02)), "#8d939a"));
  }
  for (const s of [-1, 1]) {
    lamps.push(tint(new THREE.BoxGeometry(0.012, 0.03, 0.055).translate(L / 2 + 0.006, 0.12, s * W * 0.32), "#fff2c0"));
    lamps.push(tint(new THREE.BoxGeometry(0.012, 0.03, 0.05).translate(-L / 2 - 0.006, 0.13, s * W * 0.34), "#ff2414"));
  }
  extra?.(trim, lamps);
  return { paint, trim: mergeGeometries(trim)!, lamps: mergeGeometries(lamps)! };
}

// Bus, black cab, van, car: the order of TRAFFIC below.
const MODELS = () => [
  vehicle({
    L: 1.26, W: 0.36, wr: 0.066, wheels: [-0.33, 0.41],
    top: [[0.632, 0.6], [0.6, 0.665], [-0.6, 0.665], [-0.632, 0.6]],
    extra: (trim, lamps) => {
      // Two decks of windows wrapping the front, and the destination blind.
      for (const [y0, y1] of [[0.25, 0.37], [0.47, 0.6]]) trim.push(tint(slab(v2([[-0.58, y0], [0.645, y0], [0.645, y1], [-0.58, y1]]), 0.386), "#10161c"));
      lamps.push(tint(new THREE.BoxGeometry(0.012, 0.045, 0.22).translate(0.645, 0.42, 0), "#ffe9a8"));
    },
  }),
  vehicle({
    L: 0.6, W: 0.28, wr: 0.054, wheels: [-0.19, 0.19],
    top: [[0.305, 0.11], [0.29, 0.14], [0.15, 0.155], [0.07, 0.245], [-0.2, 0.25], [-0.27, 0.2], [-0.305, 0.15], [-0.31, 0.1]],
    cabin: [[0.15, 0.155], [0.07, 0.245], [-0.2, 0.25], [-0.268, 0.165]],
    extra: (_, lamps) => { lamps.push(tint(new THREE.BoxGeometry(0.06, 0.025, 0.12).translate(0, 0.265, 0), "#ffb000")); }, // TAXI sign
  }),
  vehicle({
    L: 0.74, W: 0.3, wr: 0.058, wheels: [-0.24, 0.23],
    top: [[0.372, 0.13], [0.33, 0.165], [0.22, 0.295], [-0.36, 0.305], [-0.372, 0.29]],
    cabin: [[0.33, 0.165], [0.22, 0.295], [0.08, 0.297], [0.08, 0.165]],
  }),
  vehicle({
    L: 0.64, W: 0.29, wr: 0.056, wheels: [-0.2, 0.2],
    top: [[0.325, 0.1], [0.31, 0.13], [0.14, 0.15], [0.04, 0.225], [-0.11, 0.228], [-0.22, 0.155], [-0.315, 0.145], [-0.325, 0.1]],
    cabin: [[0.14, 0.15], [0.04, 0.225], [-0.11, 0.228], [-0.22, 0.155]],
  }),
];
const TRAFFIC = [
  { colour: "#c8102e", w: 0.14, speed: 2.2 }, // bus
  { colour: "#121212", w: 0.3, speed: 3.2 }, // cab
  { colour: "#e9e5dc", w: 0.12, speed: 3.2 }, // van
  { colour: "", w: 0.44, speed: 3.2 }, // car
];

type Car = { axis: "x" | "z"; line: number; lane: number; t: number; min: number; max: number; speed: number; model: number; slot: number };

/** 0 house, 1 glass tower, 2 apartment block. */
type Lot = { x: number; z: number; w: number; d: number; h: number; kind: number };

function layout(seed = 7) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const lots: Lot[] = [];
  for (let ix = -36; ix <= 36; ix++) {
    for (let iz = -20; iz <= 20; iz++) {
      if (ix % 6 === 0 || iz % 4 === 0) continue; // streets
      const x = ix * 1.85 + (rand() - 0.5) * 0.15;
      const z = iz * 2.25 + (rand() - 0.5) * 0.15;
      if (Math.abs(z - riverZ(x)) < RIVER_HALF + 1.1) continue;
      if (Math.hypot(x - SHARD.x, z - SHARD.z) < 3.2) continue;
      if (Math.abs(x - EYE_X) < 7.4 && z > riverZ(x) && z - riverZ(x) < 9.5) continue;
      if (Math.abs(x - SCHOOL.x) < 3.6 && Math.abs(z - SCHOOL.z) < 2.6) continue;
      if (Math.hypot(x - PARK.x, z - PARK.z) < 5.8) continue;
      if (x > PARLIAMENT_X[0] - 1 && x < PARLIAMENT_X[1] + 1 && z - riverZ(x) < -3 && z - riverZ(x) > -8) continue;
      if (Math.abs(x - STPAULS.x) < 4.9 && Math.abs(z - STPAULS.z) < 3.9) continue;
      if (Math.abs(x - HQ.x) < 2.5 && Math.abs(z - HQ.z) < 2.5) continue;
      if (Math.abs(x - STATION.x) < 5.6 && Math.abs(z - STATION.z) < 2.6) continue;
      if (Math.hypot(x * 1, z * 1.3) > 78) continue;
      const nearCity = Math.hypot(x - 9, z + 6) < 11;
      const r = rand();
      // Flats stay clear of the chosen home so the close-up shots keep their view.
      const kind = nearCity ? (r < 0.55 ? 1 : 0) : r < 0.035 ? 1 : r < 0.13 && Math.hypot(x - 4.5, z - 8) > 9 ? 2 : 0;
      lots.push({
        x, z,
        w: 1.45 + rand() * 0.2,
        d: kind ? 1.6 + rand() * 0.4 : 1.7 + rand() * 0.3,
        h: kind === 1 ? 3 + rand() * (nearCity ? 9 : 3) : kind === 2 ? 2 + rand() * 1.6 : 0.9 + rand() * 0.55,
        kind,
      });
      setback(lots);
    }
  }
  return { lots, rand };
}

/** Vertical sign: the name stacked letter by letter in signal yellow, under our house mark. Drawn in the page's Outfit. */
function signTexture() {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 1760;
  const ctx = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = ctx.fillStyle = "#ffd400";
    ctx.lineWidth = 9;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(32, 74); ctx.lineTo(80, 34); ctx.lineTo(128, 74); ctx.lineTo(128, 130); ctx.lineTo(32, 130); ctx.closePath();
    ctx.stroke();
    ctx.fillRect(14, 92, 132, 12);
    ctx.font = `600 92px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    [..."PROPERTY", "", ..."SCANNER"].forEach((ch, i) => ctx.fillText(ch, 80, 240 + i * 96));
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  return tex;
}

/** Give every instance of a built mesh the same wall and roof colour. */
function recolour(geo: THREE.BufferGeometry, wall: string, roof: string) {
  ([["aColor", wall], ["aRoof", roof]] as const).forEach(([name, hex]) => {
    const a = geo.getAttribute(name) as THREE.BufferAttribute;
    const c = new THREE.Color(hex);
    for (let i = 0; i < a.count; i++) a.setXYZ(i, c.r, c.g, c.b);
  });
}

/** Tall towers step back near the top, like real ones: a narrower crown rising out of the last lot. */
function setback(lots: Lot[]) {
  const l = lots[lots.length - 1];
  if (l.kind === 1 && l.h > 5) lots.push({ ...l, w: l.w * 0.64, d: l.d * 0.64, h: l.h + 0.6 + (l.h % 1) * 1.8 });
}

/** Greater London out to the horizon, so every direction the camera turns has city in it. */
function outskirts(rand: () => number, radius: number) {
  const lots: Lot[] = [];
  for (let bx = -radius; bx <= radius; bx += 11.1) {
    for (let bz = -radius; bz <= radius; bz += 9) {
      // Block centres sit midway between the streets the ground shader paints.
      const cx = Math.round(bx / 11.1) * 11.1 + 5.55;
      const cz = Math.round(bz / 9) * 9 + 4.5;
      const d = Math.hypot(cx, cz * 1.3);
      if (d < 82 || Math.hypot(cx, cz) > radius) continue;
      if (Math.abs(cz - riverZ(cx)) < RIVER_HALF + 4.6) continue;
      const wharf = Math.hypot(cx - 120, cz + 24) < 20; // Canary Wharf
      for (const ox of [-2.9, 0, 2.9]) for (const oz of [-1.6, 1.6]) {
        const r = rand();
        const kind = wharf ? (r < 0.7 ? 1 : 2) : r < 0.12 ? 2 : r < 0.14 ? 1 : 0;
        lots.push({
          x: cx + ox, z: cz + oz,
          w: 2.4 + rand() * 0.3, d: 2.6 + rand() * 0.4,
          h: kind === 1 ? (wharf ? 10 + rand() * 20 : 4 + rand() * 5) : kind === 2 ? 2 + rand() * 2.6 : 0.9 + rand() * 0.6,
          kind,
        });
        setback(lots);
      }
    }
  }
  return lots;
}

export class Stage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 2200);
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private clock = new THREE.Timer();
  private target = new THREE.Vector3();
  private curPos = new THREE.Vector3(34, 30, 40);
  private curTarget = new THREE.Vector3();
  private cur: SceneState | null = null;
  private lift = 1;

  readonly focusPos: THREE.Vector3;
  readonly total: number;
  private randsByQuery: number[][] = [[], [], []];

  private shared = {
    uScanX: { value: 80 },
    uBeamX: { value: -60 },
    uScan: { value: 0 },
    uDim: { value: 0 },
    uNarrow: { value: 0 },
    uQuery: { value: 0 },
    uFocus: { value: 0 },
    uFocusPos: { value: new THREE.Vector3() },
    uClear: { value: 0 },
    uTime: { value: 0 },
    uYellow: { value: YELLOW },
    uHaze: { value: new THREE.Color("#c6daef") },
    uSunDir: { value: new THREE.Vector3(0.45, 0.8, 0.35).normalize() },
    uFog: { value: FOG },
    uPark: { value: new THREE.Color("#2e4a2f") },
  };

  private beam: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private columnsMat: THREE.ShaderMaterial;
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private arc: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  private arcHead: THREE.Mesh;
  private pin: THREE.Group;
  private cars: Car[] = [];
  private fleet: THREE.InstancedMesh[][] = [];
  private boats: { x: number; dir: number; off: number; speed: number }[] = [];
  private boatMesh!: THREE.InstancedMesh;
  private commute!: THREE.Group;
  private commuteMats: THREE.Material[] = [];
  private beamLine!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private homes: { x: number; y: number; z: number; r: number[] }[] = [];
  private yaw = 0;
  private pitch = 0;
  private wheel!: THREE.Group;
  private sky!: THREE.Mesh;
  private schoolMat!: THREE.LineBasicMaterial;
  private schoolLit = 0;
  private focusRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private house: THREE.Group;
  private solidMats: THREE.MeshStandardMaterial[] = [];
  private wireMat: THREE.LineDashedMaterial;
  private clipSolid = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  private clipWire = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

  constructor(canvas: HTMLCanvasElement, opts: { lite: boolean }) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.lite, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lite ? 1.5 : 1.75));
    this.renderer.setClearColor(INK, 1);
    this.renderer.localClippingEnabled = true;

    this.scene.add(new THREE.HemisphereLight(0xd6e6ff, 0x4a4238, 1.5));
    const sun = new THREE.DirectionalLight(0xfff4d6, 1.6);
    sun.position.set(6, 12, 5);
    this.scene.add(sun);

    // --- City
    const { lots, rand } = layout();
    let fi = 0;
    let best = Infinity;
    lots.forEach((l, i) => {
      if (l.kind) return;
      const d = Math.hypot(l.x - 4.5, l.z - 8);
      if (d < best) { best = d; fi = i; }
    });
    const focus = lots[fi];
    this.focusPos = new THREE.Vector3(focus.x, 0, focus.z);
    this.shared.uFocusPos.value.copy(this.focusPos);

    const homes = lots.filter((l, i) => !l.kind && i !== fi);
    const blocks = lots.filter((l) => l.kind);
    this.total = lots.length;

    const houseMat = new THREE.ShaderMaterial({
      vertexShader: houseVert,
      fragmentShader: houseFrag,
      uniforms: this.shared,
    });
    const columnsMat = new THREE.ShaderMaterial({
      vertexShader: columnVert,
      fragmentShader: columnFrag,
      uniforms: { ...this.shared, uFade: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.columnsMat = columnsMat;

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    // Only the scanned city can match a query; the outskirts are scenery.
    const build = (list: Lot[], geo: THREE.BufferGeometry, scanned: boolean) => {
      const mesh = new THREE.InstancedMesh(geo, houseMat, list.length);
      const rands = new Float32Array(list.length * 3);
      list.forEach((l, i) => {
        m.compose(new THREE.Vector3(l.x, 0, l.z), q, new THREE.Vector3(l.w, l.h, l.d));
        mesh.setMatrixAt(i, m);
        for (let k = 0; k < 3; k++) {
          const r = l.kind || !scanned ? 1 : rand();
          rands[i * 3 + k] = r;
          if (scanned) this.randsByQuery[k].push(r);
        }
      });
      geo.setAttribute("aRand", new THREE.InstancedBufferAttribute(rands, 3));
      const wall = new Float32Array(list.length * 3);
      const roof = new Float32Array(list.length * 3);
      const kind = new Float32Array(list.length);
      const c = new THREE.Color();
      list.forEach((l, i) => {
        const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];
        c.set(pick([WALLS, GLASS, FLATS][l.kind])).toArray(wall, i * 3);
        c.set(pick([ROOFS, GLASS, FLATS][l.kind])).toArray(roof, i * 3);
        kind[i] = l.kind;
      });
      geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(wall, 3));
      geo.setAttribute("aRoof", new THREE.InstancedBufferAttribute(roof, 3));
      geo.setAttribute("aKind", new THREE.InstancedBufferAttribute(kind, 1));
      this.scene.add(mesh);
      return rands;
    };
    const homeRands = build(homes, houseGeometry(), true);
    this.homes = homes.map((l, i) => ({ x: l.x, y: l.h + 0.6, z: l.z, r: [homeRands[i * 3], homeRands[i * 3 + 1], homeRands[i * 3 + 2]] }));
    build(blocks, blockGeometry(), true);
    // --- Our tower: dark glass tiers, a yellow light line at each setback, the name running down two faces.
    const hqGeo = blockGeometry();
    build(HQ_TIERS.map(([w, h]) => ({ x: HQ.x, z: HQ.z, w, d: w, h, kind: 1 })), hqGeo, false);
    recolour(hqGeo, "#3b4654", "#2a313b");
    const hq = new THREE.Group();
    hq.position.copy(HQ);
    const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.1, 0.1), toneMapped: false });
    HQ_TIERS.forEach(([w, h]) => hq.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.07, w + 0.04).translate(0, h - 0.035, 0), glow)));
    hq.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 3, 8).translate(0, 21.5, 0), new THREE.MeshStandardMaterial({ color: "#c9ced4", metalness: 0.6, roughness: 0.3 })));
    hq.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8).translate(0, 23.05, 0), new THREE.MeshBasicMaterial({ color: "#ff3b2f" })));
    const sign = new THREE.MeshBasicMaterial({ map: signTexture(), transparent: true, color: new THREE.Color(1.25, 1.25, 1.25), toneMapped: false });
    const fin = new THREE.MeshStandardMaterial({ color: "#0d0f12", roughness: 0.25, metalness: 0.6 });
    const [w0] = HQ_TIERS[0];
    // A black blade on the south and east faces, the lettering standing just proud of it.
    for (const [ry, ox, oz] of [[0, w0 * 0.22, w0 / 2], [Math.PI / 2, w0 / 2, -w0 * 0.22]]) {
      const blade = new THREE.Group();
      blade.add(new THREE.Mesh(new THREE.BoxGeometry(0.96, 9.9, 0.08).translate(0, 9, 0.04), fin));
      blade.add(new THREE.Mesh(new THREE.PlaneGeometry(0.88, 9.68).translate(0, 9, 0.085), sign));
      blade.rotation.y = ry;
      blade.position.set(ox, 0, oz);
      hq.add(blade);
    }
    this.scene.add(hq);
    // The chosen home is a match in every demo query.
    for (let k = 0; k < 3; k++) this.randsByQuery[k].push(0);
    // ponytail: outskirts are ~9k instances on desktop; shrink the radius first if low-end GPUs drop frames.
    const far = outskirts(rand, opts.lite ? 150 : 230);
    build(far.filter((l) => !l.kind), houseGeometry(), false);
    build(far.filter((l) => l.kind), blockGeometry(), false);

    const colGeo = new THREE.BoxGeometry(0.07, 1, 0.07);
    colGeo.translate(0, 0.5, 0);
    const cols = new THREE.InstancedMesh(colGeo, columnsMat, homes.length);
    homes.forEach((l, i) => {
      m.compose(new THREE.Vector3(l.x, l.h + 0.55, l.z), q, new THREE.Vector3(1, 1, 1));
      cols.setMatrixAt(i, m);
    });
    colGeo.setAttribute("aRand", new THREE.InstancedBufferAttribute(homeRands, 3));
    cols.frustumCulled = false;
    this.scene.add(cols);

    // --- Ground, river, landmarks
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2),
      new THREE.ShaderMaterial({ vertexShader: worldVert, fragmentShader: groundFrag, uniforms: this.shared }),
    );
    this.scene.add(ground);

    const edgeMat = new THREE.LineBasicMaterial({ color: YELLOW, transparent: true, opacity: 0.35 });
    const darkMat = new THREE.MeshStandardMaterial({ color: "#7d93a8", roughness: 0.25, metalness: 0.7 });
    const shardGeo = new THREE.ConeGeometry(2.3, 21, 4, 1, true);
    shardGeo.translate(0, 10.5, 0);
    const shard = new THREE.Mesh(shardGeo, darkMat);
    shard.position.copy(SHARD);
    shard.rotation.y = Math.PI / 4;
    shard.add(new THREE.LineSegments(new THREE.EdgesGeometry(shardGeo), edgeMat));
    this.scene.add(shard);

    // --- The London Eye: a white steel rim on cables, 32 glass capsules, held from the land side by an A-frame.
    const steel = new THREE.MeshStandardMaterial({ color: "#e6eaee", roughness: 0.35, metalness: 0.5, emissive: "#8fa6bf", emissiveIntensity: 0.12 });
    const eye = new THREE.Group();
    const hubY = EYE_R + 0.75;
    const wheel = new THREE.Group();
    wheel.position.y = hubY;
    for (const z of [-0.3, 0.3]) wheel.add(new THREE.Mesh(new THREE.TorusGeometry(EYE_R, 0.07, 6, 128).translate(0, 0, z), steel));
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(EYE_R - 0.4, 0.045, 6, 128), steel));
    wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.3, 20).rotateX(Math.PI / 2), steel));
    const truss: THREE.Vector3[] = [];
    const cables: THREE.Vector3[] = [];
    const at = (a: number, r: number, z: number) => new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const b = ((i + 0.5) / 64) * Math.PI * 2;
      // Rim truss: zigzag from each outer chord to the inner chord.
      for (const z of [-0.3, 0.3]) truss.push(at(a, EYE_R, z), at(b, EYE_R - 0.4, 0), at(b, EYE_R - 0.4, 0), at(a + Math.PI / 32, EYE_R, z));
      // Spoke cables run from alternate ends of the hub.
      cables.push(at(a, 0.3, i % 2 ? 0.6 : -0.6), at(a, EYE_R - 0.4, 0));
    }
    wheel.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(truss), new THREE.LineBasicMaterial({ color: "#d9dee4", transparent: true, opacity: 0.8 })));
    wheel.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(cables), new THREE.LineBasicMaterial({ color: "#c9d0d8", transparent: true, opacity: 0.45 })));
    // Capsules hang outside the rim. Their long axis is the wheel's axle, so they stay level as it turns.
    const pods = new THREE.InstancedMesh(
      new THREE.CapsuleGeometry(0.2, 0.46, 4, 12).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: "#bcd3e3", roughness: 0.15, metalness: 0.3, emissive: "#6d8fa8", emissiveIntensity: 0.55 }),
      32,
    );
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      pods.setMatrixAt(i, m.makeTranslation(Math.cos(a) * (EYE_R + 0.3), Math.sin(a) * (EYE_R + 0.3), 0));
    }
    wheel.add(pods);
    eye.add(wheel);
    const strut = (a: THREE.Vector3, b: THREE.Vector3, r: number) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, a.distanceTo(b), 10), steel);
      s.position.copy(a).add(b).multiplyScalar(0.5);
      s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      return s;
    };
    const spindle = new THREE.Vector3(0, hubY, 0.9);
    const feet = [new THREE.Vector3(-2.7, 0, 4.4), new THREE.Vector3(2.7, 0, 4.4)];
    feet.forEach((f) => eye.add(strut(f, spindle, 0.17)));
    eye.add(strut(feet[0].clone().lerp(spindle, 0.45), feet[1].clone().lerp(spindle, 0.45), 0.06));
    eye.add(strut(new THREE.Vector3(0, hubY, -0.8), spindle, 0.12));
    eye.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
      spindle, new THREE.Vector3(-1.2, 0, 9), spindle, new THREE.Vector3(1.2, 0, 9),
    ]), new THREE.LineBasicMaterial({ color: "#c9d0d8", transparent: true, opacity: 0.5 })));
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 1.6).translate(0, 0.09, -0.2), new THREE.MeshStandardMaterial({ color: "#5d6168", roughness: 0.8 }));
    eye.add(deck);
    eye.position.set(EYE_X, 0, riverZ(EYE_X) + 4);
    // The wheel faces across the river: its plane follows the bank.
    eye.rotation.y = -Math.atan(riverZ(EYE_X + 0.5) - riverZ(EYE_X - 0.5));
    this.scene.add(eye);
    this.wheel = wheel;

    // --- School, park, station: the things buyers actually ask about.
    const school = new THREE.Group();
    const sGeo = mergeGeometries([
      new THREE.BoxGeometry(5.4, 1.5, 1.4).translate(0, 0.75, -0.5),
      new THREE.BoxGeometry(1.4, 1.5, 3.4).translate(-2, 0.75, 0.5),
      new THREE.BoxGeometry(1.4, 1.5, 3.4).translate(2, 0.75, 0.5),
    ])!;
    // A Victorian board school: brick wings with tall sash windows and slate roofs, a bell cupola on the ridge.
    const schoolGeo = houseGeometry();
    build([[0, -0.5, 5.4, 1.4], [-2, 0.5, 1.4, 3.4], [2, 0.5, 1.4, 3.4]].map(([x, z, w, d]) => ({ x: SCHOOL.x + x, z: SCHOOL.z + z, w, d, h: 1.5, kind: 0 })), schoolGeo, false);
    recolour(schoolGeo, "#8a4636", "#4a5361");
    school.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.34).translate(0, 2.45, -0.5), new THREE.MeshStandardMaterial({ color: "#e9e3d3", roughness: 0.7 })));
    school.add(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 4).rotateY(Math.PI / 4).translate(0, 2.9, -0.5), new THREE.MeshStandardMaterial({ color: "#4a5361", roughness: 0.6 })));
    this.schoolMat = new THREE.LineBasicMaterial({ color: YELLOW, transparent: true, opacity: 0.25 });
    school.add(new THREE.LineSegments(new THREE.EdgesGeometry(sGeo), this.schoolMat));
    const yard = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.2, 0.02, 0.4), new THREE.Vector3(1.2, 0.02, 0.4), new THREE.Vector3(1.2, 0.02, 2.2), new THREE.Vector3(-1.2, 0.02, 2.2),
    ]), this.schoolMat);
    school.add(yard);
    school.position.copy(SCHOOL);
    this.scene.add(school);

    // --- Trees: the park, and London planes along the pavements. (x, scale, z)
    const treeAt: THREE.Vector3[] = [];
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 4.8;
      const tx = PARK.x + Math.cos(a) * r, tz = PARK.z + Math.sin(a) * r * 0.8;
      const sc = 1.1 + rand() * 0.9;
      if (!inLake(tx, tz)) treeAt.push(new THREE.Vector3(tx, sc, tz));
    }
    for (let k = -4; k <= 4; k++) for (const kerb of [-1.15, 1.15]) for (let x = -62; x <= 62; x += 2.3) {
      const tx = x + (rand() - 0.5) * 0.6;
      const z = k * 9 + kerb;
      if (rand() < 0.3 || Math.abs(tx - Math.round(tx / 11.1) * 11.1) < 1.6) continue;
      if (Math.abs(z - riverZ(tx)) < RIVER_HALF + 1.2 || Math.hypot(tx, z * 1.3) > 74) continue;
      if (Math.hypot(tx - this.focusPos.x, z - this.focusPos.z) < 4) continue;
      if (Math.abs(tx - STATION.x) < 5.6 && Math.abs(z - STATION.z) < 3) continue;
      if (Math.abs(tx - SCHOOL.x) < 3.6 && Math.abs(z - SCHOOL.z) < 3) continue;
      if (Math.abs(tx - EYE_X) < 7.4 && z > riverZ(tx) && z - riverZ(tx) < 10) continue;
      if (tx > PARLIAMENT_X[0] - 1 && tx < PARLIAMENT_X[1] + 1 && z - riverZ(tx) < -3 && z - riverZ(tx) > -8) continue;
      if (Math.abs(tx - STPAULS.x) < 4.9 && Math.abs(z - STPAULS.z) < 3.9) continue;
      treeAt.push(new THREE.Vector3(tx, 0.8 + rand() * 0.4, z));
    }
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.05, 0.55, 5).translate(0, 0.27, 0), new THREE.MeshStandardMaterial({ color: "#3b2f26", roughness: 1 }), treeAt.length);
    const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.34, 1).scale(1, 1.15, 1).translate(0, 0.8, 0), new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), treeAt.length);
    const leaf = new THREE.Color();
    treeAt.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, 0, p.z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6.3), new THREE.Vector3(p.y, p.y, p.y));
      trunks.setMatrixAt(i, m);
      crowns.setMatrixAt(i, m);
      crowns.setColorAt(i, leaf.setHSL(0.27 + rand() * 0.06, 0.3 + rand() * 0.15, 0.2 + rand() * 0.08));
    });
    q.identity();
    this.scene.add(trunks, crowns);

    // --- Westminster: the Houses of Parliament along the river, Big Ben at the bridge end.
    const landmarkMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });
    const SAND = "#cfbd8f", LEAD = "#59606a", GILT = "#d4af37";
    const pw: THREE.BufferGeometry[] = [];
    const len = PARLIAMENT_X[1] - PARLIAMENT_X[0] - 0.9;
    pw.push(tint(new THREE.BoxGeometry(len, 1.0, 1.5).translate(0.45, 0.5, 0), SAND));
    pw.push(tint(prism().scale(len, 0.9, 1.5).translate(0.45, 1.0, 0), LEAD));
    for (let x = -len / 2 + 0.6; x < len / 2 + 0.4; x += 0.38) {
      for (const z of [-0.76, 0.76]) {
        pw.push(tint(new THREE.ConeGeometry(0.05, 0.4, 4).translate(x, 1.2, z), SAND)); // pinnacles
        pw.push(tint(new THREE.BoxGeometry(0.1, 0.55, 0.02).translate(x + 0.19, 0.5, z), "#6d6047")); // tall Gothic windows
      }
    }
    pw.push(tint(new THREE.BoxGeometry(1.0, 3.4, 1.0).translate(len / 2 + 0.2, 1.7, 0), SAND)); // Victoria Tower
    for (const cx of [-0.45, 0.45]) for (const cz of [-0.45, 0.45]) pw.push(tint(new THREE.ConeGeometry(0.09, 0.6, 4).translate(len / 2 + 0.2 + cx, 3.7, cz), GILT));
    pw.push(tint(new THREE.CylinderGeometry(0.22, 0.26, 1.2, 8).translate(0.3, 1.6, 0), SAND)); // Central Tower
    pw.push(tint(new THREE.ConeGeometry(0.26, 1.1, 8).translate(0.3, 2.75, 0), LEAD));
    // Big Ben (the Elizabeth Tower): shaft, clock stage with four faces, belfry, spire.
    const bx = -len / 2 - 0.5;
    pw.push(tint(new THREE.BoxGeometry(0.64, 3.8, 0.64).translate(bx, 1.9, 0), SAND));
    pw.push(tint(new THREE.BoxGeometry(0.78, 0.82, 0.78).translate(bx, 4.2, 0), SAND));
    for (const [ry, dx, dz] of [[0, 0, 0.4], [0, 0, -0.4], [Math.PI / 2, 0.4, 0], [Math.PI / 2, -0.4, 0]]) {
      pw.push(tint(new THREE.CylinderGeometry(0.29, 0.29, 0.02, 24).rotateX(Math.PI / 2).rotateY(ry).translate(bx + dx, 4.22, dz), "#f1ead6"));
      pw.push(tint(new THREE.BoxGeometry(0.02, 0.2, 0.03).rotateZ(0.5).rotateY(ry).translate(bx + dx * 1.04, 4.26, dz * 1.04), "#1d1d1d"));
    }
    pw.push(tint(new THREE.BoxGeometry(0.66, 0.5, 0.66).translate(bx, 4.86, 0), "#bba976"));
    pw.push(tint(new THREE.ConeGeometry(0.5, 1.7, 4).rotateY(Math.PI / 4).translate(bx, 5.95, 0), "#3d4552"));
    pw.push(tint(new THREE.ConeGeometry(0.05, 0.4, 6).translate(bx, 6.95, 0), GILT));
    const parliament = new THREE.Mesh(mergeGeometries(pw)!, landmarkMat);
    const midX = (PARLIAMENT_X[0] + PARLIAMENT_X[1]) / 2;
    const ang = Math.atan2(riverZ(PARLIAMENT_X[1]) - riverZ(PARLIAMENT_X[0]), PARLIAMENT_X[1] - PARLIAMENT_X[0]);
    parliament.position.set(midX, 0, riverZ(midX) - 5.2);
    parliament.rotation.y = -ang;
    this.scene.add(parliament);

    // --- St Paul's Cathedral: cross-shaped nave, columned drum, lead dome, lantern and golden cross.
    const sp: THREE.BufferGeometry[] = [];
    const PORT = "#d9d0bb";
    sp.push(tint(new THREE.BoxGeometry(5.2, 1.3, 1.5).translate(0, 0.65, 0), PORT));
    sp.push(tint(new THREE.BoxGeometry(1.6, 1.3, 3.6).translate(0.3, 0.65, 0), PORT));
    sp.push(tint(prism().rotateY(Math.PI / 2).scale(5.2, 0.6, 1.5).translate(0, 1.3, 0), LEAD));
    sp.push(tint(prism().scale(1.6, 0.6, 3.6).translate(0.3, 1.3, 0), LEAD));
    for (const z of [-0.55, 0.55]) {
      sp.push(tint(new THREE.BoxGeometry(0.6, 2.4, 0.6).translate(-2.4, 1.2, z), PORT)); // west towers
      sp.push(tint(new THREE.CylinderGeometry(0.16, 0.24, 0.6, 8).translate(-2.4, 2.7, z), PORT));
      sp.push(tint(new THREE.ConeGeometry(0.17, 0.4, 8).translate(-2.4, 3.2, z), GILT));
    }
    sp.push(tint(new THREE.CylinderGeometry(1.0, 1.0, 0.9, 32).translate(0.3, 1.75, 0), PORT)); // drum
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      sp.push(tint(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6).translate(0.3 + Math.cos(a) * 1.07, 1.75, Math.sin(a) * 1.07), "#efe8d6"));
    }
    sp.push(tint(new THREE.SphereGeometry(0.98, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.25, 1).translate(0.3, 2.2, 0), "#8a959b"));
    sp.push(tint(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 12).translate(0.3, 3.6, 0), PORT)); // lantern
    sp.push(tint(new THREE.SphereGeometry(0.1, 12, 8).translate(0.3, 3.95, 0), GILT));
    sp.push(tint(new THREE.BoxGeometry(0.03, 0.3, 0.03).translate(0.3, 4.15, 0), GILT));
    sp.push(tint(new THREE.BoxGeometry(0.03, 0.03, 0.16).translate(0.3, 4.2, 0), GILT));
    const stPauls = new THREE.Mesh(mergeGeometries(sp)!, landmarkMat);
    stPauls.position.copy(STPAULS);
    this.scene.add(stPauls);

    const station = new THREE.Group();
    const shed = new THREE.CylinderGeometry(1.3, 1.3, 9, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2);
    station.add(new THREE.Mesh(shed, new THREE.MeshStandardMaterial({ color: "#8d8a84", roughness: 0.5, metalness: 0.5, side: THREE.DoubleSide })));
    station.add(new THREE.LineSegments(new THREE.EdgesGeometry(shed, 30), edgeMat));
    const rails: THREE.Vector3[] = [];
    for (const dz of [-0.5, 0.5]) rails.push(new THREE.Vector3(-30, 0.03, dz), new THREE.Vector3(30, 0.03, dz));
    station.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rails), new THREE.LineBasicMaterial({ color: "#efeadb", transparent: true, opacity: 0.22 })));
    station.position.copy(STATION);
    this.scene.add(station);

    // --- Bridges over the Thames, and Tower Bridge east of the Shard.
    const roadsX: number[] = [];
    for (let k = -6; k <= 6; k++) if (Math.abs(k * 11.1) <= 62) roadsX.push(k * 11.1);
    // Arch bridge, side profile (z across the river, y up): a deck carried on three stone arches.
    const half = DECK_HALF;
    const profile = [new THREE.Vector2(-half, 0.42), new THREE.Vector2(-half, -0.1)];
    for (const [c, hw] of [[-2.75, 1.0], [0, 1.15], [2.75, 1.0]]) {
      for (let i = 0; i <= 16; i++) {
        const t = Math.PI * (1 - i / 16);
        profile.push(new THREE.Vector2(c + Math.cos(t) * hw, -0.1 + Math.sin(t) * 0.42));
      }
    }
    profile.push(new THREE.Vector2(half, -0.1), new THREE.Vector2(half, 0.42));
    const span = slab(profile, 1.9).rotateY(Math.PI / 2);
    // Approach ramp on side s: a strip whose top follows deckY, from top to bottom offsets.
    const ramp = (s: number, top: number, bottom: number, width: number, hex: string) => {
      const up: THREE.Vector2[] = [];
      const down: THREE.Vector2[] = [];
      for (let i = 0; i <= 20; i++) {
        const z = s * (half + (i / 20) * RAMP);
        const y = deckY(Math.abs(z));
        up.push(new THREE.Vector2(z, y + top));
        down.push(new THREE.Vector2(z, Math.max(y + bottom, -0.02)));
      }
      return tint(slab([...up, ...down.reverse()], width).rotateY(Math.PI / 2), hex);
    };
    const bridgeGeo = mergeGeometries([
      tint(span, "#a39a88"),
      ...[-1, 1].flatMap((s) => [
        ramp(s, -0.004, -1, 1.9, "#a39a88"),
        ramp(s, 0.002, -0.03, 1.62, "#3a3a3d"),
        ...[-1, 1].map((sx) => ramp(s, 0.13, -0.004, 0.12, "#b8af9c").translate(sx * 0.89, 0, 0)),
      ]),
      tint(new THREE.BoxGeometry(1.62, 0.02, half * 2).translate(0, 0.43, 0), "#3a3a3d"), // road surface
      ...[-1, 1].flatMap((sx) => [
        tint(new THREE.BoxGeometry(0.12, 0.13, half * 2).translate(sx * 0.89, 0.49, 0), "#b8af9c"), // parapet
        tint(new THREE.BoxGeometry(0.06, 0.04, half * 2).translate(sx * 0.89, 0.57, 0), "#c9c1ae"), // coping
        ...[-1.4, 1.4].map((z) => tint(new THREE.BoxGeometry(0.34, 0.5, 0.5).translate(sx * 0.98, 0.1, z), "#958c7a")), // cutwaters
        ...[-3.4, -1.4, 0.6, 2.6].map((z) => tint(new THREE.CylinderGeometry(0.018, 0.024, 0.42, 6).translate(sx * 0.89, 0.76, z), "#2b2e33")), // lamp posts
      ]),
    ])!;
    const bridgeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    const lampGeo = mergeGeometries([-1, 1].flatMap((sx) => [-3.4, -1.4, 0.6, 2.6].map((z) => plain(new THREE.SphereGeometry(0.045, 8, 6).translate(sx * 0.89, 0.99, z)))))!;
    const streetLampMat = new THREE.MeshBasicMaterial({ color: "#fff1c8" });
    roadsX.forEach((x) => {
      const bridge = new THREE.Group();
      bridge.add(new THREE.Mesh(bridgeGeo, bridgeMat), new THREE.Mesh(lampGeo, streetLampMat));
      bridge.position.set(x, 0, riverZ(x));
      this.scene.add(bridge);
    });

    // Tower Bridge: two Gothic towers with corner turrets, high walkways, and suspension chains to each bank.
    const tbX = roadsX.reduce((a, b) => (Math.abs(b - 22.2) < Math.abs(a - 22.2) ? b : a));
    const tb = new THREE.Group();
    const towerParts: THREE.BufferGeometry[] = [];
    for (const dz of [-1.7, 1.7]) {
      towerParts.push(tint(new THREE.BoxGeometry(1.3, 0.5, 1.3).translate(0, 0.0, dz), "#8f887a")); // pier
      towerParts.push(tint(new THREE.BoxGeometry(1.1, 3.6, 1.0).translate(0, 2.0, dz), "#cfc4a8"));
      for (const cx of [-0.5, 0.5]) for (const cz of [-0.45, 0.45]) {
        towerParts.push(tint(new THREE.CylinderGeometry(0.17, 0.17, 4.0, 8).translate(cx, 2.0, dz + cz), "#d8cdb2"));
        towerParts.push(tint(new THREE.ConeGeometry(0.21, 0.7, 8).translate(cx, 4.35, dz + cz), "#4a5361"));
      }
      towerParts.push(tint(new THREE.ConeGeometry(0.75, 1.1, 4).rotateY(Math.PI / 4).translate(0, 4.35, dz), "#4a5361"));
      for (const y of [1.3, 2.2, 3.1]) for (const sx of [-1, 1]) {
        towerParts.push(tint(new THREE.BoxGeometry(0.02, 0.36, 0.22).translate(sx * 0.56, y, dz), "#2a3440")); // lancet windows
      }
    }
    for (const sx of [-0.22, 0.22]) towerParts.push(tint(new THREE.BoxGeometry(0.36, 0.28, 3.4).translate(sx, 3.35, 0), "#6f9bc4")); // walkways
    tb.add(new THREE.Mesh(mergeGeometries(towerParts)!, bridgeMat));
    // Chains sag from each tower top down to the bank abutments.
    const chainMat = new THREE.MeshStandardMaterial({ color: "#6f9bc4", roughness: 0.5, metalness: 0.3 });
    for (const sx of [-0.5, 0.5]) for (const dir of [-1, 1]) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(sx, 3.3, dir * 2.2), new THREE.Vector3(sx, 0.8, dir * 3.6), new THREE.Vector3(sx, 0.55, dir * 5.6),
      );
      tb.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.05, 6), chainMat));
    }
    tb.position.set(tbX, 0, riverZ(tbX));
    this.scene.add(tb);

    // --- Traffic: red buses, black cabs, vans and cars on every street.
    const lanes: Pick<Car, "axis" | "line" | "min" | "max">[] = [];
    // A street runs only where it's open road: split it into runs, stopping at river banks and park gates.
    const split = (axis: Car["axis"], line: number, lo: number, hi: number, open: (t: number) => boolean) => {
      let start: number | null = null;
      for (let t = lo; t <= hi; t += 0.5) {
        const ok = open(t);
        if (ok && start === null) start = t;
        if ((!ok || t >= hi) && start !== null) {
          if (t - start > 8) lanes.push({ axis, line, min: start, max: t - 0.5 });
          start = null;
        }
      }
    };
    const outsidePark = (x: number, z: number) => Math.hypot(x - PARK.x, (z - PARK.z) * 1.15) > 6.4;
    roadsX.forEach((x) => split("z", x, -44, 44, (z) => outsidePark(x, z)));
    for (let k = -4; k <= 4; k++) {
      const z = k * 9;
      split("x", z, -62, 62, (x) => Math.abs(z - riverZ(x)) > RIVER_HALF + 1.2 && Math.hypot(x, z * 1.3) < 72 && outsidePark(x, z));
    }
    const counts = TRAFFIC.map(() => 0);
    const colours: string[] = [];
    lanes.forEach((ln) => {
      const n = Math.max(2, Math.round((ln.max - ln.min) / 7));
      for (let i = 0; i < n; i++) {
        let r = rand();
        let model = TRAFFIC.findIndex((t) => (r -= t.w) < 0);
        if (model < 0) model = 3;
        this.cars.push({
          ...ln, lane: rand() < 0.5 ? -0.38 : 0.38,
          t: ln.min + rand() * (ln.max - ln.min),
          speed: TRAFFIC[model].speed + rand() * 1.6,
          model, slot: counts[model]++,
        });
        colours.push(TRAFFIC[model].colour || CAR_COLOURS[Math.floor(rand() * CAR_COLOURS.length)]);
      }
    });
    const paintMat = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.25 });
    const trimMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.3 });
    const lampMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    this.fleet = MODELS().map((parts, k) => [
      new THREE.InstancedMesh(parts.paint, paintMat, Math.max(counts[k], 1)),
      new THREE.InstancedMesh(parts.trim, trimMat, Math.max(counts[k], 1)),
      new THREE.InstancedMesh(parts.lamps, lampMat, Math.max(counts[k], 1)),
    ]);
    const cc = new THREE.Color();
    this.cars.forEach((c, i) => this.fleet[c.model][0].setColorAt(c.slot, cc.set(colours[i])));
    this.fleet.flat().forEach((mesh, i) => {
      mesh.count = counts[Math.floor(i / 3)];
      mesh.frustumCulled = false;
      this.scene.add(mesh);
    });

    // --- River boats: tour boats with a glazed saloon.
    for (let i = 0; i < 4; i++) this.boats.push({ x: -60 + rand() * 120, dir: i % 2 ? 1 : -1, off: i % 2 ? 1.3 : -1.3, speed: 1.2 + rand() });
    const hull = slab(v2([[-0.9, -0.28], [0.6, -0.28], [0.95, 0], [0.6, 0.28], [-0.9, 0.28]]), 0.2).rotateX(-Math.PI / 2);
    const boatGeo = mergeGeometries([
      tint(hull, "#e9e5dc"),
      tint(new THREE.BoxGeometry(1.15, 0.17, 0.42).translate(-0.15, 0.285, 0), "#f4f1ea"),
      tint(new THREE.BoxGeometry(1.05, 0.08, 0.44).translate(-0.15, 0.29, 0), "#1b2530"),
      tint(new THREE.BoxGeometry(1.8, 0.03, 0.58).translate(-0.05, 0.06, 0), "#1f3a5a"),
    ])!;
    this.boatMesh = new THREE.InstancedMesh(boatGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }), this.boats.length);
    this.boatMesh.frustumCulled = false;
    this.scene.add(this.boatMesh);

    // --- Sky: dusk over London with drifting cloud and the first stars. Fog fades the city into its horizon.
    this.scene.fog = new THREE.FogExp2(this.shared.uHaze.value, FOG);
    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(1000, 48, 24),
      new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: this.shared, vertexShader: worldVert, fragmentShader: skyFrag }),
    );
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);

    this.beamLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 120).rotateX(-Math.PI / 2).translate(0, 0.06, 0),
      new THREE.MeshBasicMaterial({ color: "#fff1a0", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    this.scene.add(this.beamLine);

    // --- Scan beam: a wall of light across the city, sweeping along x.
    this.beam = new THREE.Mesh(
      new THREE.PlaneGeometry(96, 7).rotateY(Math.PI / 2).translate(0, 3.5, 0),
      new THREE.ShaderMaterial({
        vertexShader: uvVert,
        fragmentShader: beamFrag,
        uniforms: { uYellow: this.shared.uYellow, uAlpha: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.scene.add(this.beam);

    // --- Feelings cloud -> filter grid
    const N = opts.lite ? 900 : 1800;
    const pos = new Float32Array(N * 3);
    const grid = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const cols2 = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < N; i++) {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const r = 8 + Math.cbrt(rand()) * 16;
      pos.set([Math.sin(v) * Math.cos(u) * r * 1.4, 16 + Math.cos(v) * r * 0.5, Math.sin(v) * Math.sin(u) * r], i * 3);
      const gx = (i % cols2) - cols2 / 2;
      const gz = Math.floor(i / cols2) - cols2 / 2;
      grid.set([gx * 1.25, 14, gz * 1.0], i * 3);
      seed[i] = rand();
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pg.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
    pg.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    this.points = new THREE.Points(
      pg,
      new THREE.ShaderMaterial({
        vertexShader: pointsVert,
        fragmentShader: pointsFrag,
        uniforms: {
          uYellow: this.shared.uYellow,
          uTime: this.shared.uTime,
          uMorph: { value: 0 },
          uAlpha: { value: 0 },
          uSize: { value: 260 * this.renderer.getPixelRatio() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    // --- The chosen home: half fact, half estimate
    const P = this.focusPos;
    this.house = new THREE.Group();
    this.house.position.copy(P);
    const parts: THREE.BufferGeometry[] = [];
    const body = new THREE.BoxGeometry(focus.w, 1.25, focus.d);
    body.translate(0, 0.625, 0);
    parts.push(body);
    const roof = prism();
    roof.scale(focus.w, 1.1, focus.d);
    roof.translate(0, 1.25, 0);
    parts.push(roof);
    const chim = new THREE.BoxGeometry(0.22, 0.6, 0.22);
    chim.translate(-focus.w * 0.25, 1.65, -focus.d * 0.2);
    parts.push(chim);
    const bay = new THREE.BoxGeometry(focus.w * 0.4, 0.75, 0.3);
    bay.translate(-focus.w * 0.18, 0.4, focus.d / 2 + 0.15);
    parts.push(bay);
    const wall = new THREE.BoxGeometry(focus.w, 0.35, 0.06);
    wall.translate(0, 0.17, focus.d / 2 + 1.1);
    parts.push(wall);
    const solid = new THREE.MeshStandardMaterial({ color: "#35332d", roughness: 0.85, clippingPlanes: [this.clipSolid], emissive: YELLOW, emissiveIntensity: 0 });
    const accent = new THREE.MeshStandardMaterial({ color: "#ffd400", roughness: 0.6, clippingPlanes: [this.clipSolid], emissive: YELLOW, emissiveIntensity: 0.15 });
    this.solidMats = [solid, accent];
    this.wireMat = new THREE.LineDashedMaterial({ color: YELLOW, dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: 0, clippingPlanes: [this.clipWire] });
    parts.forEach((g, i) => {
      this.house.add(new THREE.Mesh(g, i === 3 ? accent : solid));
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), this.wireMat);
      e.computeLineDistances();
      this.house.add(e);
    });
    // Door and windows as flat yellow panels on the solid side.
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.55), accent);
    door.position.set(focus.w * 0.22, 0.28, focus.d / 2 + 0.005);
    this.house.add(door);
    this.scene.add(this.house);

    this.focusRing = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 1.78, 64).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: YELLOW, transparent: true, opacity: 0, depthWrite: false }),
    );
    this.focusRing.position.set(P.x, 0.02, P.z);
    this.scene.add(this.focusRing);

    // --- Commute: the portal's 1-mile circle against a 25-minute reach that follows roads and rail.
    this.commute = new THREE.Group();
    this.commute.position.set(P.x, 0.06, P.z);
    const toStation = Math.atan2(STATION.z - P.z, STATION.x - P.x);
    const reach = new THREE.Shape();
    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      const d = Math.atan2(Math.sin(a - toStation), Math.cos(a - toStation));
      const r = 4.6 + 2.2 * Math.pow(Math.abs(Math.cos(2 * a)), 8) + 17 * Math.exp(-Math.pow(d / 0.16, 2));
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (i === 0) reach.moveTo(x, z); else reach.lineTo(x, z);
    }
    const reachGeo = new THREE.ShapeGeometry(reach, 1).rotateX(Math.PI / 2);
    const fillMat = new THREE.MeshBasicMaterial({ color: YELLOW, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const edgeLine = new THREE.LineBasicMaterial({ color: YELLOW, transparent: true, opacity: 0 });
    this.commute.add(new THREE.Mesh(reachGeo, fillMat));
    this.commute.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(reach.getPoints().map((p) => new THREE.Vector3(p.x, 0.02, p.y))), edgeLine));
    const hub = new THREE.Mesh(new THREE.CircleGeometry(3.6, 48).rotateX(-Math.PI / 2), fillMat);
    hub.position.set(STATION.x - P.x, 0, STATION.z - P.z);
    this.commute.add(hub);
    const ringMat2 = new THREE.LineDashedMaterial({ color: "#f4f0e5", dashSize: 0.5, gapSize: 0.35, transparent: true, opacity: 0 });
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 7, 7).getPoints(96).map((p) => new THREE.Vector3(p.x, 0.03, p.y))), ringMat2);
    ring.computeLineDistances();
    this.commute.add(ring);
    this.commuteMats = [fillMat, edgeLine, ringMat2];
    this.commute.visible = false;
    this.scene.add(this.commute);

    // --- The enquiry leaving the house
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(P.x, 2.1, P.z),
      new THREE.Vector3(P.x, 9, P.z),
      new THREE.Vector3(P.x + 10, 16, P.z - 10),
      new THREE.Vector3(P.x + 26, 24, P.z - 34),
    );
    this.arc = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.06, 6), new THREE.MeshBasicMaterial({ color: YELLOW }));
    this.arc.geometry.setDrawRange(0, 0);
    this.scene.add(this.arc);
    this.arcHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: "#fff6c2" }));
    this.arcHead.visible = false;
    this.arcHead.userData.curve = curve;
    this.scene.add(this.arcHead);

    // --- London pin
    this.pin = new THREE.Group();
    const pinRingMat = new THREE.MeshBasicMaterial({ color: YELLOW, transparent: true, opacity: 0, depthWrite: false });
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.RingGeometry(1, 1.12, 96).rotateX(-Math.PI / 2), pinRingMat.clone());
      r.userData.phase = i / 3;
      this.pin.add(r);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8).translate(0, 7, 0), pinRingMat.clone());
    stem.userData.stem = true;
    this.pin.add(stem);
    this.pin.position.set(0, 0.05, riverZ(0));
    this.scene.add(this.pin);

    if (!opts.lite) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.22, 0.35, 0.98);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }
    this.resize();
  }

  /** Number of homes a demo query lights up, for the readout. */
  matches(query: number, narrow = 0) {
    const thr = 0.055 + (0.012 - 0.055) * narrow;
    return this.randsByQuery[query].filter((r) => r <= thr).length;
  }

  setQuery(q: number) { this.shared.uQuery.value = q; }
  get scanX() { return this.shared.uScanX; }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer?.setSize(w, h);
    this.bloom?.setSize(w / 2, h / 2);
    this.camera.aspect = w / h;
    // Portrait screens need the camera pulled back to keep the city in frame.
    this.lift = Math.min(Math.max(1.3 / this.camera.aspect, 1), 2.1);
    this.camera.updateProjectionMatrix();
  }

  /** Visitor drag: radians added to the scroll-driven camera. */
  look(yaw: number, pitch: number) { this.yaw = yaw; this.pitch = pitch; }

  /** The matched homes nearest the hero's view, for price tags. */
  spots(query: number, n = 5) {
    return this.homes
      .filter((h) => h.r[query] <= 0.055)
      .map((h) => ({ ...h, d: Math.hypot(h.x - 4, h.z - 2) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, n);
  }

  projectWorld(p: THREE.Vector3Like) {
    const v = new THREE.Vector3(p.x, p.y, p.z).project(this.camera);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight, behind: v.z > 1 };
  }

  /** Screen position (CSS px) of a point given relative to the chosen home. */
  project(local: THREE.Vector3Like) {
    const v = new THREE.Vector3(local.x, local.y, local.z).add(this.focusPos).project(this.camera);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight, behind: v.z > 1 };
  }

  render(state: SceneState, reduced: boolean) {
    this.clock.update();
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsed();
    this.shared.uTime.value = t;

    // Ease toward the scroll-driven state so camera flights stay fluid.
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.8);
    if (!this.cur) this.cur = { ...state };
    const c = this.cur;
    (Object.keys(state) as (keyof SceneState)[]).forEach((key) => { c[key] += (state[key] - c[key]) * k; });

    this.target.set(c.tx, c.ty, c.tz);
    const off = new THREE.Vector3(c.cx - c.tx, c.cy - c.ty, c.cz - c.tz).multiplyScalar(this.lift);
    if (!reduced) off.applyAxisAngle(new THREE.Vector3(0, 1, 0), c.orbit * 0.32 * Math.sin(t * 0.09));
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3().crossVectors(off, new THREE.Vector3(0, 1, 0)).normalize();
    off.applyAxisAngle(right, this.pitch);
    if (off.y < 1.5) off.y = 1.5;
    this.curPos.copy(this.target).add(off);
    this.camera.position.copy(this.curPos);
    this.curTarget.copy(this.target);
    this.camera.lookAt(this.curTarget);

    this.shared.uScan.value = c.scan;
    this.shared.uDim.value = c.dim;
    this.shared.uNarrow.value = c.narrow;
    this.shared.uFocus.value = c.focus;
    const sx = this.shared.uScanX.value;
    const beamX = sx < 60 ? sx : ((t * 7) % 124) - 62;
    this.shared.uBeamX.value = beamX;
    this.beam.position.x = beamX;
    this.beamLine.position.x = beamX;
    this.beamLine.material.opacity = c.scan;
    this.beam.material.uniforms.uAlpha.value = c.scan;
    // One turn every two minutes: slow, like the real thing, but visibly moving.
    if (!reduced) this.wheel.rotation.z -= dt * 0.052;
    this.sky.position.copy(this.camera.position);
    // The primary school lights up once the first query's scan has crossed it.
    const lit = this.shared.uQuery.value === 0 && sx > SCHOOL.x ? 1 : 0;
    this.schoolLit += (lit - this.schoolLit) * Math.min(dt * 4, 1);
    this.schoolMat.opacity = 0.1 + 0.85 * this.schoolLit * c.school;
    this.columnsMat.uniforms.uFade.value = 1 - c.dim * 0.8;

    const pm = this.points.material.uniforms;
    pm.uAlpha.value = c.cloud;
    pm.uMorph.value = c.morph;
    this.points.visible = c.cloud > 0.01;

    // The chosen home: glow when chosen, split into fact and estimate when examined.
    const P = this.focusPos.x;
    this.clipSolid.constant = P + (1 - c.wire) * 10;
    this.clipWire.constant = -P + (1 - c.wire) * 10;
    this.wireMat.opacity = c.wire;
    this.shared.uClear.value = c.wire;
    this.solidMats[0].emissiveIntensity = c.focus * (0.9 - 0.65 * c.wire);
    this.solidMats[0].color.copy(HOUSE_SOLID).lerp(YELLOW, c.focus);
    this.focusRing.material.opacity = c.focus * (1 - c.wire) * (0.6 + 0.4 * Math.sin(t * 3));

    const arcCount = this.arc.geometry.index!.count;
    this.arc.geometry.setDrawRange(0, Math.floor(arcCount * c.arc / 6) * 6);
    this.arc.visible = c.arc > 0.005;
    this.arcHead.visible = c.arc > 0.01 && c.arc < 0.995;
    if (this.arcHead.visible) this.arcHead.position.copy((this.arcHead.userData.curve as THREE.Curve<THREE.Vector3>).getPoint(c.arc));

    this.pin.visible = c.pin > 0.01;
    this.pin.children.forEach((r) => {
      const mat = (r as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (r.userData.stem) { mat.opacity = c.pin * 0.9; return; }
      const p = (t * 0.35 + r.userData.phase) % 1;
      r.scale.setScalar(1 + p * 22);
      mat.opacity = c.pin * (1 - p) * 0.8;
    });

    // Traffic keeps moving; cars rise onto bridge decks over the river.
    const e = new THREE.Euler();
    const mq = new THREE.Quaternion();
    const mp = new THREE.Vector3();
    const mm = new THREE.Matrix4();
    const one = new THREE.Vector3(1, 1, 1);
    this.cars.forEach((car) => {
      const dir = car.lane > 0 ? 1 : -1;
      car.t += car.speed * dir * dt * (reduced ? 0 : 1);
      if (car.t > car.max) car.t = car.min; else if (car.t < car.min) car.t = car.max;
      if (car.axis === "x") {
        mp.set(car.t, 0, car.line + car.lane);
        e.set(0, dir > 0 ? 0 : Math.PI, 0, "YZX");
      } else {
        const d = Math.abs(car.t - riverZ(car.line));
        const y = deckY(d);
        const climb = (deckY(Math.abs(car.t + dir * 0.05 - riverZ(car.line))) - y) / 0.05;
        mp.set(car.line + car.lane, y, car.t);
        e.set(0, dir > 0 ? -Math.PI / 2 : Math.PI / 2, Math.atan(climb), "YZX");
      }
      mm.compose(mp, mq.setFromEuler(e), one);
      for (const mesh of this.fleet[car.model]) mesh.setMatrixAt(car.slot, mm);
    });
    for (const mesh of this.fleet.flat()) mesh.instanceMatrix.needsUpdate = true;
    this.boats.forEach((b, i) => {
      b.x += b.speed * b.dir * dt * (reduced ? 0 : 1);
      if (b.x > 62) b.x = -62; else if (b.x < -62) b.x = 62;
      const z = riverZ(b.x) + b.off;
      const slope = (riverZ(b.x + 0.5) - riverZ(b.x - 0.5));
      mp.set(b.x, 0.02, z);
      mm.compose(mp, mq.setFromEuler(e.set(0, -Math.atan(slope), 0)), one);
      this.boatMesh.setMatrixAt(i, mm);
    });
    this.boatMesh.instanceMatrix.needsUpdate = true;

    this.commute.visible = c.commute > 0.01;
    if (this.commute.visible) {
      const g = Math.min(c.commute * 1.4, 1);
      this.commute.children.forEach((o, i) => { if (i < 3) o.scale.setScalar(0.05 + 0.95 * g); });
      (this.commuteMats[0] as THREE.MeshBasicMaterial).opacity = 0.2 * c.commute;
      (this.commuteMats[1] as THREE.LineBasicMaterial).opacity = c.commute;
      (this.commuteMats[2] as THREE.LineDashedMaterial).opacity = Math.min(c.commute * 2, 1) * 0.9;
    }

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.composer?.dispose();
  }
}
