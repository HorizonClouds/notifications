// server.js
import express from 'express'; // Import Express framework
import { swaggerSetup } from './swagger.js'; // Import Swagger setup
import apiRouter from './routes/exampleRoute.js'; // Import API routes
import dotenv from 'dotenv'; // Import dotenv for environment variables
import standardResponseMiddleware from './middlewares/standardResponseMiddleware.js'; // Import custom response middleware
import { MongoMemoryServer } from 'mongodb-memory-server';
import './models/analyticModel.js'; // Importa notificationModels.js para registrar modelos
import analyticRoute from './routes/analyticRoute.js';  // Asegúrate de que esté correctamente importado
import './models/reportModel.js'; // Importa notificationModels.js para registrar modelos
import reportRoute from './routes/reportRoute.js';  // Asegúrate de que esté correctamente importado
import errorHandler from './middlewares/errorHandler.js';
import { BadJsonError } from './utils/customErrors.js';
import connectDB from './db/connection.js';

dotenv.config(); // Load environment variables

const app = express(); // Create an Express application
const port = process.env.BACKEND_PORT || 3000; // Define port

// Middlewares
app.use(express.json()); // Parse JSON bodies
// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err) next(new BadJsonError('Invalid JSON', err.message));
  next();
});
app.use(standardResponseMiddleware); 
// Routes
app.use('/api', apiRouter); // Use API routes
app.use('/api', analyticRoute);
app.use('/api', reportRoute);


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
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`API documentation is available at http://localhost:${port}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

export default app; // Export the Express application
