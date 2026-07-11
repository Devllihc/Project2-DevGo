# DevGo - Comprehensive Travel Agency Booking System

Welcome to the **DevGo** repository! DevGo is a Full-Stack Travel Agency Booking System designed to help customers explore tour packages, book trips, and plan personalized itineraries with the help of AI. The project features a modern user interface with parallax effects, real-time notifications, an admin dashboard, and is easily deployable on Vercel.

## 🌟 Project Overview

DevGo provides a feature-rich platform where customers can:
- Browse and explore available tour packages.
- View detailed tour information, including images and pricing.
- Book tours with a fast and seamless process.
- Receive PDF invoices immediately after a successful booking.
- Plan personalized trips using the AI Trip Planner feature.
- View and manage booking history and saved trips.
- Receive real-time notifications via WebSocket.

### 🚀 Core Features

#### 1. Tour Packages Management
- Explore tours with full details: title, description, price, available dates, and images.
- Advanced search and filtering capabilities.
- Detailed tour page with comprehensive information and booking options.
- Dynamic data fetched from MongoDB.

#### 2. Package Booking
- "Book Now" flow with a customer information form (name, email, phone, number of travelers, special requests).
- Bookings are saved in MongoDB for tracking and management.
- History page for users to review past or upcoming trips.

#### 3. Invoice Generation
- Automatically generate PDF invoices after a successful booking (using `@react-pdf/renderer`).
- Includes customer details, tour package, number of travelers, and total cost.

#### 4. AI-Powered Trip Planner
- Create personalized travel itineraries using AI technology (OpenAI Integration).
- Save and manage generated trip plans.
- Display detailed itineraries broken down day by day.
- Backend AI service: [buihoang/AI_Planner on Hugging Face](https://huggingface.co/buihoang/AI_Planner)

#### 5. Admin Dashboard
- **User Management:** View and manage the list of registered users.
- **Booking Management:** View and control all tour bookings.
- **Tour Management:** Add, edit, or delete tours (supports image upload via Multer).
- Role-based access control with secure protected routes.

#### 6. Authentication & Security
- Registration and Login using JWT.
- Forgot/Reset password functionality with Email support (Nodemailer).
- Protected routes for both regular users and admins.

#### 7. Real-Time Notifications
- Notifications using WebSocket (Socket.IO).
- Direct notification dropdown in the navigation bar.

#### 8. Modern UI/UX
- Parallax scrolling effects on core pages (Home, Tours, About).
- Smooth animations using GSAP and Framer Motion.
- Light/Dark mode toggle.
- Fully responsive design using TailwindCSS.
- Toast notifications for user feedback (react-toastify).

## 🛠 Tech Stack

| Layer        | Technologies                                            |
|--------------|----------------------------------------------------------|
| **Frontend** | React 18, React Router v7, TailwindCSS, Vite            |
| **Backend**  | Node.js, Express.js, Socket.IO                           |
| **Database** | MongoDB (Mongoose ODM)                                   |
| **AI**       | OpenAI API, Custom AI Planner service                    |
| **Auth**     | JWT, bcryptjs                                            |
| **Email**    | Nodemailer                                               |
| **PDF**      | @react-pdf/renderer                                      |
| **Animation**| GSAP, Framer Motion                                      |
| **Icons**    | Lucide React, Phosphor Icons                             |
| **Deploy**   | Vercel (frontend + backend)                              |

## ⚙️ Installation Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or on Atlas)
- OpenAI API key
- Google Places API key (Optional, used for fetching place data)

### 1. Clone the Repository
```bash
git clone https://github.com/Devllihc/Project2-DevGo.git
cd Project2-DevGo
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy and rename `.env.example` to `.env`, then fill in the appropriate values:
   ```env
   PORT=8080
   MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/<database_name>
   # See .env.example for more details
   ```
4. Start the server:
   ```bash
   npm run server # (For dev environment, with auto-reload)
   # or npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```env
   VITE_BACKEND_URL=http://localhost:8080
   ```
4. Start the development environment:
   ```bash
   npm run dev
   ```

### 4. AI Planner Service Setup
If you want to run the self-hosted AI service, please follow the instructions at: [buihoang/AI_Planner on Hugging Face](https://huggingface.co/buihoang/AI_Planner)

## 📁 Project Structure

```
Project2-DevGo/
├── backend/
│   ├── config/           # Database connection config, etc.
│   ├── controllers/      # Logic handling (booking, tour, user, planner, notification)
│   ├── middleware/       # Authentication middlewares (JWT verification)
│   ├── models/           # Mongoose schemas (User, Tour, Booking, Plan, Notification)
│   ├── routes/           # Express route definitions
│   ├── scripts/          # Utility scripts (e.g., verify accounts)
│   ├── services/         # External service integrations (crawling, Google Places, email)
│   ├── uploads/          # Uploaded image directory
│   ├── utils/            # Utilities (WebSocket, formatting)
│   ├── server.js         # Backend entry point file
│   └── vercel.json       # Vercel deployment configuration
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # Shared UI Components
│   │   ├── context/      # React Context (State management)
│   │   ├── pages/        # Main pages (Home, Tour, Booking, Admin, ...)
│   │   ├── App.jsx       # Root Component and Routing
│   │   └── main.jsx      # React entry point
│   ├── vercel.json       # Vercel configuration for React SPA
│   └── vite.config.js    # Vite configuration
├── docs/                 # Project documentation
├── package.json          # Root-level dependencies (if any)
└── README.md
```

## 🌐 Basic API Endpoints

| Method | Endpoint                 | Description                  |
|--------|--------------------------|------------------------------|
| POST   | `/api/user/register`     | Register a new user          |
| POST   | `/api/user/login`        | User login                   |
| GET    | `/api/tours`             | Get list of tours            |
| GET    | `/api/tours/:id`         | Get tour details             |
| POST   | `/api/tours`             | Create a new tour (Admin)    |
| PUT    | `/api/tours/:id`         | Update a tour (Admin)        |
| DELETE | `/api/tours/:id`         | Delete a tour (Admin)        |
| POST   | `/api/bookings`          | Create a new booking         |
| GET    | `/api/bookings`          | Get list of bookings         |
| POST   | `/api/planner/generate`  | Request AI to generate plan  |
| GET    | `/api/notifications`     | Get personal notifications   |

## 🚀 Deployment

The project is pre-configured for easy deployment to **Vercel**:
- **Frontend**: Operates as a Single Page App (SPA) (automatically rewrites to `/`).
- **Backend**: Operates as Node.js Serverless Functions via `@vercel/node`.

## 🤝 Contributing

Any contributions to improve DevGo are welcome! Basic workflow:
1. Fork this repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make changes and commit (`git commit -m "Add feature X"`).
4. Push to your fork (`git push origin feature/your-feature-name`).
5. Open a Pull Request with a detailed description.

## 📝 License

This project is created for educational and research purposes.
