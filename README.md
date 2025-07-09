# TDD Node.js REST API

A comprehensive sample project demonstrating Test-Driven Development (TDD) principles for building REST APIs with Node.js and Express.js. This project is designed for teaching TDD concepts and showcases proper layered architecture with comprehensive test coverage.

## 🎯 Project Overview

This project demonstrates:
- **Test-Driven Development (TDD)** methodology
- **Layered Architecture** (Controller → Service → Data)
- **Comprehensive Testing** (Unit, Integration, and End-to-End)
- **Mocking and Dependency Injection** for isolated testing
- **REST API Best Practices**
- **Error Handling and Validation**

## 🏗️ Architecture

```
src/
├── app.js              # Main Express application
├── controllers/        # HTTP request handlers
├── services/          # Business logic layer
├── data/              # Data access layer (mock database)
├── routes/            # API route definitions
├── utils/             # Utility functions
└── middleware/        # Custom middleware

tests/
├── controllers/       # Controller layer tests
├── services/         # Service layer tests
├── data/             # Data layer tests
└── integration/      # End-to-end API tests
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tdd-nodejs-rest-api
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

4. Run in development mode with auto-reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Test Coverage Report
```bash
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual components in isolation with mocked dependencies
- **Integration Tests**: Test the complete API flow using supertest
- **Data Layer Tests**: Test database operations with real mock database
- **Service Layer Tests**: Test business logic with mocked data layer
- **Controller Tests**: Test HTTP handling with mocked service layer

## 📚 API Endpoints

### Base URL
```
http://localhost:3000
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and documentation |
| GET | `/api/health` | Health check endpoint |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/stats` | Get user statistics |

### Sample API Calls

#### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

#### Get All Users
```bash
curl http://localhost:3000/api/users
```

#### Update User
```bash
curl -X PUT http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 32
  }'
```

## 🎓 TDD Learning Guide

### 1. Understanding the Layers

#### Data Layer (`src/data/database.js`)
- **Purpose**: Handles data persistence and retrieval
- **Testing**: Tests database operations with actual mock database
- **Key Concepts**: CRUD operations, data validation, error handling

#### Service Layer (`src/services/userService.js`)
- **Purpose**: Contains business logic and validation
- **Testing**: Unit tests with mocked database dependencies
- **Key Concepts**: Business rules, validation, error handling

#### Controller Layer (`src/controllers/userController.js`)
- **Purpose**: Handles HTTP requests and responses
- **Testing**: Unit tests with mocked service dependencies
- **Key Concepts**: HTTP status codes, request/response handling

### 2. TDD Workflow

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green

### 3. Test Examples

#### Unit Test Example (Service Layer)
```javascript
describe('UserService', () => {
  let userService;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      findUserById: jest.fn(),
      createUser: jest.fn()
    };
    userService = new UserService(mockDatabase);
  });

  test('should create user successfully', async () => {
    const userData = { name: 'John', email: 'john@example.com', age: 30 };
    mockDatabase.createUser.mockResolvedValue({ id: '1', ...userData });

    const result = await userService.createUser(userData);

    expect(result.success).toBe(true);
    expect(mockDatabase.createUser).toHaveBeenCalledWith(userData);
  });
});
```

#### Integration Test Example
```javascript
describe('API Integration', () => {
  test('should create and retrieve user', async () => {
    const newUser = { name: 'Test User', email: 'test@example.com', age: 25 };
    
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

## 🔧 Key Features

### Mocking and Dependency Injection
- Services receive dependencies through constructor injection
- Tests use Jest mocks to isolate components
- Clear separation of concerns enables easy testing

### Error Handling
- Comprehensive error handling at all layers
- Proper HTTP status codes
- Detailed error messages for debugging

### Validation
- Input validation at service layer
- Email format validation
- Age range validation
- Required field validation

### Database Simulation
- In-memory mock database with realistic async operations
- Seed data for consistent testing
- Support for all CRUD operations

## 📊 Test Coverage

The project aims for high test coverage across all layers:

- **Data Layer**: 100% coverage of database operations
- **Service Layer**: 100% coverage of business logic
- **Controller Layer**: 100% coverage of HTTP handling
- **Integration Tests**: Complete API workflow coverage

## 🛠️ Development

### Adding New Features

1. **Start with a test**: Write a failing test for the new feature
2. **Implement the feature**: Write minimal code to pass the test
3. **Refactor**: Improve the implementation while keeping tests green
4. **Add integration tests**: Test the feature end-to-end

### Project Structure Guidelines

- Keep layers separated and focused
- Use dependency injection for testability
- Write tests first (TDD approach)
- Mock external dependencies
- Use meaningful test descriptions

## 🤝 Contributing

This is an educational project. Feel free to:
- Add more test examples
- Improve documentation
- Add new features following TDD principles
- Fix bugs or improve code quality

## 📝 License

MIT License - feel free to use this project for educational purposes.

## 🎯 Learning Objectives

After working with this project, you should understand:

1. **TDD Methodology**: Red-Green-Refactor cycle
2. **Layered Architecture**: Separation of concerns
3. **Unit Testing**: Testing components in isolation
4. **Integration Testing**: Testing complete workflows
5. **Mocking**: Isolating dependencies for testing
6. **REST API Design**: Best practices for API development
7. **Error Handling**: Proper error management and HTTP status codes
8. **Validation**: Input validation and data integrity

## 🔍 Next Steps

To extend this project, consider:
- Adding authentication and authorization
- Implementing pagination for user lists
- Adding more complex business rules
- Integrating with a real database
- Adding API documentation with Swagger
- Implementing rate limiting
- Adding logging and monitoring 