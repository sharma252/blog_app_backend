# Blog API

A complete RESTful API for a blog application built with Node.js, Express.js, and MongoDB (MEN Stack).

## Features

- **Authentication & Authorization**

  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Password hashing with bcrypt

- **User Management**

  - User profiles with avatars and bio
  - Admin user management
  - User statistics

- **Blog Posts**

  - Create, read, update, delete posts
  - Post status management (draft, published, archived)
  - Categories and tags
  - Featured images
  - Automatic slug generation
  - Reading time calculation
  - Post search and filtering

- **Engagement Features**

  - Like/unlike posts
  - Comments system
  - View tracking

- **Security & Performance**
  - Rate limiting
  - CORS protection
  - Helmet for security headers
  - Input validation and sanitization
  - Error handling middleware

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Validation:** Express Validator
- **Security:** Helmet, CORS, Rate Limiting
- **Password Hashing:** bcryptjs

## Project Structure

```
blog-api/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management logic
│   └── postController.js     # Blog post logic
├── middlewares/
│   ├── authMiddleware.js     # Authentication middleware
│   └── errorHandler.js       # Error handling middleware
├── models/
│   ├── User.js              # User schema
│   └── Post.js              # Post schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── userRoutes.js        # User management routes
│   └── postRoutes.js        # Blog post routes
├── utils/
│   └── generateToken.js     # JWT token generation
├── .env                     # Environment variables
├── app.js                   # Express app configuration
├── server.js               # Server entry point
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd blog-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/blogapi
   JWT_SECRET=---
   JWT_EXPIRE=30d
   API_VERSION=v1
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**

   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile (Protected)
- `PUT /me` - Update user profile (Protected)
- `PUT /change-password` - Change password (Protected)

### User Routes (`/api/v1/users`)

- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID (Admin only)
- `PUT /:id` - Update user (Admin only)
- `DELETE /:id` - Delete user (Admin only)
- `GET /:id/posts` - Get user's posts (Public)

### Post Routes (`/api/v1/posts`)

- `GET /` - Get all published posts (Public)
- `GET /:id` - Get post by ID (Public)
- `GET /slug/:slug` - Get post by slug (Public)
- `GET /user/my-posts` - Get current user's posts (Protected)
- `POST /` - Create new post (Protected)
- `PUT /:id` - Update post (Protected - Owner/Admin)
- `DELETE /:id` - Delete post (Protected - Owner/Admin)
- `PUT /:id/like` - Like/unlike post (Protected)
- `POST /:id/comments` - Add comment (Protected)
- `DELETE /:id/comments/:commentId` - Delete comment (Protected)

## Request Examples

### Register User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Create Post

```bash
POST /api/v1/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post...",
  "excerpt": "A brief description of the post",
  "category": "technology",
  "tags": ["nodejs", "mongodb", "api"],
  "status": "published"
}
```

### Get Posts with Filters

```bash
GET /api/v1/posts?page=1&limit=10&category=technology&search=nodejs&sort=popular
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "count": 10,
  "total": 100,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  }
}
```

## Error Handling

Errors are returned in this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

## Security Features

- **Rate Limiting:** 100 requests per 15 minutes for general API, 5 requests per 15 minutes for auth endpoints
- **CORS:** Configured for specific origins
- **Helmet:** Security headers
- **JWT:** Secure token-based authentication
- **Password Hashing:** bcrypt with salt
- **Input Validation:** Express validator for all inputs

## Database Models

### User Model

- name, email, password (hashed)
- role (user/admin)
- avatar, bio
- timestamps, active status

### Post Model

- title, content, excerpt
- author (User reference)
- status (draft/published/archived)
- slug (auto-generated)
- tags, category
- likes, comments, views
- timestamps, published date

## Development

```bash
# Install development dependencies
npm install --save-dev nodemon

# Run in development mode
npm run dev

# The API will be available at http://localhost:5000
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set strong JWT secret
4. Configure proper CORS origins
5. Use process managers like PM2
6. Set up reverse proxy (nginx)
7. Enable HTTPS
