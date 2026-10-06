require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

// Connect to MongoDB & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Email Campaign Backend running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database connection:', err);
});
