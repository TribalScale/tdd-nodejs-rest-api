/**
 * User Controller
 * Handles HTTP requests and responses for user-related endpoints
 */
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  /**
   * GET /api/users
   * Get all users
   */
  async getAllUsers(req, res) {
    try {
      const result = await this.userService.getAllUsers();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.userService.getUserById(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        const statusCode = result.error === 'User not found' ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/users
   * Create new user
   */
  async createUser(req, res) {
    try {
      const userData = req.body;
      const result = await this.userService.createUser(userData);
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        const statusCode = result.error === 'User with this email already exists' ? 409 : 400;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await this.userService.updateUser(id, updateData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        let statusCode = 400;
        if (result.error === 'User not found') {
          statusCode = 404;
        } else if (result.error === 'User with this email already exists') {
          statusCode = 409;
        }
        
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        const statusCode = result.error === 'User not found' ? 404 : 400;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/users/stats
   * Get user statistics
   */
  async getUserStats(req, res) {
    try {
      const result = await this.userService.getUserStats();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.message
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/health
   * Health check endpoint
   */
  async healthCheck(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Health check failed'
      });
    }
  }
}

module.exports = UserController; 