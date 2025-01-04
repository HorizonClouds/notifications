import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.KAFKA_SERVICE_NAME ?? 'UNKNOWN';
const logLevel = process.env.LOGLEVEL ? process.env.LOGLEVEL : 'INFO';
let kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
let kafkaBroker, kafkaTopic, kafka, producer;

if (kafkaEnabled) {
  try {
    const { Kafka, Partitioners } = await import('kafkajs');
    kafkaBroker = process.env.KAFKA_BROKER ?? 'localhost:9092';
    kafkaTopic = process.env.KAFKA_TOPIC ?? 'logs';
    kafka = new Kafka({ clientId: CLIENT_ID, brokers: [kafkaBroker], createPartitioner: Partitioners.LegacyPartitioner });
    producer = kafka.producer();

    const connectKafka = async () => {
      await producer.connect();
    };

    await connectKafka();
  } catch (error) {
    console.log("Kafka not found")
    kafkaEnabled = false;
  }
}

console.log(`Logger initialized for ${CLIENT_ID}; with variables: ${kafkaEnabled}, ${logLevel}, ${kafkaBroker}, ${kafkaTopic}`);

const logMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${CLIENT_ID}][${level}]: ${message}`;
};

const sendLogToKafka = async (formattedMessage) => {
  if (kafkaEnabled) {
    await producer.send({
      topic: kafkaTopic,
      messages: [{ value: formattedMessage }],
    });
  }
};

const info = async (message) => {
  if (logLevel === 'INFO' || logLevel === 'DEBUG') {
    const formattedMessage = logMessage('INFO', message);
    console.log(formattedMessage);
    await sendLogToKafka(formattedMessage);
  }
};

const debug = async (message) => {
  if (logLevel === 'DEBUG') {
    const formattedMessage = logMessage('DEBUG', message);
    console.log(formattedMessage);
    await sendLogToKafka(formattedMessage);
  }
};

export let logger = { info, debug };
global.logger = logger;
