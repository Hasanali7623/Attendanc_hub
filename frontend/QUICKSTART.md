# 🚀 Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Navigate to Frontend Directory

```bash
cd "h:\MCA ALL PROJECT\Smart Attendance, Leave , AI Chatbot Management System\frontend"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:

- React 18.3
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- Lucide React icons

### Step 3: Start Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

### Step 4: Login

Open your browser and go to http://localhost:3000/login

**Student Login:**

- Email: `student@test.com`
- Password: `password`

**Admin Login:**

- Email: `admin@test.com`
- Password: `password`

## 📋 What's Included

### ✅ Complete Pages

1. **Authentication**

   - Login page with form validation

2. **Student Pages**

   - Dashboard (attendance stats, charts)
   - Attendance (mark attendance, calendar view)
   - Leave (apply, view status)
   - Profile (update info, change password)
   - Download PDF (generate reports)

3. **Admin Pages**

   - Dashboard (system overview)
   - Manage Students (CRUD operations)
   - Attendance Reports (view, filter, export)
   - Leave Requests (approve/reject)
   - Chatbot Analytics (usage stats)
   - Settings (system configuration)

4. **Global Features**
   - Floating AI Chatbot
   - Responsive Navbar
   - Collapsible Sidebar
   - Dark mode toggle

### 🎨 UI Components

All reusable components are ready:

- Alert, Badge, Button, Card
- Input, Select, Textarea
- Modal, Loader
- Navbar, Sidebar

### 🔌 API Integration

All API service functions are configured in `src/utils/apiService.js`:

- Authentication APIs
- Attendance APIs
- Leave APIs
- Student Management APIs
- Chatbot APIs
- Profile & PDF APIs

## 🛠️ Configuration

### Backend URL

Update in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080', // Change to your backend URL
    changeOrigin: true
  }
}
```

### JWT Token

Automatically stored in localStorage and added to all requests.

## 📱 Features to Test

1. **Login** → Try both student and admin accounts
2. **Student Dashboard** → View attendance cards and charts
3. **Mark Attendance** → Click "Mark Present" button
4. **Apply Leave** → Fill form and submit
5. **Admin Dashboard** → View system statistics
6. **Manage Students** → Add/Edit/Delete students
7. **Approve Leave** → Review and approve/reject
8. **AI Chatbot** → Click floating button and chat
9. **Download PDF** → Select month/year and generate
10. **Dark Mode** → Toggle in navbar

## 🎯 Next Steps

### Connect to Backend

1. Ensure Spring Boot backend is running on port 8080
2. Update API endpoints if needed
3. Test all API integrations

### Customize

1. Change primary colors in `tailwind.config.js`
2. Update logo and branding
3. Modify demo credentials

### Deploy

```bash
npm run build
```

Outputs to `dist/` folder - ready for production!

## 📚 Folder Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   │   ├── auth/        # Login page
│   │   ├── student/     # Student pages
│   │   └── admin/       # Admin pages
│   ├── context/         # Auth context
│   ├── layouts/         # Layout wrapper
│   ├── utils/           # API services
│   ├── App.jsx          # Main app
│   └── index.css        # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 💡 Tips

1. **Development:**

   - Use React DevTools for debugging
   - Check Console for API errors
   - Use Network tab to monitor requests

2. **Styling:**

   - All Tailwind classes are configured
   - Dark mode uses `dark:` prefix
   - Responsive uses `md:`, `lg:` prefixes

3. **State Management:**
   - Auth state in Context API
   - Local state with useState
   - No Redux needed for this size

## ❓ Troubleshooting

**Port already in use:**

```bash
# Change port in vite.config.js
server: { port: 3001 }
```

**API not connecting:**

- Check backend is running
- Verify proxy configuration
- Check CORS settings on backend

**Dependencies error:**

```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

## 🎉 You're Ready!

Your complete frontend is ready to integrate with Spring Boot APIs.

All pages are:

- ✅ Fully functional
- ✅ Responsive
- ✅ Professional UI
- ✅ Ready for API integration

**Happy Coding! 🚀**
