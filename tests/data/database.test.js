const Database = require('../../src/data/database');

describe('Database', () => {
  let database;

  beforeEach(() => {
    database = new Database();
  });

  afterEach(async () => {
    if (database.isConnectedToDb()) {
      await database.disconnect();
    }
  });

  describe('Connection Management', () => {
    test('should start disconnected', () => {
      expect(database.isConnectedToDb()).toBe(false);
    });

    test('should connect successfully', async () => {
      await database.connect();
      expect(database.isConnectedToDb()).toBe(true);
    });

    test('should disconnect successfully', async () => {
      await database.connect();
      await database.disconnect();
      expect(database.isConnectedToDb()).toBe(false);
    });

    test('should throw error when querying without connection', async () => {
      await expect(database.findAllUsers()).rejects.toThrow('Database not connected');
    });
  });

  describe('User Operations', () => {
    beforeEach(async () => {
      await database.connect();
    });

    describe('findAllUsers', () => {
      test('should return all users', async () => {
        const users = await database.findAllUsers();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(2); // Initial seed data
        expect(users[0]).toHaveProperty('id');
        expect(users[0]).toHaveProperty('name');
        expect(users[0]).toHaveProperty('email');
        expect(users[0]).toHaveProperty('age');
      });

      test('should return empty array when no users exist', async () => {
        await database.clearAllData();
        const users = await database.findAllUsers();
        expect(users).toEqual([]);
      });
    });

    describe('findUserById', () => {
      test('should return user when found', async () => {
        const users = await database.findAllUsers();
        const userId = users[0].id;
        
        const user = await database.findUserById(userId);
        expect(user).toBeTruthy();
        expect(user.id).toBe(userId);
        expect(user.name).toBe(users[0].name);
      });

      test('should return null when user not found', async () => {
        const user = await database.findUserById('non-existent-id');
        expect(user).toBeNull();
      });
    });

    describe('findUserByEmail', () => {
      test('should return user when found', async () => {
        const user = await database.findUserByEmail('john@example.com');
        expect(user).toBeTruthy();
        expect(user.email).toBe('john@example.com');
        expect(user.name).toBe('John Doe');
      });

      test('should return null when user not found', async () => {
        const user = await database.findUserByEmail('nonexistent@example.com');
        expect(user).toBeNull();
      });
    });

    describe('createUser', () => {
      test('should create user successfully', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          age: 25
        };

        const createdUser = await database.createUser(userData);
        
        expect(createdUser).toBeTruthy();
        expect(createdUser.id).toBeDefined();
        expect(createdUser.name).toBe(userData.name);
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.age).toBe(userData.age);
        expect(createdUser.createdAt).toBeInstanceOf(Date);
        expect(createdUser.updatedAt).toBeInstanceOf(Date);
      });

      test('should reject duplicate email', async () => {
        const userData = {
          name: 'Test User',
          email: 'john@example.com', // Already exists
          age: 25
        };

        await expect(database.createUser(userData)).rejects.toThrow('User with this email already exists');
      });
    });

    describe('updateUser', () => {
      test('should update user successfully', async () => {
        const users = await database.findAllUsers();
        const userId = users[0].id;
        const updateData = {
          name: 'Updated Name',
          age: 35
        };

        const updatedUser = await database.updateUser(userId, updateData);
        
        expect(updatedUser.name).toBe(updateData.name);
        expect(updatedUser.age).toBe(updateData.age);
        expect(updatedUser.email).toBe(users[0].email); // Should remain unchanged
        expect(updatedUser.updatedAt).toBeInstanceOf(Date);
      });

      test('should reject update to duplicate email', async () => {
        const users = await database.findAllUsers();
        const userId = users[0].id;
        const updateData = {
          email: users[1].email // Try to use second user's email
        };

        await expect(database.updateUser(userId, updateData)).rejects.toThrow('User with this email already exists');
      });

      test('should reject update for non-existent user', async () => {
        const updateData = { name: 'Updated Name' };
        
        await expect(database.updateUser('non-existent-id', updateData)).rejects.toThrow('User not found');
      });
    });

    describe('deleteUser', () => {
      test('should delete user successfully', async () => {
        const users = await database.findAllUsers();
        const userId = users[0].id;

        const result = await database.deleteUser(userId);
        expect(result).toBe(true);

        const deletedUser = await database.findUserById(userId);
        expect(deletedUser).toBeNull();
      });

      test('should reject delete for non-existent user', async () => {
        await expect(database.deleteUser('non-existent-id')).rejects.toThrow('User not found');
      });
    });

    describe('clearAllData', () => {
      test('should clear all users', async () => {
        const result = await database.clearAllData();
        expect(result).toBe(true);

        const users = await database.findAllUsers();
        expect(users).toEqual([]);
      });
    });
  });

  describe('Data Integrity', () => {
    beforeEach(async () => {
      await database.connect();
    });

    test('should maintain data consistency after multiple operations', async () => {
      // Create a user
      const userData = {
        name: 'Consistency Test',
        email: 'consistency@example.com',
        age: 30
      };
      const createdUser = await database.createUser(userData);

      // Update the user
      const updatedUser = await database.updateUser(createdUser.id, { age: 31 });
      expect(updatedUser.age).toBe(31);

      // Verify user exists
      const foundUser = await database.findUserById(createdUser.id);
      expect(foundUser.age).toBe(31);

      // Delete the user
      await database.deleteUser(createdUser.id);

      // Verify user is deleted
      const deletedUser = await database.findUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    test('should handle concurrent operations safely', async () => {
      const userData1 = { name: 'User 1', email: 'user1@example.com', age: 25 };
      const userData2 = { name: 'User 2', email: 'user2@example.com', age: 30 };

      // Create users concurrently
      const [user1, user2] = await Promise.all([
        database.createUser(userData1),
        database.createUser(userData2)
      ]);

      expect(user1.id).toBeDefined();
      expect(user2.id).toBeDefined();
      expect(user1.id).not.toBe(user2.id);

      // Update users concurrently
      const [updatedUser1, updatedUser2] = await Promise.all([
        database.updateUser(user1.id, { age: 26 }),
        database.updateUser(user2.id, { age: 31 })
      ]);

      expect(updatedUser1.age).toBe(26);
      expect(updatedUser2.age).toBe(31);
    });
  });
}); 