// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft light for the scene
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

// Add Racing Track (Centered)
const trackTexture = new THREE.TextureLoader().load('./textures/road.jpg', (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // Enable tiling
  texture.repeat.set(1,10); // Repeat texture vertically
});

const trackMaterial = new THREE.MeshStandardMaterial({ map: trackTexture });
const trackGeometry = new THREE.PlaneGeometry(30, 500); // Road width of 30 units
const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
scene.add(track);

// Add Grass on Both Sides
const grassTexture = new THREE.TextureLoader().load('./textures/grass.jpg', (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // Enable tiling
  texture.repeat.set(20, 30); // Repeat texture for large coverage
});

const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
const grassGeometry = new THREE.PlaneGeometry(210, 500); // Grass width of 210 units on each side

const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
leftGrass.position.x = -120; // Positioned left of the road
leftGrass.rotation.x = -Math.PI / 2;
scene.add(leftGrass);

const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
rightGrass.position.x = 120; // Positioned right of the road
rightGrass.rotation.x = -Math.PI / 2;
scene.add(rightGrass);

// Load the F1 Car Model
const loader = new THREE.GLTFLoader();
let car;
// Joystick Elements
const joystickContainer = document.createElement('div');
joystickContainer.style.position = 'absolute';
joystickContainer.style.bottom = '20px';
joystickContainer.style.left = '50%';
joystickContainer.style.transform = 'translateX(-50%)';
joystickContainer.style.display = 'flex';
joystickContainer.style.gap = '10px';
joystickContainer.style.zIndex = '10';

const createButton = (text) => {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.style.width = '50px';
  button.style.height = '50px';
  button.style.backgroundColor = '#555';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '50%';
  button.style.fontSize = '16px';
  button.style.display = 'flex';
  button.style.justifyContent = 'center';
  button.style.alignItems = 'center';
  button.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';
  button.style.cursor = 'pointer';
  button.style.userSelect = 'none';
  return button;
};

// Create buttons
const upButton = createButton('▲');
const downButton = createButton('▼');
const leftButton = createButton('◀');
const rightButton = createButton('▶');

// Arrange joystick layout
const verticalContainer = document.createElement('div');
verticalContainer.style.display = 'flex';
verticalContainer.style.flexDirection = 'column';
verticalContainer.style.gap = '10px';
verticalContainer.appendChild(upButton);
verticalContainer.appendChild(downButton);

joystickContainer.appendChild(leftButton);
joystickContainer.appendChild(verticalContainer);
joystickContainer.appendChild(rightButton);

document.body.appendChild(joystickContainer);

// Joystick Controls
upButton.addEventListener('mousedown', () => (moveForward = true));
upButton.addEventListener('mouseup', () => (moveForward = false));
upButton.addEventListener('touchstart', () => (moveForward = true));
upButton.addEventListener('touchend', () => (moveForward = false));

downButton.addEventListener('mousedown', () => (moveBackward = true));
downButton.addEventListener('mouseup', () => (moveBackward = false));
downButton.addEventListener('touchstart', () => (moveBackward = true));
downButton.addEventListener('touchend', () => (moveBackward = false));

leftButton.addEventListener('mousedown', () => (moveLeft = true));
leftButton.addEventListener('mouseup', () => (moveLeft = false));
leftButton.addEventListener('touchstart', () => (moveLeft = true));
leftButton.addEventListener('touchend', () => (moveLeft = false));

rightButton.addEventListener('mousedown', () => (moveRight = true));
rightButton.addEventListener('mouseup', () => (moveRight = false));
rightButton.addEventListener('touchstart', () => (moveRight = true));
rightButton.addEventListener('touchend', () => (moveRight = false));

const loadingContainer = document.getElementById('loading-container');

loader.load(
  './models/car/f1-car.glb', // Path to your F1 car model
  (gltf) => {
    car = gltf.scene;
    car.scale.set(1.5, 1.5, 1.5);
    car.rotation.y = Math.PI;
    car.position.set(0, 1, 0);
    scene.add(car);

    // Remove the loading screen after the car model is loaded
    loadingContainer.style.display = 'none';
  },
  undefined,
  (error) => {
    console.error('Error loading model:', error);
    loadingContainer.style.display = 'none'; // Hide loading screen even if there's an error
  }
);


// Add Obstacles
const obstacleGeometry = new THREE.BoxGeometry(2, 2, 2);
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const obstacles = [];

function createObstacle() {
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
  obstacle.position.set(
    (Math.random() * 18) - 9, // Random position within the track width
    1,
    -250 // Start far down the track
  );
  obstacles.push(obstacle);
  scene.add(obstacle);
}

// Create obstacles at regular intervals
setInterval(() => {
  createObstacle();
}, 2000); // New obstacle every 2 seconds

// Camera Position
camera.position.set(0, 20, 20); // Adjusted for a better top-down view
camera.lookAt(0, 0, 0); // Focused on the car

// Track the distance traveled and game state
let distanceTravelled = 0;
let gameOver = false;

// Display distance and game status
const distanceDisplay = document.createElement('div');
distanceDisplay.style.position = 'absolute';
distanceDisplay.style.top = '10px';
distanceDisplay.style.left = '10px';
distanceDisplay.style.fontSize = '16px';
distanceDisplay.style.color = 'white';
distanceDisplay.style.zIndex = '10'; // Ensure it's on top
distanceDisplay.style.textShadow = '1px 1px 2px black';
document.body.appendChild(distanceDisplay);

function updateUI() {
  if (gameOver) {
    distanceDisplay.innerHTML = `Game Over! Distance Travelled: ${Math.floor(distanceTravelled)} units`;
  } else {
    distanceDisplay.innerHTML = `Distance Travelled: ${Math.floor(distanceTravelled)} units`;
  }
}

// Handle Keyboard Input for Car Movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

document.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowUp') moveForward = true;
  if (event.code === 'ArrowDown') moveBackward = true;
  if (event.code === 'ArrowLeft') moveLeft = true;
  if (event.code === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowUp') moveForward = false;
  if (event.code === 'ArrowDown') moveBackward = false;
  if (event.code === 'ArrowLeft') moveLeft = false;
  if (event.code === 'ArrowRight') moveRight = false;
});

// Add Touch Input for Mobile Screens
document.addEventListener('touchstart', (event) => {
  const touchX = event.touches[0].clientX / window.innerWidth;
  const touchY = event.touches[0].clientY / window.innerHeight;

  if (touchY < 0.5) moveForward = true;
  if (touchY > 0.5) moveBackward = true;
  if (touchX < 0.5) moveLeft = true;
  if (touchX > 0.5) moveRight = true;
});

document.addEventListener('touchend', () => {
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
});

// Handle window resize to maintain aspect ratio and renderer size
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// GLTFLoader instance (shared)
const fuelTanks = []; // Array to store fuel tanks

// Function to create a new fuel tank
function createFuelTank() {
  // Load the .gltf model
  loader.load(
    './models/fuel/fuel.gltf', // Path to the fuel tank .gltf file
    (gltf) => {
      // Access the loaded model
      const fuelTank = gltf.scene;

      // Set a random position for the fuel tank within track width
      fuelTank.position.set(
        (Math.random() * 18) - 9, // Random x position within track width
        0, // y position (height)
        -250 // z position (start far down the track)
      );

      // Scale the model to the appropriate size
      fuelTank.scale.set(0.8, 1, 1); // Adjust scaling as necessary

      // Add shininess to the material of the model
      fuelTank.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xff0000, // Bright red color
            roughness: 0, // Smooth surface for shininess
            metalness: 0.8, // High metalness for shiny look
          });
        }
      });

      // Add rotation behavior
      fuelTank.userData.rotationSpeed = 0.02; // Rotation speed

      console.log(`Created fuel tank at: x=${fuelTank.position.x}, z=${fuelTank.position.z}`); // Log creation

      // Add the fuel tank to the array and the scene
      fuelTanks.push(fuelTank);
      scene.add(fuelTank);
    },
    undefined, // Optional onProgress callback
    (error) => {
      console.error('Error loading fuel.gltf:', error); // Log errors
    }
  );
}

// Periodically create fuel tanks
setInterval(() => {
  if (!gameOver) {
    createFuelTank();
  }
}, 4000); // New fuel tank every 3 seconds

// Animate the fuel tanks (add this to your animation loop)
function animateFuelTanks() {
  fuelTanks.forEach((fuelTank) => {
    // Rotate the tank around the Y-axis
    fuelTank.rotation.y += fuelTank.userData.rotationSpeed;
  });
}

// Move fuel tanks toward the player
function moveFuelTanks() {
  fuelTanks.forEach((fuelTank, index) => {
    fuelTank.position.z += 0.5; // Move the fuel tank towards the player

    // Remove fuel tank if it moves out of view
    if (fuelTank.position.z > 30) {
      scene.remove(fuelTank);
      fuelTanks.splice(index, 1); // Remove it from the array
    }
  });
}
// Fuel Mechanism
let fuel = 100; // Start with full fuel
const fuelConsumptionRate = 0.05; // Decrease fuel over time
const fuelCollectionBonus = 20; // Fuel gained when the car collects a fuel tank

// Update the UI with fuel level
const fuelDisplay = document.createElement('div');
fuelDisplay.style.position = 'absolute';
fuelDisplay.style.top = '40px';
fuelDisplay.style.left = '10px';
fuelDisplay.style.fontSize = '16px';
fuelDisplay.style.color = 'white';
fuelDisplay.style.zIndex = '10';
fuelDisplay.style.textShadow = '1px 1px 2px black';
document.body.appendChild(fuelDisplay);

function updateFuelUI() {
  fuelDisplay.innerHTML = `Fuel: ${Math.max(fuel, 0).toFixed(1)}%`;
}

// Check collision with fuel tanks
function checkFuelTankCollision() {
  fuelTanks.forEach((fuelTank, index) => {
    // Adjust collision detection range based on car and fuel tank size
    const distanceX = Math.abs(car.position.x - fuelTank.position.x);
    const distanceZ = Math.abs(car.position.z - fuelTank.position.z);

    // Define an effective collision radius for both the car and the fuel tank
    const collisionThreshold = 2; // Adjust based on your car/fuel tank size

    if (distanceX < collisionThreshold && distanceZ < collisionThreshold) {
      console.log('Fuel Collected!');
      fuel = Math.min(fuel + fuelCollectionBonus, 100); // Collect fuel, but max out at 100%
      scene.remove(fuelTank); // Remove fuel tank after collection
      fuelTanks.splice(index, 1); // Remove from the array
    }
  });
}


// Update fuel over time (reduce fuel as the game progresses)
function updateFuel() {
  if (gameOver) return;
  if (fuel > 0) {
    fuel -= fuelConsumptionRate; // Consume fuel gradually
  } else {
    gameOver = true; // End the game if out of fuel
  }
}

function animate() {
  if (gameOver) return; // Stop the game if it's over

  requestAnimationFrame(animate);

  distanceTravelled += 0.03; // Increment distance when moving forward
  if (car) {
    // Move the car based on key or touch inputs
    if (moveForward) {
      car.position.z -= 0.5;
    }
    if (moveBackward) car.position.z += 0.5;
    if (moveLeft) car.position.x -= 0.2;
    if (moveRight) car.position.x += 0.2;

    // Keep the car within the track boundaries
    car.position.x = Math.max(Math.min(car.position.x, 9), -9); // Stay within the road width
    car.position.z = Math.min(Math.max(car.position.z, -40), 15); // Prevent moving too far forward or backward
  }

  // Move obstacles toward the player
  obstacles.forEach((obstacle, index) => {
    obstacle.position.z += 0.5;

    // Check for collision with the car
    if (
      car &&
      Math.abs(car.position.x - obstacle.position.x) < 2 &&
      Math.abs(car.position.z - obstacle.position.z) < 2
    ) {
      console.log('Collision detected!');
      gameOver = true; // End the game
    }

    // Remove obstacles that move out of view
    if (obstacle.position.z > 30) {
      scene.remove(obstacle);
      obstacles.splice(index, 1);
    }
  });

  // Animate fuel tanks
  animateFuelTanks();

  // Move fuel tanks toward the player (newly added)
  moveFuelTanks();

  // Check for collision with fuel tanks
  checkFuelTankCollision();

  // Update fuel
  updateFuel();

  // Update the UI with the current distance, fuel, and game status
  updateUI();
  updateFuelUI();

  // Render the scene
  renderer.render(scene, camera);
}

animate();
