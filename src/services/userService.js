/**
 * User Service Layer
 * Contains business logic and validation for user operations
 */
class UserService {
  constructor(database) {
    this.database = database;
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const users = await this.database.findAllUsers();
      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve users'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required',
          message: 'Invalid input'
        };
      }

      const user = await this.database.findUserById(id);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        };
      }

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user'
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      // Validate required fields
      const validationResult = this.validateUserData(userData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.join(', '),
          message: 'Validation failed'
        };
      }

      // Check if user already exists
      const existingUser = await this.database.findUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
          message: 'Duplicate email address'
        };
      }

      // Create user
      const newUser = await this.database.createUser(userData);
      
      return {
        success: true,
        data: newUser,
        message: 'User created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create user'
      };
    }
  }

  /**
   * Update user
   */
  async updateUser(id, updateData) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required',
          message: 'Invalid input'
        };
      }

      // Validate update data
      const validationResult = this.validateUpdateData(updateData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.join(', '),
          message: 'Validation failed'
        };
      }

      // Check if user exists
      const existingUser = await this.database.findUserById(id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        };
      }

      // Update user
      const updatedUser = await this.database.updateUser(id, updateData);
      
      return {
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update user'
      };
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    try {
      if (!id) {
        return {
          success: false,
          error: 'User ID is required',
          message: 'Invalid input'
        };
      }

      // Check if user exists
      const existingUser = await this.database.findUserById(id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          message: 'User with the specified ID does not exist'
        };
      }

      // Delete user
      await this.database.deleteUser(id);
      
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete user'
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const users = await this.database.findAllUsers();
      
      const stats = {
        totalUsers: users.length,
        averageAge: users.length > 0 ? users.reduce((sum, user) => sum + user.age, 0) / users.length : 0,
        youngestUser: users.length > 0 ? Math.min(...users.map(user => user.age)) : 0,
        oldestUser: users.length > 0 ? Math.max(...users.map(user => user.age)) : 0
      };

      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user statistics'
      };
    }
  }

  /**
   * Validate user data for creation
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (userData.age === undefined || userData.age === null || typeof userData.age !== 'number' || userData.age < 0 || userData.age > 150) {
      errors.push('Age must be a number between 0 and 150');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update data
   */
  validateUpdateData(updateData) {
    const errors = [];

    if (updateData.name !== undefined) {
      if (typeof updateData.name !== 'string' || updateData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
    }

    if (updateData.email !== undefined) {
      if (!this.isValidEmail(updateData.email)) {
        errors.push('Valid email is required');
      }
    }

    if (updateData.age !== undefined) {
      if (typeof updateData.age !== 'number' || updateData.age < 0 || updateData.age > 150) {
        errors.push('Age must be a number between 0 and 150');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = UserService; 