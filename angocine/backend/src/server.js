const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 3000;

// Initialize database
db.initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`AngoCine server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });