
import * as THREE from 'three';

// Create obstacle by loading a GLB file
export function createObstacle(scene, loader) {
  const obstaclePath = Math.floor(Math.random() * 3) + 1;
  return new Promise((resolve, reject) => {
    loader.load(
      `./models/obstacle/${obstaclePath}.glb`,
      (gltf) => {
        const obstacle = gltf.scene;
        
        // Randomize position for the obstacle
        obstacle.position.set(
          (Math.random() * 10) - 5,  // X-axis position between -9 and 9
          0,                         // Y-axis position on the ground (adjust as needed)
          -250                        // Z-axis behind the camera
        );
        // obstacle.scale.set(1, 1, 1);
        // obstacle.rotation.y = 1.5;
        if(obstaclePath === 3 ){
          obstacle.scale.set(0.02, 0.02, 0.02);
          obstacle.rotation.y = 1.5;
        }
        else if(obstaclePath === 2){
           obstacle.scale.set(0.8, 0.8, 0.8); // Adjust size as necessary
           obstacle.rotation.y = -1.6;
        }
        else{
           obstacle.scale.set(4, 4, 4); // Adjust size as necessary
           obstacle.rotation.y = 1.5;
        }

        // Add the obstacle to the scene
        scene.add(obstacle);
        
        // Resolve the promise with the loaded obstacle
        resolve(obstacle);
      },
      undefined,  // Progress callback (optional, not needed for now)
      (error) => { // Error callback
        console.error('Error loading obstacles.glb:', error);
        reject(error);
      }
    );
  });
}

// Function to update the obstacle's rotation (use in the game loop)
export function updateObstacleRotation(obstacle) {
  if (obstacle && obstacle.userData.rotationSpeed) {
    obstacle.rotation.y += obstacle.userData.rotationSpeed;
  }
}

// Function to create a fuel tank (keep this as is, if needed)
export function createFuelTank(scene, loader) {
  return new Promise((resolve, reject) => {
    loader.load(
      './models/fuel/fuel.gltf',
      (gltf) => {
        const fuelTank = gltf.scene;
        
        fuelTank.position.set(
          (Math.random() * 12) - 5,  // Random X position
          1,                         // Y position (on the ground)
          -250                        // Z position (behind the camera)
        );
        
        fuelTank.scale.set(0.8, 1, 1); // Adjust size of the fuel tank
        
        fuelTank.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xff0000,  // Fuel tank color (can be customized)
              roughness: 0.1,
              metalness: 0.8,
            });
          }
        });
        
        fuelTank.userData.rotationSpeed = 0.02;
        
        scene.add(fuelTank);
        resolve(fuelTank);
      },
      undefined,
      (error) => {
        console.error('Error loading fuel.gltf:', error);
        reject(error);
      }
    );
  });
}
