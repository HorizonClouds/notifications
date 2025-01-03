// server.js
import express from 'express'; // Import Express framework
import { swaggerSetup } from './swagger.js'; // Import Swagger setup
import apiRouter from './routes/exampleRoute.js'; // Import API routes
import dotenv from 'dotenv'; // Import dotenv for environment variables
import standardResponseMiddleware from './middlewares/standardResponseMiddleware.js'; // Import custom response middleware
import { MongoMemoryServer } from 'mongodb-memory-server';
import notificationRoute from './routes/notificationRoute.js';
import './models/notificationModel.js'; // Importa notificationModels.js para registrar modelos
import errorHandler from './middlewares/errorHandler.js';
import { BadJsonError } from './utils/customErrors.js';
import connectDB from './db/connection.js';
import cors from 'cors'; // Import CORS middleware
import './utils/logger.js';
logger.info('Service is starting...');
import './consumer.js'; // Importa el consumidor para que se ejecute automáticamente

dotenv.config(); // Load environment variables

const app = express(); // Create an Express application
const port = process.env.BACKEND_PORT || 6303; // Define port

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cors());
app.use(standardResponseMiddleware); 

// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err) next(new BadJsonError('Invalid JSON', err.message));
  next();
});

// Routes
app.use('/api', apiRouter); // Use API routes
app.use('/api', notificationRoute);

app.get('/', (req, res) => {
  // Redirect to API documentation
  res.redirect('/api-docs');
});

app.use(errorHandler);
// Swagger configuration
swaggerSetup(app);

// Connect to MongoDB
let mongoURI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/microservice';
if (process.env.NODE_ENV === 'test') {
  const mongod = new MongoMemoryServer(); // Fake MongoDB for testing
  await mongod.start();
  mongoURI = mongod.getUri();
  console.log(mongoURI);
}

connectDB()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
      logger.info(`API documentation is available at http://localhost:${port}/api-docs`);
      logger.debug('Debugging information');
      logger.info('Service has started successfully');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

export default app; // Export the Express application
