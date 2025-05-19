# BTN Pop Content Management System

A comprehensive content management system for a website with news and events sections.

## Project Structure

The project consists of two main parts:
- **Frontend**: React application in the `btnpop-app` directory
- **Backend**: Express/MongoDB API in the `backend` directory

## Setup Instructions

### Quick Start (Running Both Frontend and Backend)

1. The project is configured to use MongoDB Atlas cloud database by default. No local MongoDB installation is required.

2. Install dependencies for both applications:
   ```
   cd backend && npm install
   cd ../btnpop-app && npm install
   ```

3. Initialize the database using our setup script (from the project root):
   ```
   .\init-db.ps1
   ```
   
   This will create an admin user and seed the database with sample content.

4. From the project root, run the development script:
   ```
   .\dev.ps1
   ```
   
   This will start both the backend (http://localhost:5000) and frontend (http://localhost:3000) simultaneously.

### Manual Setup (Backend)

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env` file with the following content:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://Keen:Xz3jGTTzRIHPuwru@lmsdb.95yce3b.mongodb.net/btnpop-cms?retryWrites=true&w=majority
   JWT_SECRET=btnpop_super_secret_key_123
   JWT_EXPIRY=7d
   NODE_ENV=development
   ```

4. The project is configured to use MongoDB Atlas cloud database by default. No local MongoDB installation is required.

5. Create an initial admin user:
   ```
   npm run init-admin
   ```
   
   The default admin credentials are:
   - Email: admin@btnpop.com
   - Password: adminPassword123

6. Seed the database with sample data:
   ```
   npm run seed
   ```

7. Start the backend server:
   ```
   npm run dev
   ```
   
   The server will run on http://localhost:5000.

### Manual Setup (Frontend)

1. Open a new terminal and navigate to the frontend directory:
   ```
   cd btnpop-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   
   The frontend will run on http://localhost:3000.

## Features

### News Management
- View news listings with filters (featured, trending, latest)
- Create, edit and delete news articles through the admin dashboard
- Upload images for news articles
- Responsive news cards with different variants

### Events Management
- View upcoming and past events
- Create, edit and delete events through the admin dashboard
- Upload images for events
- Event registration functionality

### Admin Dashboard
- Secure login system
- Content management interface for news and events
- User management (admin users only)
- Media upload capabilities

## API Documentation

Detailed API documentation can be found in the [backend/README.md](backend/README.md) file.

## User Roles

- **Admin**: Can manage all content and users
- **Editor**: Can manage news and events, but not users

## Technologies Used

### Frontend
- React
- React Router
- Axios
- Framer Motion (for animations)
- React-Quill (rich text editor)
- CSS Modules

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Multer (for file uploads)
- bcryptjs (for password hashing)
