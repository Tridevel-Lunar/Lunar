import * as THREE from "three";

/** Module-level texture cache — scenes can swap without re-downloading. */

const PLANET_BASE = "https://threejs.org/examples/textures/planets/";

export const EARTH_DAY_URL = `${PLANET_BASE}earth_day_4096.jpg`;
export const EARTH_NIGHT_URL = `${PLANET_BASE}earth_night_4096.jpg`;
export const EARTH_BUMP_URL = `${PLANET_BASE}earth_bump_roughness_clouds_4096.jpg`;
export const SUN_TEXTURE_URL = "https://www.solarsystemscope.com/textures/download/2k_sun.jpg";
export const STARMAP_URL =
  "https://svs.gsfc.nasa.gov/vis/a000000/a003500/a003572/TychoSkymapII.t3_08192x04096.jpg";

const cache = new Map<string, THREE.Texture>();

function getTexture(url: string, srgb = false): THREE.Texture {
  let tex = cache.get(url);
  if (!tex) {
    tex = new THREE.TextureLoader().load(url);
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    cache.set(url, tex);
  }
  return tex;
}

export function loadEarthTextures(): {
  dayTex: THREE.Texture;
  nightTex: THREE.Texture;
  bumpTex: THREE.Texture;
} {
  return {
    dayTex: getTexture(EARTH_DAY_URL, true),
    nightTex: getTexture(EARTH_NIGHT_URL, true),
    bumpTex: getTexture(EARTH_BUMP_URL),
  };
}

export function loadSunTexture(): THREE.Texture {
  return getTexture(SUN_TEXTURE_URL, true);
}

export function loadStarmapTexture(): THREE.Texture {
  return getTexture(STARMAP_URL, true);
}
