const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import our layers
const Database = require('./data/database');
const UserService = require('./services/userService');
const UserController = require('./controllers/userController');
const createUserRoutes = require('./routes/userRoutes');

/**
 * Express Application Setup
 * Demonstrates proper layered architecture for TDD
 */
class App {
  constructor() {
    this.app = express();
    this.database = new Database();
    this.userService = new UserService(this.database);
    this.userController = new UserController(this.userService);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors());
    
    // Logging middleware
    this.app.use(morgan('combined'));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // API routes
    this.app.use('/api', createUserRoutes(this.userController));
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'TDD Node.js REST API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /api/health',
          users: {
            getAll: 'GET /api/users',
            getById: 'GET /api/users/:id',
            create: 'POST /api/users',
            update: 'PUT /api/users/:id',
            delete: 'DELETE /api/users/:id',
            stats: 'GET /api/users/stats'
          }
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.originalUrl} was not found`
      });
    });
  }

  /**
   * Setup error handling middleware
   */
  setupErrorHandling() {
    this.app.use((error, req, res, next) => {
      console.error('Error:', error);
      
      // Handle JSON parsing errors
      if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON',
          message: 'Request body contains invalid JSON'
        });
      }

      // Generic error handler
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong on the server'
      });
    });
  }

  /**
   * Start the server
   */
  async start(port = 3000) {
    try {
      // Connect to database
      await this.database.connect();
      console.log('Database connected successfully');

      // Start server
      this.server = this.app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`API documentation available at http://localhost:${port}/`);
      });

      return this.server;
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Stop the server
   */
  async stop() {
    try {
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }
      
      if (this.database) {
        await this.database.disconnect();
      }
      
      console.log('Server stopped successfully');
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }

  /**
   * Get Express app instance (useful for testing)
   */
  getApp() {
    return this.app;
  }

  /**
   * Get database instance (useful for testing)
   */
  getDatabase() {
    return this.database;
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  const app = new App();
  const port = process.env.PORT || 3000;
  
  app.start(port);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await app.stop();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await app.stop();
    process.exit(0);
  });
}

module.exports = App; 