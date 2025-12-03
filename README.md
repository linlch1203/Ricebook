# Assignment 6 - Backend Implementation

## Student Information

- **netid**: cl278
- **frontend**: https://outrageous-table.surge.sh
- **backend**: https://cl278-backend.herokuapp.com

## Test User

- **Username**: `testuser1`
- **Password**: `12345678`

## Project Structure

\`\`\`
backend/
├── src/
│ ├── auth.js # Authentication routes (login, register, logout, google)
│ ├── articles.js # Article routes (get, post, put)
│ ├── profile.js # Profile routes (get, put)
│ ├── following.js # Following routes (get, put, delete)
│ ├── passport.js # Passport configuration
│ ├── uploadCloudinary.js # Cloudinary middleware
│ └── ...
├── index.js # Main server entry point
└── ...
src/
├── ... (Frontend source code)
\`\`\`

## Features Implemented

1.  **Authentication**:

    - Local registration and login with salt+hash (md5).
    - Google OAuth 2.0 login.
    - Session management via HTTP-only cookies.
    - Logout clears session and cookie.
    - Account linking/unlinking (Google).

2.  **Articles**:

    - Fetch articles for logged-in user and followed users.
    - Pagination support (`?page=X&limit=Y`).
    - Create new articles with text and optional image (Cloudinary).
    - Edit article text.
    - Add and edit comments.

3.  **Profile**:

    - View and update headline, email, zipcode, phone, display name.
    - Upload/update profile avatar (Cloudinary).
    - View and update following list.

4.  **Persistence**:
    - MongoDB Atlas used for data storage.
    - Cloudinary used for image storage.

## How to Run

### Backend

1.  Navigate to `backend/` directory.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file with:
    ```
    MONGODB_URI=<your_mongodb_uri>
    CLOUDINARY_URL=<your_cloudinary_url>
    GOOGLE_CLIENT_ID=<your_google_client_id>
    GOOGLE_CLIENT_SECRET=<your_google_client_secret>
    FRONTEND_URL=http://localhost:5173
    ```
4.  Start server: `npm start` (or `npm run dev` for nodemon).
5.  Run tests: `npm test`.

### Frontend

1.  Navigate to root directory.
2.  Install dependencies: `npm install`.
3.  Start dev server: `npm run dev`.

## Testing

- **Backend Tests**: Run `npm test` in `backend/` folder.
- **Manual Testing**:
  - Register a new user.
  - Log in.
  - Update status headline.
  - Post an article with an image.
  - Follow a user (e.g., `joey`).
  - Check feed for your posts and followed user's posts.
  - Edit your post.
  - Comment on a post.
  - Edit your comment.
  - Go to Profile page and update avatar.
  - Link Google account (if configured).
  - Log out.
