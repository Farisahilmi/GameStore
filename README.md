# 🎮 GameStore Project

GameStore is a full-stack e-commerce web application for digital games, featuring a modern React frontend and a robust Express.js backend with SQLite database.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)

## 🛠️ Installation & Setup

### 1. Clone or Download the Repository

If you haven't already, download the project source code to your local machine.

### 2. Backend Setup (Server)

The server handles the API, database, and authentication.

1.  Open a terminal and navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    - Create a `.env` file in the `server` folder (or check if one exists).
    - Ensure it contains the following configuration for local development:
      ```env
      DATABASE_URL="file:./dev.db"
      PORT=3000
      JWT_SECRET="supersecretkey_gamestore_project"
      FRONTEND_URL="http://localhost:5173"
      ```
4.  Initialize the Database (SQLite) & Seed Data:
    ```bash
    npx prisma migrate dev --name init
    node prisma/seed.js
    ```
5.  Start the Server:
    ```bash
    node index.js
    ```
    *(The server will run on http://localhost:3000)*

### 3. Frontend Setup (Client)

The client is the user interface built with React and Vite.

1.  Open a **new** terminal window (keep the server running).
2.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Set up environment variables:
    - Create a `.env` file in the `client` folder.
    - Add the API URL configuration:
      ```env
      VITE_API_URL="http://localhost:3000"
      ```
5.  Start the Client:
    ```bash
    npm run dev
    ```
    *(The client will run on http://localhost:5173)*

## 🏃‍♂️ How to Use

1.  Open your browser and visit **http://localhost:5173**.
2.  **Browse Games:** You can view the list of available games immediately.
3.  **Register/Login:** To purchase games or use the wishlist, create a new account.
    - Click **Login** > **Create Account**.
4.  **Admin/Publisher Access:**
    The database comes pre-seeded with some special accounts if you want to test advanced features:
    - **Admin:** `admin@gamestore.com` / `password123`
    - **Publisher (Rockstar):** `publisher@rockstar.com` / `password123`
    - **Publisher (Sony):** `publisher@sony.com` / `password123`

## 🗄️ Database Management (Optional)

If you want to view or edit the database manually:

1.  In the `server` directory, run:
    ```bash
    npx prisma studio
    ```
2.  Open **http://localhost:5555** in your browser.

## ⚠️ Troubleshooting

- **Blank Screen?**
  - Ensure both Server (port 3000) and Client (port 5173) terminals are running.
  - Check browser console (F12) for errors.
- **Database Error?**
  - If you see migration errors, try deleting `server/prisma/dev.db` and `server/prisma/migrations` folder, then re-run the migration command in step 2.4.

---
*Happy Gaming!* 🕹️
