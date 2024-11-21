# simple-mern-microservice

## Introduction
This is a template repository to help you get started with creating microservices within a larger MERN (MongoDB, Express, React, Node.js) project, like the **HorizonClouds** project. In this example, we’ll assume you’re setting up a **Product Management microservice**, but the structure and steps here can be applied to any microservice type. 

Whether you're working on products, orders, or user data, this template offers the base files, structure, and example code you'll need to implement and customize your service efficiently.

---

## Usage
Follow these steps to set up your own microservice:

1. **Create a repository from this template:**
   - Start by creating a new repository on the organization based on this template. Let’s call it `product-microservice`.

2. **Clone your new repository:**
    ```bash
    git clone https://github.com/HorizonClouds/product-microservice.git
    cd product-microservice
    ```

3. **Install dependencies:**
    Make sure you are using Node.js version 18.x. You can use `nvm` (Node Version Manager) to install and manage this version:

    ```bash
    nvm install 18
    nvm use 18
    ```

    Then, install the project dependencies:

    ```bash
    npm install
    ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and specify values for MongoDB and server port.

   ```plaintext
   DB_URI=mongodb://localhost:27017/products
   PORT=3000
   ```

5. **Start the MongoDB container (optional):**
    If you don’t have MongoDB installed locally, you can run it in a Docker container using the provided script.
   ```bash
   npm run start-mongodb
   ```

6. **Run the application in dev mode:**
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:3000`. We use `nodemon` to automatically restart the server when changes are made.
    Swagger API documentation will be available at `http://localhost:3000/api-docs`.

7. **Run tests:**
   ```bash
   npm test
   ```

---

## Project Structure
Here’s the general layout of the project, designed for clear separation of concerns and scalability:

```
.
├── Dockerfile                   # Docker configuration for containerization
├── LICENSE                      # License file
├── README.md                    # Documentation
├── nodemon.json                 # Nodemon configuration for auto-restarts
├── package.json                 # Project dependencies and scripts
├── src                          # Source code
│   ├── api
│   │   └── oas.yaml             # API documentation in OpenAPI format
│   ├── models
│   │   └── exampleModel.js      # Mongoose models (example provided)
│   ├── routes
│   │   └── exampleRoute.js      # API route definitions
│   ├── controllers              # Route handlers (for complex logic)
│   │   └── exampleController.js
│   ├── server.js                # Main server file
│   ├── swagger.js               # Swagger setup for API documentation
│   └── test                     # Unit and integration tests
│       ├── example.test.js
│       └── setup.test.js
└── projectstructurefoldersandfiles.md  # File detailing the folder structure
```

---

## Building Your Product Management Microservice

### Overview of Changes
To customize this template for managing products, you’ll primarily be working in the `models`, `controllers`, and `routes` folders. Here’s what each part does and how you’ll adapt it to your needs.

### 1. Define the Mongoose Model
The **`src/models/`** folder contains Mongoose models that define the schema for each resource. For the Product Management microservice, create a `Product` model.

```javascript
// src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
});

export default mongoose.model('Product', productSchema);
```

### 2. Set Up the Controller
In **`src/controllers/`**, add a `productController.js` file to handle core CRUD operations like fetching and adding products.

```javascript
// src/controllers/productController.js
import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

export const createProduct = async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
};
```

### 3. Define the Routes
Define the API endpoints in **`src/routes/productRoutes.js`**, mapping routes to the controller functions.

```javascript
// src/routes/productRoutes.js
import express from 'express';
import { getAllProducts, createProduct } from '../controllers/productController.js';

const router = express.Router();
router.get('/products', getAllProducts);
router.post('/products', createProduct);

export default router;
```

### 4. Update the Main Server File
In **`src/server.js`**, include your product routes so they’re accessible in the API.

```javascript
// src/server.js
import express from 'express';
import productRoutes from './routes/productRoutes.js';

const app = express();
app.use(express.json());
app.use('/api', productRoutes);

export default app;
```

---

## Extending the Microservice

With this template, you have plenty of options to customize and expand as needed. Here are some typical additions and modifications:

1. **Middleware for Validation**:
    Add middleware to validate data before it reaches the controller, ensuring only valid requests are processed.

    ```javascript
    // src/middleware/validateProduct.js
    export const validateProduct = (req, res, next) => {
         const { name, price } = req.body;
         if (!name || typeof price !== 'number') {
              return res.status(400).json({ message: 'Invalid product data' });
         }
         next();
    };
    ```

    Update the routes to include this validation middleware:

    ```javascript
    // src/routes/productRoutes.js
    import express from 'express';
    import { getAllProducts, createProduct } from '../controllers/productController.js';
    import { validateProduct } from '../middleware/validateProduct.js';

    const router = express.Router();
    router.get('/products', getAllProducts);
    router.post('/products', validateProduct, createProduct);

    export default router;
    ```

2. **Swagger Documentation**:
   Add API documentation using Swagger. The `src/api/oas.yaml` file can be used to define endpoints, parameters, and responses.

3. **Testing**:
   Write unit and integration tests to verify each function’s behavior. For example, `example.test.js` in **`src/test/`** contains sample tests that you can adapt.

   ```javascript
   import chai, { expect } from 'chai';
   import chaiHttp from 'chai-http';
   import app from '../server.js';

   chai.use(chaiHttp);

   describe('Product API', () => {
       it('should GET all products', (done) => {
           chai.request(app)
               .get('/api/products')
               .end((err, res) => {
                   expect(res).to.have.status(200);
                   expect(res.body?.data).to.be.an('array');
                   done();
               });
       });
   });
   ```

4. **Configuration and CI/CD**:
   This template includes a basic setup that can be integrated with GitHub Actions or other CI/CD tools for automated testing, formatting, and deployment.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

By following these steps, you should have a functional Product Management microservice up and running. This example covers the setup for managing products, but you can use the same structure and process to build any other microservice for the HorizonClouds project or other MERN-based applications.