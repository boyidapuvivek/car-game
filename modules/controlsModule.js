export function setupKeyboardControls(controls) {
  function handleKeyDown(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        controls.moveForward = true;
        break;
      case "ArrowDown":
      case "KeyS":
        controls.moveBackward = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        controls.moveLeft = true;
        break;
      case "ArrowRight":
      case "KeyD":
        controls.moveRight = true;
        break;
    }
  }

  function handleKeyUp(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        controls.moveForward = false;
        break;
      case "ArrowDown":
      case "KeyS":
        controls.moveBackward = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        controls.moveLeft = false;
        break;
      case "ArrowRight":
      case "KeyD":
        controls.moveRight = false;
        break;
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

export function createJoystickControls(controls) {
  const joystickContainer = document.createElement("div");
  joystickContainer.style.position = "absolute";
  joystickContainer.style.bottom = "50px";
  joystickContainer.style.left = "50%";
  joystickContainer.style.transform = "translateX(-50%)";
  joystickContainer.style.zIndex = "10";

  // Function to update joystick size based on window width
  function updateJoystickSize() {
    const screenWidth = window.innerWidth;
    let joystickSize;

    // Adjust size for different screen sizes
    if (screenWidth > 1024) {
      // Large screens
      joystickSize = 150;
    } else if (screenWidth > 768) {
      // Medium screens
      joystickSize = 420;
    } else {
      // Small screens (phones)
      joystickSize = 300;
    }

    joystickContainer.style.width = `${joystickSize}px`;
    joystickContainer.style.height = `${joystickSize}px`;
    innerCircle.style.width = `${joystickSize / 2}px`;
    innerCircle.style.height = `${joystickSize / 2}px`;
  }

  // Create outer circle for the joystick container
  const outerCircle = document.createElement("div");
  outerCircle.style.width = "100%";
  outerCircle.style.height = "100%";
  outerCircle.style.borderRadius = "50%";
  outerCircle.style.backgroundColor = "rgba(83, 83, 83, 0.47)";
  outerCircle.style.position = "relative";

  // Create inner circle for joystick movement
  const innerCircle = document.createElement("div");
  innerCircle.style.width = "50%";
  innerCircle.style.height = "50%";
  innerCircle.style.borderRadius = "50%";
  innerCircle.style.backgroundColor = "rgba(206, 206, 206, 0.69)";
  innerCircle.style.position = "absolute";
  innerCircle.style.top = "50%";
  innerCircle.style.left = "50%";
  innerCircle.style.transform = "translate(-50%, -50%)";

  outerCircle.appendChild(innerCircle);
  joystickContainer.appendChild(outerCircle);
  document.body.appendChild(joystickContainer);

  // Call the function to set the initial size
  updateJoystickSize();

  let dragging = false;
  let startX = 0;
  let startY = 0;

  // Sensitivity threshold for movement detection
  const sensitivityThreshold = 40;

  const resetJoystick = () => {
    innerCircle.style.top = "50%";
    innerCircle.style.left = "50%";
    controls.moveForward = false;
    controls.moveBackward = false;
    controls.moveLeft = false;
    controls.moveRight = false;
  };

  outerCircle.addEventListener("mousedown", (event) => {
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  document.addEventListener("mousemove", (event) => {
    if (dragging) {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Ensure the inner circle stays within the outer circle
      if (distance <= parseInt(joystickContainer.style.width) / 2) {
        innerCircle.style.top = `calc(50% + ${deltaY}px)`;
        innerCircle.style.left = `calc(50% + ${deltaX}px)`;
      }

      // Apply joystick controls based on distance and direction
      controls.moveForward = deltaY < -sensitivityThreshold;
      controls.moveBackward = deltaY > sensitivityThreshold;
      controls.moveLeft = deltaX < -sensitivityThreshold;
      controls.moveRight = deltaX > sensitivityThreshold;
    }
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    resetJoystick();
  });

  outerCircle.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    dragging = true;
    startX = touch.clientX;
    startY = touch.clientY;
  });

  document.addEventListener("touchmove", (event) => {
    if (dragging) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Ensure the inner circle stays within the outer circle
      if (distance <= parseInt(joystickContainer.style.width) / 2) {
        innerCircle.style.top = `calc(50% + ${deltaY}px)`;
        innerCircle.style.left = `calc(50% + ${deltaX}px)`;
      }

      // Apply joystick controls based on distance and direction
      controls.moveForward = deltaY < -sensitivityThreshold;
      controls.moveBackward = deltaY > sensitivityThreshold;
      controls.moveLeft = deltaX < -sensitivityThreshold;
      controls.moveRight = deltaX > sensitivityThreshold;
    }
  });

  document.addEventListener("touchend", () => {
    dragging = false;
    resetJoystick();
  });

  // Update joystick size on window resize
  window.addEventListener("resize", updateJoystickSize);
}