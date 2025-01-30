export function setupWindowResizeHandler(camera, renderer) {
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  
    window.addEventListener('resize', handleResize);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }
  
  export function setupLoadingScreen() {
    const loadingContainer = document.getElementById('loading-container');
    
    function showLoading() {
      loadingContainer.style.display = 'flex';
    }
    
    function hideLoading() {
      loadingContainer.style.display = 'none';
    }
    
    return { showLoading, hideLoading };
  }