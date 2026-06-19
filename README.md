# MERN Stack Project Starter

A fully configured, clean, and modular MERN stack boilerplate featuring a CommonJS backend and a Vite React frontend.

## Directory Structure

```text
/
├── backend/
│   ├── config/             # Database & Cloudinary file-upload configurations
│   ├── controllers/        # Express route business logic controllers
│   ├── models/             # Mongoose schemas (User, Profile, Project, Timeline)
│   ├── routes/             # Express API routing definitions
│   ├── middleware/         # Security & authentication middlewares
│   ├── utils/              # Helper utilities (token generator)
│   ├── server.js           # Express main server entry point
│   ├── .env.example        # Reference environment variables template
│   ├── .env                # Local secrets (git-ignored)
│   └── package.json        # Backend scripts & dependencies (CommonJS format)
│
└── frontend/
    ├── src/
    │   ├── api/            # API client configurations (Axios instance)
    │   ├── components/     # Reusable UI component modules
    │   ├── layouts/        # Layout wrappers
    │   ├── pages/          # Routing page views
    │   ├── redux/          # Redux toolkit store configurations
    │   ├── App.jsx         # Main application display & live connection status
    │   ├── index.css       # Tailwind CSS v4 styling file
    │   └── main.jsx        # React entry mount point
    │
    ├── .env                # Local frontend variables
    ├── vite.config.js      # Vite build configuration (including Tailwind v4)
    └── package.json        # Frontend scripts & dependencies
```

---

## Setup & Running Guide

Ensure you have [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com/) installed and running on your system.

### 1. Backend Setup

1. Open a terminal and navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   ```bash
   copy .env.example .env
   ```
   *(On macOS/Linux, use `cp .env.example .env`)*
4. Configure variables in your `.env`:
   - `MONGO_URI`: Your MongoDB database connection string.
   - `JWT_SECRET`: Secret key for JWT signing.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials from your Cloudinary account.
5. Run the development server (runs on port `5000` by default, reloads on file changes):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs on port `5173` by default):
   ```bash
   npm run dev
   ```

---

## API Documentation & Routes

All routes are prefixed with `/api`.

### 🔐 Authentication Routes (`/api/auth`)
- `POST /register`: Registers a single admin user (returns `403` if an admin already exists in the system).
- `POST /login`: Validates password and issues an `httpOnly` session cookie named `token`.
- `POST /logout`: Clears the session cookie.
- `GET /me`: *(Protected)* Retrieves profile information of the logged-in admin user.

### 👤 Profile Routes (`/api/profile`)
- `GET /`: *(Public)* Retrieves the admin profile (returns `null` if database is empty).
- `PUT /`: *(Protected)* Upserts the single admin profile details.
- `POST /skills`: *(Protected)* Pushes a new skill subdocument into the profile's skills array.
- `PUT /skills/:id`: *(Protected)* Updates an existing skill's proficiency by nested ID.
- `DELETE /skills/:id`: *(Protected)* Removes a skill by nested ID.

### 📅 Timeline & Experience Routes (`/api/timeline`)
- `GET /`: *(Public)* Fetches experience timeline entries sorted by the `from` date in descending order.
- `POST /`: *(Protected)* Creates a new experience entry.
- `PUT /:id`: *(Protected)* Updates a timeline entry.
- `DELETE /:id`: *(Protected)* Deletes a timeline entry.

### 📁 Project Portfolio Routes (`/api/projects`)
- `GET /`: *(Public)* Retrieves all projects. Supports optional category filtering (e.g. `?category=webdev` or `?category=robotics`).
- `GET /:id`: *(Public)* Retrieves details of a single project by ID.
- `POST /`: *(Protected)* Creates a project. Accepts `multipart/form-data` with an `'image'` file upload (processed in-memory and streamed directly to Cloudinary).
- `PUT /:id`: *(Protected)* Updates project details. Replaces file on Cloudinary if a new image buffer is supplied.
- `DELETE /:id`: *(Protected)* Deletes the project document and removes the corresponding asset from Cloudinary.

### ✉️ Contact Message Routes (`/api/messages`)
- `POST /`: *(Public)* Submits a new contact message.
- `GET /`: *(Protected)* Retrieves all contact messages sorted by newest first.
- `PUT /:id`: *(Protected)* Marks a message as read by ID.
- `DELETE /:id`: *(Protected)* Deletes a message by ID.

---

## Architecture Details

- **CommonJS Design**: Rewritten to CommonJS format. Configures environment variables synchronously on line 1 of the server launch.
- **Memory Storage Uploads**: Images are streamed directly to Cloudinary using in-memory buffers (`multer.memoryStorage()`) rather than saving temporary files locally.
- **Tailwind CSS v4**: Integrated in the frontend using Vite's modern CSS-first `@tailwindcss/vite` plugin and `@theme` parameters.
- **State Management**: Built-in state modules configured via Redux Toolkit (`@reduxjs/toolkit` and `react-redux`).
