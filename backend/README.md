# BTN Pop CMS Backend

This is the backend server for the BTN Pop Content Management System (CMS). It provides API endpoints for managing news, events, and user authentication.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://Keen:Xz3jGTTzRIHPuwru@lmsdb.95yce3b.mongodb.net/btnpop-cms?retryWrites=true&w=majority
   JWT_SECRET=btnpop_super_secret_key_123
   JWT_EXPIRY=7d
   NODE_ENV=development
   ```

3. Create an `uploads` directory in the root folder:
   ```
   mkdir uploads
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/login** - Login user
  - Body: `{ email, password }`
  - Returns: JWT token and user info

- **POST /api/auth/register** - Register new user (admin only)
  - Body: `{ username, email, password, role }`
  - Returns: JWT token and user info

- **GET /api/auth/me** - Get current user info
  - Headers: `Authorization: Bearer <token>`
  - Returns: User info

- **GET /api/auth/users** - Get all users (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of users

- **PUT /api/auth/users/:id** - Update user (admin only or own account)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ username, email, role }`
  - Returns: Updated user info

- **DELETE /api/auth/users/:id** - Delete user (admin only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### News

- **GET /api/news** - Get all news with pagination and filters
  - Query params: `page`, `limit`, `category`, `featured`, `trending`, `search`
  - Returns: Paginated news articles

- **GET /api/news/:id** - Get news by ID or slug
  - Returns: Single news article

- **POST /api/news** - Create new news article (admin/editor only)
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with `title`, `subtitle`, `content`, `author`, `category`, `tags`, `featured`, `trending`, and optional `image` file
  - Returns: Created news article

- **PUT /api/news/:id** - Update news article (admin/editor only)
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with fields to update and optional `image` file
  - Returns: Updated news article

- **DELETE /api/news/:id** - Delete news article (admin/editor only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

### Events

- **GET /api/events** - Get all events with pagination and filters
  - Query params: `page`, `limit`, `upcoming`, `category`, `featured`, `search`, `startDate`, `endDate`
  - Returns: Paginated events

- **GET /api/events/:id** - Get event by ID or slug
  - Returns: Single event

- **POST /api/events** - Create new event (admin/editor only)
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with `title`, `description`, `eventDate`, `location`, `organizer`, `category`, `registrationUrl`, `registrationRequired`, `isFeatured`, and optional `image` file and `endDate`
  - Returns: Created event

- **PUT /api/events/:id** - Update event (admin/editor only)
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with fields to update and optional `image` file
  - Returns: Updated event

- **DELETE /api/events/:id** - Delete event (admin/editor only)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Success message

## Models

### User Model
- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: ['admin', 'editor'], default: 'editor')
- createdAt (Date, default: Date.now)
- lastLogin (Date)

### News Model
- title (String, required)
- subtitle (String)
- content (String, required)
- author (String, required)
- imageUrl (String)
- category (String, enum: ['Feature', 'Trending', 'Latest', 'General'])
- tags (Array of Strings)
- publishDate (Date, default: Date.now)
- updatedAt (Date, default: Date.now)
- featured (Boolean, default: false)
- trending (Boolean, default: false)
- views (Number, default: 0)
- slug (String, required, unique)

### Event Model
- title (String, required)
- description (String, required)
- imageUrl (String)
- eventDate (Date, required)
- endDate (Date)
- location (String, required)
- organizer (String, required)
- category (String, enum: ['Conference', 'Workshop', 'Meetup', 'Concert', 'Exhibition', 'Other'])
- isUpcoming (Boolean, default: true, auto-set based on date)
- isFeatured (Boolean, default: false)
- registrationUrl (String)
- registrationRequired (Boolean, default: false)
- createdAt (Date, default: Date.now)
- updatedAt (Date, default: Date.now)
- slug (String, required, unique)
