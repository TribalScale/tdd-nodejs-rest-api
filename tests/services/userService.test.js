const UserService = require('../../src/services/userService');

describe('UserService', () => {
  let userService;
  let mockDatabase;

  beforeEach(() => {
    // Create mock database with all required methods
    mockDatabase = {
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    };

    userService = new UserService(mockDatabase);
  });

  describe('getAllUsers', () => {
    test('should return success with users data', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 }
      ];
      mockDatabase.findAllUsers.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUsers);
      expect(result.message).toBe('Users retrieved successfully');
      expect(mockDatabase.findAllUsers).toHaveBeenCalledTimes(1);
    });

    test('should return error when database throws error', async () => {
      const errorMessage = 'Database connection failed';
      mockDatabase.findAllUsers.mockRejectedValue(new Error(errorMessage));

      const result = await userService.getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.message).toBe('Failed to retrieve users');
    });
  });

  describe('getUserById', () => {
    test('should return success with user data when user exists', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 };
      mockDatabase.findUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe('User retrieved successfully');
      expect(mockDatabase.findUserById).toHaveBeenCalledWith('1');
    });

    test('should return error when user not found', async () => {
      mockDatabase.findUserById.mockResolvedValue(null);

      const result = await userService.getUserById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.message).toBe('User with the specified ID does not exist');
    });

    test('should return error when id is not provided', async () => {
      const result = await userService.getUserById();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
      expect(result.message).toBe('Invalid input');
      expect(mockDatabase.findUserById).not.toHaveBeenCalled();
    });

    test('should return error when database throws error', async () => {
      const errorMessage = 'Database error';
      mockDatabase.findUserById.mockRejectedValue(new Error(errorMessage));

      const result = await userService.getUserById('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.message).toBe('Failed to retrieve user');
    });
  });

  describe('createUser', () => {
    test('should create user successfully with valid data', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const mockCreatedUser = { id: '1', ...userData, createdAt: new Date(), updatedAt: new Date() };
      
      mockDatabase.findUserByEmail.mockResolvedValue(null);
      mockDatabase.createUser.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedUser);
      expect(result.message).toBe('User created successfully');
      expect(mockDatabase.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockDatabase.createUser).toHaveBeenCalledWith(userData);
    });

    test('should return error when user already exists', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const existingUser = { id: '1', ...userData };
      
      mockDatabase.findUserByEmail.mockResolvedValue(existingUser);

      const result = await userService.createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User with this email already exists');
      expect(result.message).toBe('Duplicate email address');
      expect(mockDatabase.createUser).not.toHaveBeenCalled();
    });

    test('should return error with invalid name', async () => {
      const userData = { name: 'A', email: 'john@example.com', age: 30 };

      const result = await userService.createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name must be at least 2 characters long');
      expect(result.message).toBe('Validation failed');
      expect(mockDatabase.findUserByEmail).not.toHaveBeenCalled();
    });

    test('should return error with invalid email', async () => {
      const userData = { name: 'John Doe', email: 'invalid-email', age: 30 };

      const result = await userService.createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Valid email is required');
      expect(result.message).toBe('Validation failed');
    });

    test('should return error with invalid age', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: -5 };

      const result = await userService.createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Age must be a number between 0 and 150');
      expect(result.message).toBe('Validation failed');
    });

    test('should return multiple validation errors', async () => {
      const userData = { name: 'A', email: 'invalid', age: 200 };

      const result = await userService.createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Name must be at least 2 characters long');
      expect(result.error).toContain('Valid email is required');
      expect(result.error).toContain('Age must be a number between 0 and 150');
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const userId = '1';
      const updateData = { name: 'Updated Name', age: 35 };
      const existingUser = { id: userId, name: 'John Doe', email: 'john@example.com', age: 30 };
      const updatedUser = { ...existingUser, ...updateData, updatedAt: new Date() };

      mockDatabase.findUserById.mockResolvedValue(existingUser);
      mockDatabase.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.message).toBe('User updated successfully');
      expect(mockDatabase.findUserById).toHaveBeenCalledWith(userId);
      expect(mockDatabase.updateUser).toHaveBeenCalledWith(userId, updateData);
    });

    test('should return error when user not found', async () => {
      const userId = 'non-existent-id';
      const updateData = { name: 'Updated Name' };

      mockDatabase.findUserById.mockResolvedValue(null);

      const result = await userService.updateUser(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.message).toBe('User with the specified ID does not exist');
      expect(mockDatabase.updateUser).not.toHaveBeenCalled();
    });

    test('should return error when id is not provided', async () => {
      const updateData = { name: 'Updated Name' };

      const result = await userService.updateUser(null, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
      expect(result.message).toBe('Invalid input');
      expect(mockDatabase.findUserById).not.toHaveBeenCalled();
    });

    test('should return error with invalid update data', async () => {
      const userId = '1';
      const updateData = { name: 'A', age: 200 };

      const result = await userService.updateUser(userId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Name must be at least 2 characters long');
      expect(result.error).toContain('Age must be a number between 0 and 150');
      expect(result.message).toBe('Validation failed');
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      const userId = '1';
      const existingUser = { id: userId, name: 'John Doe', email: 'john@example.com', age: 30 };

      mockDatabase.findUserById.mockResolvedValue(existingUser);
      mockDatabase.deleteUser.mockResolvedValue(true);

      const result = await userService.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User deleted successfully');
      expect(mockDatabase.findUserById).toHaveBeenCalledWith(userId);
      expect(mockDatabase.deleteUser).toHaveBeenCalledWith(userId);
    });

    test('should return error when user not found', async () => {
      const userId = 'non-existent-id';

      mockDatabase.findUserById.mockResolvedValue(null);

      const result = await userService.deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.message).toBe('User with the specified ID does not exist');
      expect(mockDatabase.deleteUser).not.toHaveBeenCalled();
    });

    test('should return error when id is not provided', async () => {
      const result = await userService.deleteUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
      expect(result.message).toBe('Invalid input');
      expect(mockDatabase.findUserById).not.toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    test('should return user statistics', async () => {
      const mockUsers = [
        { id: '1', name: 'John', email: 'john@example.com', age: 30 },
        { id: '2', name: 'Jane', email: 'jane@example.com', age: 25 },
        { id: '3', name: 'Bob', email: 'bob@example.com', age: 35 }
      ];
      mockDatabase.findAllUsers.mockResolvedValue(mockUsers);

      const result = await userService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalUsers: 3,
        averageAge: 30,
        youngestUser: 25,
        oldestUser: 35
      });
      expect(result.message).toBe('User statistics retrieved successfully');
    });

    test('should return zero stats when no users exist', async () => {
      mockDatabase.findAllUsers.mockResolvedValue([]);

      const result = await userService.getUserStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalUsers: 0,
        averageAge: 0,
        youngestUser: 0,
        oldestUser: 0
      });
    });
  });

  describe('validation methods', () => {
    describe('validateUserData', () => {
      test('should validate correct user data', () => {
        const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
        
        const result = userService.validateUserData(userData);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      test('should return errors for invalid data', () => {
        const userData = { name: 'A', email: 'invalid', age: 200 };
        
        const result = userService.validateUserData(userData);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(3);
      });
    });

    describe('isValidEmail', () => {
      test('should validate correct email formats', () => {
        expect(userService.isValidEmail('test@example.com')).toBe(true);
        expect(userService.isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(userService.isValidEmail('user+tag@example.org')).toBe(true);
      });

      test('should reject invalid email formats', () => {
        expect(userService.isValidEmail('invalid')).toBe(false);
        expect(userService.isValidEmail('test@')).toBe(false);
        expect(userService.isValidEmail('@example.com')).toBe(false);
        expect(userService.isValidEmail('test.example.com')).toBe(false);
      });
    });
  });
}); 