import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CONFIG } from './config.js';
import { createScene, setupLighting, createTrackAndTerrain } from './sceneSetup.js';
import { setupKeyboardControls, createJoystickControls } from './controlsModule.js';
import { createObstacle, createFuelTank } from './gameObjects.js';
import { createDistanceDisplay, createFuelDisplay } from './uiManager.js';
import { setupGameLoop } from './gameLogic.js';
import { ModelLoader } from './modelLoader.js';
import { setupWindowResizeHandler, setupLoadingScreen } from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  showStartButton(); // Show Start Button first
});

export function showStartButton() {
  const startButton = document.getElementById('start-button');
  const loadingScreen = document.getElementById('loading-container');
  const joystick = document.getElementById('joystick');

  // Ensure correct initial visibility
  if (startButton) startButton.style.display = 'block'; // Show Start Button
  if (loadingScreen) loadingScreen.style.display = 'none'; // Hide Loading Screen
  if (joystick) joystick.style.display = 'none'; // Hide Joystick

  startButton.addEventListener('click', async () => {
    startButton.style.display = 'none'; // Hide Start Button
    if (loadingScreen) loadingScreen.style.display = 'flex'; // Show Loading Screen

    await initializeGame();
  });
}

export async function initializeGame() {
  const { scene, camera, renderer } = createScene();
  setupLighting(scene);
  const { road, leftGrass, rightGrass, stadiums } = createTrackAndTerrain(scene);

  const controls = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false };
  setupKeyboardControls(controls);

  const distanceDisplay = createDistanceDisplay();
  const fuelDisplay = createFuelDisplay();

  const loader = new GLTFLoader();
  const modelLoader = new ModelLoader(loader);

  const { showLoading, hideLoading } = setupLoadingScreen();
  showLoading(); // Show Loading Animation

  try {
    const car = await modelLoader.loadCar('./models/car/rc-10.glb');
    scene.add(car);

    createJoystickControls(controls); // Joystick will be created, but remains hidden

    const gameState = setupGameLoop(scene, camera, renderer, car, controls, distanceDisplay, fuelDisplay, road, leftGrass, rightGrass, stadiums);

    const obstacleSpawner = setInterval(() => {
      if (!gameState.gameOver) {
        createObstacle(scene, loader).then((obstacle) => {
          gameState.addObstacle(obstacle);
        }).catch(error => console.error('Obstacle loading failed', error));
      }
    }, CONFIG.OBSTACLE_SPAWN_INTERVAL);

    const fuelTankSpawner = setInterval(() => {
      if (!gameState.gameOver) {
        createFuelTank(scene, loader).then((fuelTank) => {
          gameState.addFuelTank(fuelTank);
        }).catch(error => console.error('Fuel tank loading failed', error));
      }
    }, CONFIG.FUEL_SPAWN_INTERVAL);

    const cleanupResize = setupWindowResizeHandler(camera, renderer);

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    hideLoading(); // Hide Loading Screen

    // ✅ Now show the joystick after loading is done
    const joystick = document.getElementById('joystick');
    if (joystick) joystick.style.display = 'block';

    return {
      scene, camera, renderer, gameState,
      cleanupSpawners: () => {
        clearInterval(obstacleSpawner);
        clearInterval(fuelTankSpawner);
        cleanupResize();
      }
    };
  } catch (error) {
    console.error('Game initialization failed:', error);
    hideLoading();
    throw error;
  }
}

export function showRestartButton() {
  const restartButton = document.getElementById('restart-button');
  restartButton.style.display = 'block';

  restartButton.onclick = () => {
    location.reload();
  };
}
