# Smart Attendance, Leave & AI Chatbot Management System - Frontend

A modern, responsive frontend application built with React, Vite, and Tailwind CSS for managing student attendance, leave applications, and AI-powered chatbot assistance.

## 🚀 Features

### Authentication

- ✅ Secure login with JWT token management
- ✅ Role-based access control (Student/Admin)
- ✅ Protected routes with automatic redirect

### Student Features

- ✅ Interactive Dashboard with attendance statistics and charts
- ✅ Mark daily attendance with calendar view
- ✅ Apply for leave with reason and date selection
- ✅ View leave application status (Pending/Approved/Rejected)
- ✅ Download attendance reports as PDF
- ✅ Profile management with photo upload
- ✅ Password change functionality

### Admin Features

- ✅ Comprehensive dashboard with system overview
- ✅ Student management (Add/Edit/Delete)
- ✅ Attendance reports with filtering and export
- ✅ Leave request approval/rejection system
- ✅ AI Chatbot analytics and monitoring
- ✅ System settings and configuration

### Global Features

- ✅ Floating AI Chatbot on every page
- ✅ Dark mode support
- ✅ Responsive design for all devices
- ✅ Professional UI with Tailwind CSS
- ✅ Interactive charts with Recharts
- ✅ Real-time notifications

## 🛠️ Tech Stack

- **Framework:** React 18.3
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Context API

## 📦 Installation

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint:**
   The API is proxied through Vite config. Update `vite.config.js` if needed:

   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080', // Your Spring Boot backend URL
         changeOrigin: true
       }
     }
   }
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Alert.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Chatbot.jsx     # AI Chatbot widget
│   │   ├── Input.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Select.jsx
│   │   ├── Sidebar.jsx
│   │   └── Textarea.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentAttendance.jsx
│   │   │   └── StudentLeave.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ManageStudents.jsx
│   │   │   ├── AttendanceReports.jsx
│   │   │   ├── LeaveRequests.jsx
│   │   │   ├── ChatbotAnalytics.jsx
│   │   │   └── Settings.jsx
│   │   ├── Profile.jsx
│   │   └── DownloadPDF.jsx
│   │
│   ├── context/             # React Context
│   │   └── AuthContext.jsx
│   │
│   ├── layouts/             # Layout components
│   │   └── Layout.jsx
│   │
│   ├── utils/               # Utility functions
│   │   ├── api.js          # Axios configuration
│   │   └── apiService.js   # API service functions
│   │
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
│
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔌 API Integration

All API calls are made through the `apiService.js` file. Update the endpoints to match your Spring Boot backend:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Attendance

- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/my` - Get student attendance
- `GET /api/attendance/all` - Get all attendance (Admin)
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/subject-wise` - Subject-wise attendance

### Leave

- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/my` - Get student leaves
- `GET /api/leave/all` - Get all leaves (Admin)
- `PUT /api/leave/:id/approve` - Approve leave
- `PUT /api/leave/:id/reject` - Reject leave

### Students (Admin)

- `GET /api/students` - Get all students
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Chatbot

- `POST /api/chatbot/ask` - Send message to chatbot
- `GET /api/chatbot/history` - Get chat history
- `GET /api/chatbot/analytics` - Get chatbot analytics (Admin)

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password
- `POST /api/profile/photo` - Upload profile photo

### PDF

- `GET /api/pdf/attendance` - Download attendance PDF

### Dashboard

- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/admin` - Admin dashboard data

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the primary color:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    // ... customize colors
  }
}
```

### Dark Mode

Dark mode is implemented using Tailwind's dark mode. Toggle in the Navbar.

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token is stored in localStorage
3. Token is automatically added to all API requests
4. On 401 error, user is redirected to login
5. Protected routes check for valid token

## 👥 Demo Credentials

**Student:**

- Email: `student@test.com`
- Password: `password`

**Admin:**

- Email: `admin@test.com`
- Password: `password`

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

The sidebar collapses into a hamburger menu on mobile devices.

## 🤖 AI Chatbot

The floating chatbot appears on all pages after login. It can:

- Answer attendance-related questions
- Help with leave applications
- Guide users through the system
- Provide quick information

Connect to your backend endpoint at `/api/chatbot/ask`.

## 📊 Charts & Visualization

Using Recharts library for:

- Bar charts (attendance by subject)
- Line charts (attendance trends)
- Pie charts (department-wise distribution)

## 🚧 Development

### Hot Module Replacement (HMR)

Vite provides fast HMR for rapid development.

### Code Structure

- Components are modular and reusable
- Context API for global state management
- Clean separation of concerns

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is part of the Smart Attendance Management System.

## 🤝 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using React + Vite + Tailwind CSS
