const { v4: uuidv4 } = require('uuid');

/**
 * Mock Database class for TDD demonstration
 * This simulates a real database with in-memory storage
 */
class Database {
  constructor() {
    this.users = new Map();
    this.isConnected = false;
    this.seedData();
  }

  /**
   * Simulate database connection
   */
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        resolve(true);
      }, 100);
    });
  }

  /**
   * Simulate database disconnection
   */
  async disconnect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false;
        resolve(true);
      }, 50);
    });
  }

  /**
   * Check if database is connected
   */
  isConnectedToDb() {
    return this.isConnected;
  }

  /**
   * Seed initial data
   */
  seedData() {
    const sampleUsers = [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02')
      }
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));
  }

  /**
   * Get all users
   */
  async findAllUsers() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Array.from(this.users.values()));
      }, 50);
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.users.get(id) || null);
      }, 50);
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const user = Array.from(this.users.values()).find(u => u.email === email);
        resolve(user || null);
      }, 50);
    });
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
        if (existingUser) {
          reject(new Error('User with this email already exists'));
          return;
        }

        const newUser = {
          id: uuidv4(),
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.users.set(newUser.id, newUser);
        resolve(newUser);
      }, 50);
    });
  }

  /**
   * Update user
   */
  async updateUser(id, updateData) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.get(id);
        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        // Check if email is being updated and already exists
        if (updateData.email && updateData.email !== user.email) {
          const existingUser = Array.from(this.users.values()).find(u => u.email === updateData.email);
          if (existingUser) {
            reject(new Error('User with this email already exists'));
            return;
          }
        }

        const updatedUser = {
          ...user,
          ...updateData,
          updatedAt: new Date()
        };

        this.users.set(id, updatedUser);
        resolve(updatedUser);
      }, 50);
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.users.has(id)) {
          reject(new Error('User not found'));
          return;
        }

        this.users.delete(id);
        resolve(true);
      }, 50);
    });
  }

  /**
   * Clear all data (useful for testing)
   */
  async clearAllData() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.users.clear();
        resolve(true);
      }, 50);
    });
  }
}

module.exports = Database; 