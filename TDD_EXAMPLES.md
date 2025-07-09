# TDD Examples and Concepts Guide

This document provides concrete examples of how Test-Driven Development (TDD) is implemented in this project, perfect for teaching TDD concepts.

## 🔄 TDD Cycle: Red-Green-Refactor

### Example 1: Data Layer Development

#### Step 1: Red (Write failing test)
```javascript
// tests/data/database.test.js
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
```

#### Step 2: Green (Make test pass)
```javascript
// src/data/database.js
async createUser(userData) {
  if (!this.isConnected) {
    throw new Error('Database not connected');
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
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
```

#### Step 3: Refactor (Improve code)
Add validation and error handling:
```javascript
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
```

## 🧪 Testing Strategies

### 1. Unit Testing with Mocks

#### Service Layer Testing
```javascript
// tests/services/userService.test.js
describe('UserService', () => {
  let userService;
  let mockDatabase;

  beforeEach(() => {
    // Create mock database
    mockDatabase = {
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn()
    };

    userService = new UserService(mockDatabase);
  });

  test('should return success with users data', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 }
    ];
    mockDatabase.findAllUsers.mockResolvedValue(mockUsers);

    const result = await userService.getAllUsers();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUsers);
    expect(mockDatabase.findAllUsers).toHaveBeenCalledTimes(1);
  });
});
```

**Key TDD Concepts Demonstrated:**
- **Isolation**: Service is tested independently of database
- **Mocking**: Database dependencies are mocked
- **Behavior Testing**: Verify method calls and return values

### 2. Controller Testing with HTTP Mocks

```javascript
// tests/controllers/userController.test.js
describe('UserController', () => {
  let userController;
  let mockUserService;
  let mockReq, mockRes;

  beforeEach(() => {
    mockUserService = {
      getAllUsers: jest.fn()
    };

    mockReq = { params: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    userController = new UserController(mockUserService);
  });

  test('should return 200 with users data on success', async () => {
    const serviceResponse = {
      success: true,
      data: [{ id: '1', name: 'John' }],
      message: 'Users retrieved successfully'
    };
    mockUserService.getAllUsers.mockResolvedValue(serviceResponse);

    await userController.getAllUsers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(serviceResponse);
  });
});
```

**Key TDD Concepts Demonstrated:**
- **HTTP Testing**: Mock request/response objects
- **Status Code Testing**: Verify correct HTTP responses
- **Dependency Injection**: Controller receives service as dependency

### 3. Integration Testing

```javascript
// tests/integration/api.test.js
describe('API Integration Tests', () => {
  let app, server, database;

  beforeAll(async () => {
    app = new App();
    database = app.getDatabase();
    await database.connect();
    server = app.getApp();
  });

  test('should create and retrieve user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    };

    // Create user
    const createResponse = await request(server)
      .post('/api/users')
      .send(newUser)
      .expect(201);

    // Retrieve user
    const userId = createResponse.body.data.id;
    const getResponse = await request(server)
      .get(`/api/users/${userId}`)
      .expect(200);

    expect(getResponse.body.data.name).toBe(newUser.name);
  });
});
```

**Key TDD Concepts Demonstrated:**
- **End-to-End Testing**: Full API workflow
- **Real Dependencies**: Using actual database (mock)
- **HTTP Testing**: Real HTTP requests with supertest

## 📚 TDD Best Practices Demonstrated

### 1. Test Structure (AAA Pattern)

```javascript
test('should create user successfully', async () => {
  // Arrange
  const userData = { name: 'John', email: 'john@example.com', age: 30 };
  mockDatabase.createUser.mockResolvedValue({ id: '1', ...userData });

  // Act
  const result = await userService.createUser(userData);

  // Assert
  expect(result.success).toBe(true);
  expect(mockDatabase.createUser).toHaveBeenCalledWith(userData);
});
```

### 2. Test Organization

```javascript
describe('UserService', () => {
  describe('createUser', () => {
    test('should create user successfully with valid data', async () => {
      // Test implementation
    });

    test('should return error when user already exists', async () => {
      // Test implementation
    });

    test('should return error with invalid data', async () => {
      // Test implementation
    });
  });
});
```

### 3. Edge Case Testing

```javascript
describe('Data Validation Edge Cases', () => {
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
```

## 🎯 TDD Teaching Points

### 1. Write Tests First
- **Why**: Ensures you understand requirements before coding
- **How**: Write failing test, then implement minimal code to pass

### 2. Test One Thing at a Time
- **Why**: Easier to debug and understand failures
- **How**: Each test should verify one specific behavior

### 3. Use Descriptive Test Names
```javascript
// Good
test('should return 404 when user not found', async () => {});

// Bad
test('user test', async () => {});
```

### 4. Mock External Dependencies
```javascript
// Mock database in service tests
mockDatabase = {
  findUserById: jest.fn(),
  createUser: jest.fn()
};

// Mock service in controller tests
mockUserService = {
  getUserById: jest.fn(),
  createUser: jest.fn()
};
```

### 5. Test Both Success and Failure Cases
```javascript
describe('getUserById', () => {
  test('should return user when found', async () => {
    // Success case
  });

  test('should return error when user not found', async () => {
    // Failure case
  });

  test('should return error when id is invalid', async () => {
    // Edge case
  });
});
```

## 🔍 Common TDD Patterns

### 1. Setup and Teardown
```javascript
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
});
```

### 2. Test Data Builders
```javascript
function createValidUser(overrides = {}) {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    ...overrides
  };
}

test('should create user with valid data', async () => {
  const userData = createValidUser();
  // Use userData in test
});
```

### 3. Async Testing
```javascript
test('should handle async operations', async () => {
  const result = await userService.createUser(userData);
  expect(result.success).toBe(true);
});

test('should handle async errors', async () => {
  mockDatabase.createUser.mockRejectedValue(new Error('Database error'));
  
  const result = await userService.createUser(userData);
  expect(result.success).toBe(false);
});
```

## 📊 Test Coverage Goals

### What to Test
- **All public methods**: Every method exposed by your classes
- **Error conditions**: What happens when things go wrong
- **Edge cases**: Boundary conditions and unusual inputs
- **Integration points**: How components work together

### What Not to Test
- **Private methods**: Test through public interface
- **External libraries**: Trust they work, mock them instead
- **Trivial code**: Simple getters/setters without logic

## 🚀 TDD Benefits Demonstrated

1. **Confidence**: All tests pass = code works as expected
2. **Documentation**: Tests show how code should be used
3. **Design**: Writing tests first improves code design
4. **Refactoring**: Tests enable safe code changes
5. **Debugging**: Failed tests pinpoint exact issues

## 📝 TDD Exercises

### Exercise 1: Add New Feature
1. Write test for new endpoint: `GET /api/users/search?email=john@example.com`
2. Watch test fail (Red)
3. Implement minimal code to pass (Green)
4. Improve implementation (Refactor)

### Exercise 2: Fix Bug
1. Write test that reproduces bug
2. Confirm test fails
3. Fix bug to make test pass
4. Ensure all other tests still pass

### Exercise 3: Refactor Code
1. Ensure all tests pass
2. Refactor code structure
3. Run tests to confirm nothing breaks
4. Improve test readability if needed

This project demonstrates TDD principles through practical examples, showing how to build robust, well-tested REST APIs using a test-first approach. 