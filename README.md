# UNIVO – Hyperlocal Borrowing and Rental Platform

UNIVO is a MERN Stack-based platform that allows users to borrow and rent items within their local community. It helps people discover nearby available items, connect with other users, and manage item availability conveniently.

## 🚀 Features

- **User Authentication:** Secure user registration and login.
- **Item Listings:** Add, manage, and explore items available for borrowing or renting.
- **Nearby Discovery:** Discover items available in your local area.
- **Availability Calendar:** Manage and check item availability.
- **Responsive UI:** User-friendly interface for different screen sizes.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Tools**
- Git & GitHub
- VS Code
- Postman
- MongoDB Atlas

## 📁 Project Structure

```text
UNIVO/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ashraffazil2006-lang/UNIVO.git
cd UNIVO
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Add your own MongoDB connection string and JWT secret. Never upload `.env` to GitHub.

### 5. Run the Backend

From the server folder:

```bash
npm run start
```

### 6. Run the Frontend

From the client folder:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🎯 Project Objective

The main objective of UNIVO is to promote resource sharing within local communities by providing a convenient platform for borrowing and renting items instead of purchasing them unnecessarily.

## 👨‍💻 Contributors

Developed as a team project using the MERN Stack.

## 📄 License

This project is developed for educational purposes.
