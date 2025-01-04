import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopic: process.env.KAFKA_TOPIC || 'logs',
  dbUri: process.env.MONGO_URI || 'mongodb://localhost:27017/notifications',
  jwtSecret: process.env.JWT_SECRET || 'horizon-secret',
  jwtServiceName: process.env.JWT_SERVICE_NAME || 'notifications-service',
  kafkaServiceName: process.env.KAFKA_SERVICE_NAME || 'NOTIFICATIONS',
  logLevel: process.env.LOGLEVEL || 'INFO',
};

export const CACHE_TTL = 3600; // Establecer 1 hora en segundos
export default config;  // Exporta como 'default'
