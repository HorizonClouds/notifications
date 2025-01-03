import { Kafka } from 'kafkajs';
import config from './config.js';  // Configuración de Kafka
import notificationService from '../services/notificationService.js'; // Importamos el servicio de notificaciones

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [config.kafkaBroker],  // Dirección de tu broker Kafka
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

const runConsumer = async () => {
  try {
    // Conectar el consumidor
    await consumer.connect();
    console.log('Consumer connected successfully');

    // Suscribirse al topic 'notification'
    await consumer.subscribe({ topic: 'notification', fromBeginning: true });

    // Consumiendo los mensajes
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (topic !== 'notification') {
          console.error('Received message from different topic:', topic);
          return;
        }
        const notification = JSON.parse(message.value.toString());
        console.log('Received message:', notification);

        // Utilizamos el servicio de notificaciones para guardar en la base de datos
        try {
          await notificationService.createNotification(notification);
          console.log('Notification saved to DB');
        } catch (error) {
          console.error('Error saving notification to DB:', error);
        }
      },
    });
  } catch (error) {
    console.error('Error in consumer:', error);
  }
};

runConsumer();
