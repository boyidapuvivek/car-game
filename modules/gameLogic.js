import { CONFIG } from './config.js';
import { updateDistanceDisplay, updateFuelDisplay } from './uiManager.js';
import { updateObstacleRotation } from './gameObjects.js';
import { showRestartButton } from './main.js';

export class GameState {
  constructor(scene, car, road, leftGrass, rightGrass, stadiums) {
    this.scene = scene;
    this.car = car;
    this.road = road;
    this.leftGrass = leftGrass;
    this.rightGrass = rightGrass;
    this.stadiums = stadiums;
    this.distanceTravelled = 0;
    this.gameOver = false;
    this.fuel = CONFIG.INITIAL_FUEL;
    this.obstacles = [];
    this.fuelTanks = [];
    this.isCarSoundPlaying = false;

    // Load sounds
    this.carSound = new Audio('audio/car.mp3');
    this.crashSound = new Audio('audio/car-crash.mp3');
    this.collectFuelSound = new Audio('audio/collect-fuel.mp3');

    // Correctly position the road and grass to cover the entire visible area
    this.road.position.z = -CONFIG.TRACK_LENGTH / 2 + 30; // Shift road closer to camera
    this.leftGrass.position.z = -CONFIG.TRACK_LENGTH / 2 + 30;
    this.rightGrass.position.z = -CONFIG.TRACK_LENGTH / 2 + 30;

    // Start car sound when the game begins
    this.carSound.loop = true; // Loop the car sound
    this.carSound.play();
    this.isCarSoundPlaying = true;
  }

  updateCarMovement(controls) {
    if (!this.car) return;

    let carMoving = false;

    if (controls.moveForward) {
      this.car.position.z -= 0.2;
      carMoving = true;
    }
    if (controls.moveBackward) {
      this.car.position.z += 0.2;
      carMoving = true;
    }
    if (controls.moveLeft) {
      this.car.position.x -= 0.15;
      carMoving = true;
    }
    if (controls.moveRight) {
      this.car.position.x += 0.15;
      carMoving = true;
    }

    if (!carMoving && this.isCarSoundPlaying) {
      // Stop the car sound when the car stops moving
      this.isCarSoundPlaying = false;
    }

    this.car.position.x = Math.max(Math.min(this.car.position.x, 6), -6);
    this.car.position.z = Math.min(Math.max(this.car.position.z, -35), 6);
  }

  moveEnvironment(speed) {
    // Move road and grass
    this.road.position.z += speed;
    this.leftGrass.position.z += speed;
    this.rightGrass.position.z += speed;

    // Reset road and grass position if they move past the car
    if (this.road.position.z > 30) {
      this.road.position.z = -CONFIG.TRACK_LENGTH / 2;
    }
    if (this.leftGrass.position.z > 30) {
      this.leftGrass.position.z = -CONFIG.TRACK_LENGTH / 2;
    }
    if (this.rightGrass.position.z > 30) {
      this.rightGrass.position.z = -CONFIG.TRACK_LENGTH / 2;
    }
  }

  moveObstacles() {
    this.obstacles.forEach((obstacle, index) => {
      obstacle.position.z += 0.6;

      // Rotate the obstacle
      updateObstacleRotation(obstacle);

      if (this.checkObstacleCollision(obstacle)) {
        this.gameOver = true;
        this.carSound.pause(); // Stop car sound immediately upon crash
        this.crashSound.play();
      }

      if (obstacle.position.z > 20) {
        this.scene.remove(obstacle);
        this.obstacles.splice(index, 1);
      }
    });
  }

  checkObstacleCollision(obstacle) {
    return this.car &&
      Math.abs(this.car.position.x - obstacle.position.x) < 3 &&
      Math.abs(this.car.position.z - obstacle.position.z) < 3;
  }

  moveFuelTanks() {
    this.fuelTanks.forEach((fuelTank, index) => {
      fuelTank.position.z += 0.6;
      fuelTank.rotation.y += fuelTank.userData.rotationSpeed;

      if (fuelTank.position.z > 20) {
        this.scene.remove(fuelTank);
        this.fuelTanks.splice(index, 1);
      }
    });
  }

  checkFuelTankCollision(distanceDisplay, fuelDisplay) {
    this.fuelTanks.forEach((fuelTank, index) => {
      const distanceX = Math.abs(this.car.position.x - fuelTank.position.x);
      const distanceZ = Math.abs(this.car.position.z - fuelTank.position.z);

      if (distanceX < CONFIG.COLLISION_THRESHOLD && distanceZ < CONFIG.COLLISION_THRESHOLD) {
        this.fuel = Math.min(this.fuel + CONFIG.FUEL_COLLECTION_BONUS, 100);
        this.scene.remove(fuelTank);
        this.fuelTanks.splice(index, 1);
        updateFuelDisplay(fuelDisplay, this.fuel);
        this.collectFuelSound.play();
      }
    });
  }

  updateGameState(controls, distanceDisplay, fuelDisplay) {
    if (this.gameOver) {
      if (this.isCarSoundPlaying) {
        this.carSound.pause(); // Stop car sound when the game is over
        this.isCarSoundPlaying = false;
      }
      return false;
    }
  
    this.distanceTravelled += 0.02;
    this.updateCarMovement(controls);
    
    // Consume fuel
    if (this.fuel > 0) {
      this.fuel -= CONFIG.FUEL_CONSUMPTION_RATE;
    } else {
      this.gameOver = true;
      this.carSound.pause(); // Stop car sound when the game runs out of fuel
    }
  
    // Update UI displays
    updateDistanceDisplay(distanceDisplay, this.distanceTravelled, this.gameOver);
    updateFuelDisplay(fuelDisplay, this.fuel);
  
    return !this.gameOver;
  }
  

  addObstacle(obstacle) {
    this.obstacles.push(obstacle);
  }

  addFuelTank(fuelTank) {
    this.fuelTanks.push(fuelTank);
  }
}

export function setupGameLoop(scene, camera, renderer, car, controls, distanceDisplay, fuelDisplay, road, leftGrass, rightGrass) {
  const gameState = new GameState(scene, car, road, leftGrass, rightGrass);

  // Show the UI elements once the game starts
  distanceDisplay.style.display = 'block';
  fuelDisplay.style.display = 'block';

  function animate() {
    if (!gameState.gameOver) {
      requestAnimationFrame(animate);

      // Move environment
      gameState.moveEnvironment(0.6);

      // Move game objects
      gameState.moveObstacles();
      gameState.moveFuelTanks();

      // Check collisions
      gameState.checkFuelTankCollision(distanceDisplay, fuelDisplay);

      // Update game state
      const continueGame = gameState.updateGameState(
        controls, 
        distanceDisplay, 
        fuelDisplay
      );

      if (!continueGame) {
        console.log('Game Over!');
        showRestartButton();  // Show Restart Button on game over
      }

      // Render the scene
      renderer.render(scene, camera);
    }
  }

  animate();

  return gameState;
}
