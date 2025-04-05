import express from 'express';
import router from './routes';

const app = express();
const port = 3000;

// Define a route for the root URL
app.use(express.json())
app.use(router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
