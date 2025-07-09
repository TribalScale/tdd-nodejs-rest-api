const express = require('express');
const router = express.Router();

/**
 * User Routes
 * Defines all user-related API endpoints
 */
function createUserRoutes(userController) {
  // Health check endpoint
  router.get('/health', (req, res) => userController.healthCheck(req, res));

  // User statistics endpoint (must come before /:id to avoid conflicts)
  router.get('/users/stats', (req, res) => userController.getUserStats(req, res));

  // CRUD operations for users
  router.get('/users', (req, res) => userController.getAllUsers(req, res));
  router.get('/users/:id', (req, res) => userController.getUserById(req, res));
  router.post('/users', (req, res) => userController.createUser(req, res));
  router.put('/users/:id', (req, res) => userController.updateUser(req, res));
  router.delete('/users/:id', (req, res) => userController.deleteUser(req, res));

  return router;
}

module.exports = createUserRoutes; 