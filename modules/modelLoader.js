
export class ModelLoader {
  constructor(loader) {
    this.loader = loader;
  }

  loadCar(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          const car = gltf.scene;
          car.scale.set(0.7, 0.7, 0.7);
          car.rotation.y = Math.PI;
          car.position.set(0, 0, 0);

 
          resolve(car);
        },
        undefined,
        (error) => {
          console.error('Error loading car model:', error);
          reject(error);
        }
      );
    });
  }

}
