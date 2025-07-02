# School Management System - Admin Dashboard

React.js web application for school administrators to manage the school system.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎨 Features

### Admin Dashboard

- Overview statistics (students, teachers, classes, fees)
- Recent activity feed
- Quick action buttons
- Modern, responsive UI with Tailwind CSS

### Pages Included

- **Login**: Admin authentication
- **Dashboard**: Main overview with statistics and recent activity
- **User Management**: Manage students, teachers, and staff
- **Class Management**: Manage classes, subjects, and assignments
- **Fee Management**: Handle student fees and payments
- **Announcements**: Create and manage school announcements

## 🏗️ Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   │   ├── Layout.jsx      # Main layout with sidebar
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── context/      # React Context for state management
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/        # Application pages
│   │   ├── Login.jsx           # Admin login page
│   │   ├── AdminDashboard.jsx  # Main dashboard
│   │   ├── UserManagement.jsx  # User management
│   │   ├── ClassManagement.jsx # Class management
│   │   ├── FeeManagement.jsx   # Fee management
│   │   └── Announcements.jsx   # Announcements
│   ├── App.jsx       # Main app component with routing
│   └── index.css     # Tailwind CSS imports
├── tailwind.config.js # Tailwind configuration
└── package.json      # Dependencies and scripts
```

## 🛠️ Technology Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls

## 🔧 Configuration

### Backend Connection

Update the API base URL in `src/context/AuthContext.jsx`:

```javascript
const API_BASE_URL = "http://your-backend-url:3000/api";
```

### Authentication

The app requires admin-level authentication. Only users with `role: 'admin'` can access the dashboard.

## 🎨 UI Components

### Layout

- Fixed sidebar navigation
- Responsive design
- Modern card-based interface
- Consistent color scheme and typography

### Authentication

- Protected routes
- Automatic token management
- Redirect handling for unauthorized access

## 📱 Responsive Design

The interface is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## 🚀 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 📝 Notes

- This frontend requires a backend API to be running for full functionality
- Default backend URL is set to `http://localhost:3000/api`
- All pages except Dashboard are currently placeholder implementations
- The UI is built with modern design principles and best practices
