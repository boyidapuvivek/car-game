import { CONFIG } from './config.js';

export function createDistanceDisplay() {
  const distanceDisplay = document.createElement('div');
  distanceDisplay.classList.add('distance-display');
  document.body.appendChild(distanceDisplay);
  return distanceDisplay;
}

export function createFuelDisplay() {
  const fuelDisplay = document.createElement('div');
  fuelDisplay.classList.add('fuel-display');
  document.body.appendChild(fuelDisplay);
  return fuelDisplay;
}

export function updateDistanceDisplay(display, distanceTravelled, gameOver) {
  display.innerHTML = `Distance Travelled: <span>${Math.floor(distanceTravelled)}</span> units`;
}

export function updateFuelDisplay(display, fuel) {
  display.innerHTML = `Fuel: <span>${Math.max(fuel, 0).toFixed(1)}%</span>`;
}
