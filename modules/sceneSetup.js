import * as THREE from 'three';
import { CONFIG } from './config.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x008000); // Green background
  
  const camera = new THREE.PerspectiveCamera(
    CONFIG.CAMERA_FOV, 
    window.innerWidth / window.innerHeight, 
    CONFIG.CAMERA_NEAR, 
    CONFIG.CAMERA_FAR
  );
  camera.position.set(0, 20, 20); // Adjusted for better view
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true 
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  return { scene, camera, renderer };
}

export function setupLighting(scene) {
  // Ambient light for overall scene illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // Directional light for shadows and depth
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // Hemisphere light for more natural color gradient
  const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
  scene.add(hemisphereLight);
}

export function createTrackAndTerrain(scene) {
  const textureLoader = new THREE.TextureLoader();

  // Road texture
  const roadTexture = textureLoader.load('./textures/road.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 500);
  });

  // Grass texture
  const grassTexture = textureLoader.load('./textures/grass.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 100);
  });

  // Road material (darkened)
  const roadMaterial = new THREE.MeshStandardMaterial({ 
    map: roadTexture,
    roughness: 0.8,
    metalness: 0.2,
    color: new THREE.Color(0x777777) // Darker shade for road
  });

  // Grass material (darkened)
  const grassMaterial = new THREE.MeshStandardMaterial({ 
    map: grassTexture,
    roughness: 0.9,
    metalness: 0.1,
    color: new THREE.Color(0x6e8b3d) // Darker shade for grass
  });

  // Road geometry
  const roadGeometry = new THREE.PlaneGeometry(CONFIG.TRACK_WIDTH, CONFIG.TRACK_LENGTH);
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  road.position.z = -CONFIG.TRACK_LENGTH / 2; // Position the road
  scene.add(road);

  // Left grass
  const leftGrassGeometry = new THREE.PlaneGeometry(CONFIG.GRASS_WIDTH, CONFIG.TRACK_LENGTH);
  const leftGrass = new THREE.Mesh(leftGrassGeometry, grassMaterial);
  leftGrass.position.x = -CONFIG.TRACK_WIDTH - leftGrassGeometry.parameters.width / 2 + 9;
  leftGrass.rotation.x = -Math.PI / 2;
  leftGrass.position.z = -CONFIG.TRACK_LENGTH / 2; // Position the grass
  scene.add(leftGrass);

  // Right grass
  const rightGrass = new THREE.Mesh(leftGrassGeometry, grassMaterial);
  rightGrass.position.x = CONFIG.TRACK_WIDTH + leftGrassGeometry.parameters.width / 2 - 9;
  rightGrass.rotation.x = -Math.PI / 2;
  rightGrass.position.z = -CONFIG.TRACK_LENGTH / 2; // Position the grass
  scene.add(rightGrass);

  return { road, leftGrass, rightGrass };
}