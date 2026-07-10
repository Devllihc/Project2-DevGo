# DevGo - Travel Agency Booking System

Welcome to the DevGo repository! DevGo is a full-stack Travel Agency Booking System that helps customers explore tour packages, book trips, and plan personalized itineraries with AI-powered assistance. It features a modern UI with parallax effects, real-time notifications, an admin dashboard, and seamless deployment on Vercel.

## Project Overview

DevGo offers a feature-rich platform where customers can:
- Browse and search through available tour packages
- View detailed tour information with images and pricing
- Book tour packages with a streamlined booking flow
- Receive PDF invoices after booking
- Plan personalized trips using an AI-powered trip planner
- View and manage their booking history and saved trips
- Receive real-time notifications via WebSocket

### Core Features

#### 1. Tour Packages
- Browse all available tour packages with details: title, description, price, available dates, and images
- Advanced search and filtering capabilities
- Detailed tour page with full descriptions and booking options
- Data dynamically fetched from MongoDB

#### 2. Package Booking
- "Book Now" flow with customer information form (name, email, phone, number of travelers, special requests)
- Bookings stored in MongoDB with full audit trail
- Booking history page for users to review past and upcoming trips

#### 3. Invoice Generation
- Automatic PDF invoice generation after booking (via `@react-pdf/renderer`)
- Includes customer details, package information, number of travelers, and calculated total price

#### 4. AI-Powered Trip Planner
- Generate personalized travel itineraries using AI (OpenAI integration)
- Save and manage generated trip plans
- Detailed trip view with day-by-day breakdown
- AI service endpoint: [buihoang/AI_Planner on Hugging Face](https://huggingface.co/buihoang/AI_Planner)

#### 5. Admin Dashboard
- **User Management** – View and manage registered users
- **Booking Management** – View and manage all bookings
- **Tour Management** – Create, update, and delete tour packages (with image upload via Multer)
- Role-based access control with protected admin routes

#### 6. Authentication & Security
- User registration and login with JWT-based authentication
- Forgot password / reset password flow with email support (Nodemailer)
- Protected routes for both user and admin areas

#### 7. Real-Time Notifications
- WebSocket-powered notifications via Socket.IO
- Notification dropdown in the navbar for instant updates

#### 8. Modern UI/UX
- Parallax scrolling sections on key pages (Home, Tours, About)
- Smooth animations with GSAP and Framer Motion
- Dark/Light theme toggle
- Responsive design with TailwindCSS
- Toast notifications for user feedback (react-toastify)

## Tech Stack

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

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- OpenAI API key
- Google Places API key (optional, for place data)

### Clone the Repository
```bash
git clone https://github.com/Devllihc/Project2-DevGo.git
cd Project2-DevGo
```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=8080
   MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/<database_name>
   JWT_SECRET=your_super_secret_string
   AI_SERVICE_URL=https://your-ai-service-url
   GOOGLE_PLACES_API_KEY=your_google_places_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run server
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   VITE_BACKEND_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Setup AI Planner Service
Follow the instructions at: [buihoang/AI_Planner on Hugging Face](https://huggingface.co/buihoang/AI_Planner)

## Project Structure

```
Project2-DevGo/
├── backend/
│   ├── config/           # Database connection config
│   ├── controllers/      # Route handlers (booking, tour, user, planner, notification)
│   ├── middleware/        # Auth middleware (JWT verification)
│   ├── models/           # Mongoose schemas (User, Tour, Booking, Plan, Notification)
│   ├── routes/           # Express route definitions
│   ├── scripts/          # Migration scripts
│   ├── services/         # External services (crawl, Google Places, notifications)
│   ├── uploads/          # Uploaded tour images
│   ├── utils/            # Utilities (email, WebSocket)
│   ├── server.js         # Express app entry point
│   └── vercel.json       # Vercel deployment config
├── frontend/
│   ├── public/           # Static assets (background images)
│   ├── src/
│   │   ├── assets/       # Static assets
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context providers
│   │   ├── pages/        # Page components (Home, Tour, Booking, Admin, etc.)
│   │   ├── App.jsx       # Root component with routing
│   │   └── main.jsx      # App entry point
│   ├── vercel.json       # Vercel SPA rewrite config
│   └── vite.config.js    # Vite configuration
├── docs/                 # Documentation
├── package.json          # Root-level dependencies
└── README.md
```

## API Endpoints

| Method | Endpoint                 | Description                  |
|--------|--------------------------|------------------------------|
| POST   | `/api/user/register`     | Register a new user          |
| POST   | `/api/user/login`        | User login                   |
| GET    | `/api/tours`             | Get all tour packages        |
| GET    | `/api/tours/:id`         | Get tour details by ID       |
| POST   | `/api/tours`             | Create a new tour (admin)    |
| PUT    | `/api/tours/:id`         | Update a tour (admin)        |
| DELETE | `/api/tours/:id`         | Delete a tour (admin)        |
| POST   | `/api/bookings`          | Create a booking             |
| GET    | `/api/bookings`          | Get all bookings             |
| POST   | `/api/planner/generate`  | Generate an AI trip plan     |
| GET    | `/api/notifications`     | Get user notifications       |

## Deployment

Both frontend and backend are configured for deployment on **Vercel**:

- **Frontend**: SPA with client-side routing (rewrites all routes to `/`)
- **Backend**: Serverless Node.js functions via `@vercel/node`

## Contributing

We welcome contributions to enhance DevGo! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes and commit them (`git commit -m "Add your feature"`)
4. Push to your fork (`git push origin feature/your-feature`)
5. Submit a pull request with a description of your changes

## License

This project is for educational purposes.
