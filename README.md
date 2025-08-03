# RentApp - Rental Management System

A full-stack rental management application built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd RentApp
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `server` directory:
   ```
   MONGO_URI=mongodb://localhost:27017/rentapp
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Start the application:**
   ```bash
   # Start server (from server directory)
   cd server && npm run dev
   
   # Start client (from client directory)
   cd client && npm start
   ```

   Or use the provided batch file:
   ```bash
   start-app.bat
   ```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Install MongoDB locally: https://docs.mongodb.com/manual/installation/
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
   - Update the MONGO_URI in `.env` file

2. **Client Dependencies Issues**
   - Delete `node_modules` and `package-lock.json` in client directory
   - Run `npm install` again

3. **Server Dependencies Issues**
   - Delete `node_modules` and `package-lock.json` in server directory
   - Run `npm install` again

4. **Port Already in Use**
   - Change the PORT in `.env` file
   - Or kill the process using the port

### Demo Accounts

- **Admin:** admin@rentapp.com / admin123
- **User:** user@rentapp.com / user123

## 📁 Project Structure

```
RentApp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── admin/         # Admin components
│   │   ├── auth/          # Authentication components
│   │   └── user/          # User components
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   └── pdf/              # PDF receipts
└── start-app.bat         # Windows startup script
```

## 🛠️ Development

### API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/health` - Server health check
- `GET /api/admin/*` - Admin routes
- `GET /api/tenants/*` - Tenant management
- `GET /api/payments/*` - Payment processing

### Database Models

- **User** - Authentication and user management
- **Tenant** - Tenant information and rent details
- **Property** - Property management
- **RentPayment** - Payment tracking

## 🚀 Deployment

1. **Backend:** Deploy to Heroku, Vercel, or similar
2. **Frontend:** Deploy to Netlify, Vercel, or similar
3. **Database:** Use MongoDB Atlas for production

## 📝 License

This project is licensed under the MIT License. 