const UserController = require('../../src/controllers/userController');

describe('UserController', () => {
  let userController;
  let mockUserService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Create mock user service
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserStats: jest.fn()
    };

    userController = new UserController(mockUserService);

    // Create mock request and response objects
    mockReq = {
      params: {},
      body: {},
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getAllUsers', () => {
    test('should return 200 with users data on success', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 }
      ];
      const serviceResponse = {
        success: true,
        data: mockUsers,
        message: 'Users retrieved successfully'
      };
      mockUserService.getAllUsers.mockResolvedValue(serviceResponse);

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        message: 'Users retrieved successfully'
      });
      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    test('should return 500 on service error', async () => {
      const serviceResponse = {
        success: false,
        error: 'Database error',
        message: 'Failed to retrieve users'
      };
      mockUserService.getAllUsers.mockResolvedValue(serviceResponse);

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
        message: 'Failed to retrieve users'
      });
    });

    test('should return 500 on unexpected error', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Unexpected error'));

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected error',
        message: 'Internal server error'
      });
    });
  });

  describe('getUserById', () => {
    test('should return 200 with user data when user exists', async () => {
      const userId = '1';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com', age: 30 };
      const serviceResponse = {
        success: true,
        data: mockUser,
        message: 'User retrieved successfully'
      };
      
      mockReq.params.id = userId;
      mockUserService.getUserById.mockResolvedValue(serviceResponse);

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User retrieved successfully'
      });
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });

    test('should return 404 when user not found', async () => {
      const userId = 'non-existent-id';
      const serviceResponse = {
        success: false,
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      };
      
      mockReq.params.id = userId;
      mockUserService.getUserById.mockResolvedValue(serviceResponse);

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    });

    test('should return 400 for invalid input', async () => {
      const serviceResponse = {
        success: false,
        error: 'User ID is required',
        message: 'Invalid input'
      };
      
      mockReq.params.id = '';
      mockUserService.getUserById.mockResolvedValue(serviceResponse);

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User ID is required',
        message: 'Invalid input'
      });
    });
  });

  describe('createUser', () => {
    test('should return 201 with created user data on success', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const mockCreatedUser = { id: '1', ...userData, createdAt: new Date(), updatedAt: new Date() };
      const serviceResponse = {
        success: true,
        data: mockCreatedUser,
        message: 'User created successfully'
      };
      
      mockReq.body = userData;
      mockUserService.createUser.mockResolvedValue(serviceResponse);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedUser,
        message: 'User created successfully'
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
    });

    test('should return 409 for duplicate email', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const serviceResponse = {
        success: false,
        error: 'User with this email already exists',
        message: 'Duplicate email address'
      };
      
      mockReq.body = userData;
      mockUserService.createUser.mockResolvedValue(serviceResponse);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists',
        message: 'Duplicate email address'
      });
    });

    test('should return 400 for validation error', async () => {
      const userData = { name: 'A', email: 'invalid', age: 200 };
      const serviceResponse = {
        success: false,
        error: 'Validation failed',
        message: 'Validation failed'
      };
      
      mockReq.body = userData;
      mockUserService.createUser.mockResolvedValue(serviceResponse);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        message: 'Validation failed'
      });
    });
  });

  describe('updateUser', () => {
    test('should return 200 with updated user data on success', async () => {
      const userId = '1';
      const updateData = { name: 'Updated Name', age: 35 };
      const mockUpdatedUser = { id: userId, name: 'Updated Name', email: 'john@example.com', age: 35 };
      const serviceResponse = {
        success: true,
        data: mockUpdatedUser,
        message: 'User updated successfully'
      };
      
      mockReq.params.id = userId;
      mockReq.body = updateData;
      mockUserService.updateUser.mockResolvedValue(serviceResponse);

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedUser,
        message: 'User updated successfully'
      });
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
    });

    test('should return 404 when user not found', async () => {
      const userId = 'non-existent-id';
      const updateData = { name: 'Updated Name' };
      const serviceResponse = {
        success: false,
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      };
      
      mockReq.params.id = userId;
      mockReq.body = updateData;
      mockUserService.updateUser.mockResolvedValue(serviceResponse);

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    });

    test('should return 409 for duplicate email', async () => {
      const userId = '1';
      const updateData = { email: 'existing@example.com' };
      const serviceResponse = {
        success: false,
        error: 'User with this email already exists',
        message: 'Duplicate email address'
      };
      
      mockReq.params.id = userId;
      mockReq.body = updateData;
      mockUserService.updateUser.mockResolvedValue(serviceResponse);

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists',
        message: 'Duplicate email address'
      });
    });

    test('should return 400 for validation error', async () => {
      const userId = '1';
      const updateData = { age: 200 };
      const serviceResponse = {
        success: false,
        error: 'Validation failed',
        message: 'Validation failed'
      };
      
      mockReq.params.id = userId;
      mockReq.body = updateData;
      mockUserService.updateUser.mockResolvedValue(serviceResponse);

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        message: 'Validation failed'
      });
    });
  });

  describe('deleteUser', () => {
    test('should return 200 on successful deletion', async () => {
      const userId = '1';
      const serviceResponse = {
        success: true,
        message: 'User deleted successfully'
      };
      
      mockReq.params.id = userId;
      mockUserService.deleteUser.mockResolvedValue(serviceResponse);

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully'
      });
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
    });

    test('should return 404 when user not found', async () => {
      const userId = 'non-existent-id';
      const serviceResponse = {
        success: false,
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      };
      
      mockReq.params.id = userId;
      mockUserService.deleteUser.mockResolvedValue(serviceResponse);

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
        message: 'User with the specified ID does not exist'
      });
    });

    test('should return 400 for invalid input', async () => {
      const serviceResponse = {
        success: false,
        error: 'User ID is required',
        message: 'Invalid input'
      };
      
      mockReq.params.id = '';
      mockUserService.deleteUser.mockResolvedValue(serviceResponse);

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User ID is required',
        message: 'Invalid input'
      });
    });
  });

  describe('getUserStats', () => {
    test('should return 200 with user statistics', async () => {
      const mockStats = {
        totalUsers: 5,
        averageAge: 30,
        youngestUser: 20,
        oldestUser: 40
      };
      const serviceResponse = {
        success: true,
        data: mockStats,
        message: 'User statistics retrieved successfully'
      };
      
      mockUserService.getUserStats.mockResolvedValue(serviceResponse);

      await userController.getUserStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
        message: 'User statistics retrieved successfully'
      });
      expect(mockUserService.getUserStats).toHaveBeenCalledTimes(1);
    });

    test('should return 500 on service error', async () => {
      const serviceResponse = {
        success: false,
        error: 'Database error',
        message: 'Failed to retrieve user statistics'
      };
      
      mockUserService.getUserStats.mockResolvedValue(serviceResponse);

      await userController.getUserStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
        message: 'Failed to retrieve user statistics'
      });
    });
  });

  describe('healthCheck', () => {
    test('should return 200 with health status', async () => {
      await userController.healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'API is healthy',
        timestamp: expect.any(String)
      });
    });

    test('should return 500 on unexpected error', async () => {
      // Mock res.json to throw an error
      mockRes.json.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      await userController.healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected error',
        message: 'Health check failed'
      });
    });
  });
}); 