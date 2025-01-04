export class ThrottleManager {
  constructor() {
    this.lastCall = 0;
  }

  // Limita la ejecución de una función a cada 'delay' milisegundos
  throttle(func, delay, res) {
    return (...args) => {
      const now = new Date().getTime();
      if (now - this.lastCall >= delay) {
        this.lastCall = now;
        func(...args); // Ejecuta la función cuando el tiempo lo permite
      } else {
        // Si se intenta hacer una llamada antes del tiempo de espera
        res.status(429).json({ message: 'Too many requests. Please try again later.' }); // Respuesta indicando demasiadas solicitudes
      }
    };
  }
}
