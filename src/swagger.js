import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Notifications API',
      version: '1.0.0',
      description: 'API documentation for Notification microservice',
    },
    servers: [
      {
        url: '/api/v1/',
        description: 'Api Gateway server',
      },
      {
        url: '/api/',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/**/*.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);

//Use this to serve the swagger documentation
export const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};