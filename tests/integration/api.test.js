const request = require('supertest');
const App = require('../../src/app');

describe('API Integration Tests', () => {
  let app;
  let server;
  let database;

  beforeAll(async () => {
    app = new App();
    database = app.getDatabase();
    await database.connect();
    server = app.getApp();
  });

  afterAll(async () => {
    if (database) {
      await database.disconnect();
    }
  });

  beforeEach(async () => {
    // Clear and reseed database before each test
    await database.clearAllData();
    await database.seedData();
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return API information', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('TDD Node.js REST API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('User CRUD Operations', () => {
    describe('GET /api/users', () => {
      test('should return all users', async () => {
        const response = await request(server)
          .get('/api/users')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(2); // Seed data
        expect(response.body.message).toBe('Users retrieved successfully');
      });
    });

    describe('GET /api/users/:id', () => {
      test('should return specific user when found', async () => {
        // Get all users first to get a valid ID
        const usersResponse = await request(server).get('/api/users');
        const userId = usersResponse.body.data[0].id;

        const response = await request(server)
          .get(`/api/users/${userId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(userId);
        expect(response.body.data.name).toBeDefined();
        expect(response.body.data.email).toBeDefined();
        expect(response.body.data.age).toBeDefined();
      });

      test('should return 404 for non-existent user', async () => {
        const response = await request(server)
          .get('/api/users/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('User not found');
      });
    });

    describe('POST /api/users', () => {
      test('should create new user with valid data', async () => {
        const newUser = {
          name: 'Test User',
          email: 'test@example.com',
          age: 25
        };

        const response = await request(server)
          .post('/api/users')
          .send(newUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe(newUser.name);
        expect(response.body.data.email).toBe(newUser.email);
        expect(response.body.data.age).toBe(newUser.age);
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
      });

      test('should return 400 for invalid data', async () => {
        const invalidUser = {
          name: 'A', // Too short
          email: 'invalid-email',
          age: 200 // Too high
        };

        const response = await request(server)
          .post('/api/users')
          .send(invalidUser)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Name must be at least 2 characters long');
        expect(response.body.error).toContain('Valid email is required');
        expect(response.body.error).toContain('Age must be a number between 0 and 150');
      });

      test('should return 409 for duplicate email', async () => {
        const duplicateUser = {
          name: 'Duplicate User',
          email: 'john@example.com', // Already exists in seed data
          age: 30
        };

        const response = await request(server)
          .post('/api/users')
          .send(duplicateUser)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('User with this email already exists');
      });
    });

    describe('PUT /api/users/:id', () => {
      test('should update existing user', async () => {
        // Get a user to update
        const usersResponse = await request(server).get('/api/users');
        const userId = usersResponse.body.data[0].id;

        const updateData = {
          name: 'Updated Name',
          age: 35
        };

        const response = await request(server)
          .put(`/api/users/${userId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(userId);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.age).toBe(updateData.age);
        expect(response.body.data.updatedAt).toBeDefined();
      });

      test('should return 404 for non-existent user', async () => {
        const updateData = { name: 'Updated Name' };

        const response = await request(server)
          .put('/api/users/non-existent-id')
          .send(updateData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('User not found');
      });

      test('should return 400 for invalid update data', async () => {
        const usersResponse = await request(server).get('/api/users');
        const userId = usersResponse.body.data[0].id;

        const invalidUpdateData = {
          age: 200 // Invalid age
        };

        const response = await request(server)
          .put(`/api/users/${userId}`)
          .send(invalidUpdateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Age must be a number between 0 and 150');
      });
    });

    describe('DELETE /api/users/:id', () => {
      test('should delete existing user', async () => {
        // Get a user to delete
        const usersResponse = await request(server).get('/api/users');
        const userId = usersResponse.body.data[0].id;

        const response = await request(server)
          .delete(`/api/users/${userId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User deleted successfully');

        // Verify user is deleted
        await request(server)
          .get(`/api/users/${userId}`)
          .expect(404);
      });

      test('should return 404 for non-existent user', async () => {
        const response = await request(server)
          .delete('/api/users/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('User not found');
      });
    });
  });

  describe('User Statistics', () => {
    test('GET /api/users/stats should return user statistics', async () => {
      const response = await request(server)
        .get('/api/users/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('averageAge');
      expect(response.body.data).toHaveProperty('youngestUser');
      expect(response.body.data).toHaveProperty('oldestUser');
      expect(response.body.data.totalUsers).toBe(2); // Seed data
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(server)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid JSON');
    });
  });

  describe('Full User Lifecycle', () => {
    test('should support complete CRUD operations', async () => {
      // Create a user
      const newUser = {
        name: 'Lifecycle Test User',
        email: 'lifecycle@example.com',
        age: 28
      };

      const createResponse = await request(server)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      const userId = createResponse.body.data.id;
      expect(userId).toBeDefined();

      // Read the user
      const readResponse = await request(server)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(readResponse.body.data.name).toBe(newUser.name);
      expect(readResponse.body.data.email).toBe(newUser.email);
      expect(readResponse.body.data.age).toBe(newUser.age);

      // Update the user
      const updateData = { name: 'Updated Lifecycle User', age: 30 };
      const updateResponse = await request(server)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.age).toBe(updateData.age);
      expect(updateResponse.body.data.email).toBe(newUser.email); // Should remain unchanged

      // Delete the user
      await request(server)
        .delete(`/api/users/${userId}`)
        .expect(200);

      // Verify deletion
      await request(server)
        .get(`/api/users/${userId}`)
        .expect(404);
    });
  });

  describe('Data Validation Edge Cases', () => {
    test('should handle empty request body', async () => {
      const response = await request(server)
        .post('/api/users')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Name must be at least 2 characters long');
      expect(response.body.error).toContain('Valid email is required');
      expect(response.body.error).toContain('Age must be a number between 0 and 150');
    });

    test('should handle boundary values for age', async () => {
      const validUser = {
        name: 'Boundary Test',
        email: 'boundary@example.com',
        age: 0 // Minimum valid age
      };

      const response = await request(server)
        .post('/api/users')
        .send(validUser)
        .expect(201);

      expect(response.body.data.age).toBe(0);
    });

    test('should handle maximum age boundary', async () => {
      const validUser = {
        name: 'Max Age Test',
        email: 'maxage@example.com',
        age: 150 // Maximum valid age
      };

      const response = await request(server)
        .post('/api/users')
        .send(validUser)
        .expect(201);

      expect(response.body.data.age).toBe(150);
    });
  });
}); 