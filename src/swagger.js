// swagger.js

import swaggerUi from 'swagger-ui-express'; // Import swagger-ui-express

// Load the OpenAPI specification from YAML file
import YAML from 'yamljs';
const swaggerDocument = YAML.load('src/api/oas.yaml');
// Export the Swagger UI setup
const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Serve Swagger UI
};
export { swaggerSetup };
