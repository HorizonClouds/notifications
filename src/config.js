import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopic: process.env.KAFKA_TOPIC || 'logs',
  dbUri: process.env.MONGO_URI || 'mongodb://localhost:27017/notifications',
};

export default config;  // Exporta como 'default'
