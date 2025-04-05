import express from 'express';
import router from './routes';
import connectDB from './shared/mongoDb';

const app = express();
const port = 3000;

// Define a route for the root URL
app.use(express.json())
app.use(router);

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
};

startServer();