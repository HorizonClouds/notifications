export class FeatureToggleManager {
    constructor() {
      // Estado de los toggles, simula la configuración de funcionalidades
      this.featureToggles = {
        notifications: true,  
      };
    }
  
    isFeatureEnabled(feature) {
      return this.featureToggles[feature] === true;
    }
  
    enableFeature(feature) {
      this.featureToggles[feature] = true;
    }
  
    disableFeature(feature) {
      this.featureToggles[feature] = false;
    }
  }
  
  export default FeatureToggleManager;
  