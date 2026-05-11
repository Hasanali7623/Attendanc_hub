# Smart Attendance, Leave & AI Chatbot Management System - Backend

A comprehensive Spring Boot backend application for managing student attendance, leave requests, and AI chatbot interactions.

## 🚀 Technologies Used

- **Java 21** (LTS)
- **Spring Boot 3.2.0**
- **Spring Security** with JWT Authentication
- **Spring Data JPA**
- **MySQL Database**
- **Lombok** for boilerplate reduction
- **ModelMapper** for DTO mapping
- **iText7** for PDF generation
- **Maven** for dependency management

## 📋 Prerequisites

Before running the application, ensure you have:

- Java 21 or higher installed
- MySQL 8.0+ installed and running
- MySQL Workbench (optional, for database management)
- Maven 3.8+ installed

## 🗄️ Database Setup

1. **Open MySQL Workbench** and connect to your local MySQL server

2. The application will **automatically create** the database `smart_attendance_system` on startup

3. Default MySQL credentials configured:

   - Username: `root`
   - Password: `hasanali7623`
   - Database: `smart_attendance_system`

4. If you need to change credentials, update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

## ⚙️ Installation & Running

### 1. Clone/Navigate to Backend Directory

```bash
cd "H:\MCA ALL PROJECT\Smart Attendance, Leave , AI Chatbot Management System\backend"
```

### 2. Build the Project

```bash
mvn clean install
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR file:

```bash
java -jar target/smart-attendance-system-1.0.0.jar
```

The application will start on **http://localhost:8080**

## 📡 API Endpoints

### Authentication APIs

| Method | Endpoint             | Description       | Access |
| ------ | -------------------- | ----------------- | ------ |
| POST   | `/api/auth/register` | Register new user | Public |
| POST   | `/api/auth/login`    | Login user        | Public |

### Student APIs

| Method | Endpoint                                | Description           | Access        |
| ------ | --------------------------------------- | --------------------- | ------------- |
| GET    | `/api/student/dashboard?studentId={id}` | Get student dashboard | Student/Admin |
| GET    | `/api/student/profile?userId={id}`      | Get user profile      | Student/Admin |

### Attendance APIs

| Method | Endpoint                                                                    | Description                  | Access        |
| ------ | --------------------------------------------------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/attendance/mark`                                                      | Mark attendance              | Student/Admin |
| GET    | `/api/attendance/my-attendance?studentId={id}`                              | Get my attendance            | Student/Admin |
| GET    | `/api/attendance/stats?studentId={id}`                                      | Get attendance stats         | Student/Admin |
| GET    | `/api/attendance/date-range?studentId={id}&startDate={date}&endDate={date}` | Get attendance by date range | Student/Admin |

### Leave APIs

| Method | Endpoint                              | Description           | Access        |
| ------ | ------------------------------------- | --------------------- | ------------- |
| POST   | `/api/leave/apply?studentId={id}`     | Apply for leave       | Student/Admin |
| GET    | `/api/leave/my-leaves?studentId={id}` | Get my leave requests | Student/Admin |

### Admin APIs

| Method | Endpoint                        | Description                | Access     |
| ------ | ------------------------------- | -------------------------- | ---------- |
| GET    | `/api/admin/dashboard`          | Get admin dashboard        | Admin Only |
| GET    | `/api/admin/attendance/all`     | Get all attendance records | Admin Only |
| GET    | `/api/admin/leaves/pending`     | Get pending leave requests | Admin Only |
| GET    | `/api/admin/leaves/all`         | Get all leave requests     | Admin Only |
| PUT    | `/api/admin/leave/approve/{id}` | Approve leave request      | Admin Only |
| PUT    | `/api/admin/leave/reject/{id}`  | Reject leave request       | Admin Only |
| POST   | `/api/admin/student/create`     | Create new student         | Admin Only |
| GET    | `/api/admin/students`           | Get all students           | Admin Only |

### Chatbot APIs

| Method | Endpoint                                                  | Description              | Access        |
| ------ | --------------------------------------------------------- | ------------------------ | ------------- |
| POST   | `/api/chatbot/ask?userId={id}`                            | Ask chatbot a question   | Student/Admin |
| GET    | `/api/chatbot/history?userId={id}`                        | Get chat history         | Student/Admin |
| GET    | `/api/chatbot/history/session?userId={id}&sessionId={id}` | Get session chat history | Student/Admin |

### PDF APIs

| Method | Endpoint                                              | Description                     | Access        |
| ------ | ----------------------------------------------------- | ------------------------------- | ------------- |
| GET    | `/api/pdf/monthly/{studentId}?month={m}&year={y}`     | Generate monthly attendance PDF | Student/Admin |
| GET    | `/api/pdf/generate?studentId={id}&month={m}&year={y}` | Generate attendance PDF         | Student/Admin |

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Sample Registration Request

```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "studentId": "STU001",
  "phoneNumber": "1234567890",
  "department": "Computer Science",
  "semester": "6th"
}
```

### Sample Login Request

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Sample Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "studentId": "STU001"
  }
}
```

## 📊 Database Schema

### Users Table

- id (Primary Key)
- name
- email (Unique)
- password (Encrypted)
- role (STUDENT/ADMIN)
- student_id (Unique)
- phone_number
- department
- semester
- profile_image
- is_active
- created_at
- updated_at

### Attendance Table

- id (Primary Key)
- student_id (Foreign Key)
- date
- status (PRESENT/ABSENT/LATE/EXCUSED)
- subject
- remarks
- marked_by
- created_at

### Leave Requests Table

- id (Primary Key)
- student_id (Foreign Key)
- from_date
- to_date
- reason
- status (PENDING/APPROVED/REJECTED)
- admin_remarks
- approved_by
- approved_at
- created_at
- updated_at

### Chat History Table

- id (Primary Key)
- user_id (Foreign Key)
- user_message
- bot_response
- session_id
- timestamp

## 🔧 Configuration

### JWT Configuration

- Secret Key: Configured in `application.properties`
- Token Expiration: 24 hours (86400000 ms)

### CORS Configuration

- Allowed Origins: `http://localhost:5173`, `http://localhost:3000`
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS

### File Upload

- Max File Size: 10MB
- Max Request Size: 10MB

## 🧪 Testing the API

You can test the API using:

- **Postman** - Import the endpoints and test
- **curl** - Command-line testing
- **Frontend Application** - React + Tailwind frontend

### Example curl Commands

**Register:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "STUDENT",
    "studentId": "STU001"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Dashboard (with token):**

```bash
curl -X GET "http://localhost:8080/api/student/dashboard?studentId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/project/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controllers/     # REST Controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── exception/       # Exception handling
│   │   │   ├── models/          # JPA Entities
│   │   │   ├── repositories/    # JPA Repositories
│   │   │   ├── services/        # Business Logic
│   │   │   ├── util/            # Utility classes
│   │   │   └── SmartAttendanceApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/                    # Test classes
├── pom.xml                      # Maven configuration
└── README.md
```

## 🔒 Security Features

- **Password Encryption**: BCrypt password encoding
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: STUDENT and ADMIN roles
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Jakarta Validation annotations
- **SQL Injection Prevention**: JPA parameterized queries

## 📱 Frontend Integration

The backend is designed to work seamlessly with the React + Tailwind frontend. Make sure:

1. Frontend is running on `http://localhost:5173` or `http://localhost:3000`
2. Include JWT token in Authorization header for protected routes
3. Handle API responses with `success`, `message`, and `data` fields

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already in use, change it in `application.properties`:

```properties
server.port=8081
```

### Database Connection Error

- Verify MySQL is running
- Check username and password in `application.properties`
- Ensure MySQL is accessible on localhost:3306

### JWT Token Expired

- Tokens expire after 24 hours
- Login again to get a new token

### CORS Errors

- Verify frontend URL matches allowed origins in `SecurityConfig.java`
- Clear browser cache and cookies

## 📞 API Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## 🎯 Features Implemented

✅ User Registration & Login
✅ JWT Authentication
✅ Role-Based Access Control
✅ Attendance Management
✅ Leave Request System
✅ Admin Dashboard
✅ Student Dashboard
✅ AI Chatbot Integration
✅ PDF Report Generation
✅ Subject-wise Attendance
✅ Attendance Statistics
✅ Global Exception Handling
✅ Input Validation
✅ CORS Configuration

## 🚀 Production Deployment

For production deployment:

1. Update `application.properties` with production database credentials
2. Change JWT secret key to a secure random string
3. Update CORS allowed origins to production frontend URL
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Configure proper logging
7. Set up database backups

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Developer

Backend developed with ❤️ using Spring Boot 3 and Java 21

---

**Note**: Make sure MySQL is running before starting the application. The database and tables will be created automatically on first run.
