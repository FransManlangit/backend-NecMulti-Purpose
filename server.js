import express from 'express';
import cors from 'cors';
import cloudinary from 'cloudinary';
import connectDatabase from './database.js'; 
import { PORT } from './config.js';
import errorHandler from './helpers/error-handler.js';
import dotenv from 'dotenv';

// Routes 
import usersRoute from './routes/usersRoute.js';

dotenv.config(); // Initialize dotenv

const app = express();


// Middleware for parsing request body
app.use(express.json());

// Middleware for handling cors policy
// Option: 1 Allow all origins with default of cors(*)\
app.use(cors());
// Option: 2 Allow custom origins
// app.use(
//     cors({
//         origin: 'htpp://localhost:3000',
//         methods: ['GET', 'POST', 'PUT', 'DELETE'],
//         allowedHeaders: ['Content-Type'],
//     })
// );

// Cloudinary API configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route definitions
app.get('/', (request, response) => {
  console.log(request);
  return response.status(200).send('Welcome to MERN stack');
});

app.use('/users', usersRoute);


// Connect to MongoDB and start the server
connectDatabase();

// Add errorHandler as the last middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
