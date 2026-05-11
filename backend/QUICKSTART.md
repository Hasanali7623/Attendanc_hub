# 🚀 Quick Start Guide

## Prerequisites Check

- [ ] Java 21 installed
- [ ] MySQL installed and running
- [ ] Maven installed

## Step-by-Step Setup

### 1. Verify Java Installation

```powershell
java -version
```

Should show Java 21 or higher.

### 2. Verify MySQL is Running

Open MySQL Workbench or run:

```powershell
mysql -u root -p
```

Enter password: `hasanali7623`

### 3. Navigate to Backend Directory

```powershell
cd "H:\MCA ALL PROJECT\Smart Attendance, Leave , AI Chatbot Management System\backend"
```

### 4. Build the Project

```powershell
mvn clean install
```

### 5. Run the Application

```powershell
mvn spring-boot:run
```

### 6. Verify Application is Running

Open browser and visit:

```
http://localhost:8080
```

## Test the API

### Create Admin User

```powershell
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{\"name\":\"Admin User\",\"email\":\"admin@example.com\",\"password\":\"admin123\",\"role\":\"ADMIN\"}'
```

### Create Student User

```powershell
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"student123\",\"role\":\"STUDENT\",\"studentId\":\"STU001\",\"department\":\"Computer Science\",\"semester\":\"6th\"}'
```

### Login

```powershell
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"john@example.com\",\"password\":\"student123\"}'
```

Copy the `token` from the response and use it for authenticated requests.

## Frontend Integration

1. Start your React frontend
2. Update `src/utils/api.js` with:

   ```javascript
   const API_BASE_URL = "http://localhost:8080/api";
   ```

3. The backend automatically handles CORS for:
   - http://localhost:5173
   - http://localhost:3000

## Common Commands

### Stop the Application

Press `Ctrl + C` in the terminal

### Clean and Rebuild

```powershell
mvn clean install
```

### Run Tests

```powershell
mvn test
```

### Package as JAR

```powershell
mvn package
```

### Run JAR File

```powershell
java -jar target/smart-attendance-system-1.0.0.jar
```

## Database Access

### Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to localhost
3. Find database: `smart_attendance_system`
4. Tables will be auto-created on first run

### Using Command Line

```powershell
mysql -u root -p
USE smart_attendance_system;
SHOW TABLES;
```

## Troubleshooting

### Port 8080 Already in Use

Kill the process or change port in `application.properties`:

```properties
server.port=8081
```

### MySQL Connection Failed

- Check MySQL is running
- Verify password in `application.properties`
- Check port 3306 is not blocked

### Build Failed

```powershell
mvn clean
mvn install -U
```

### Database Schema Issues

Drop and recreate:

```sql
DROP DATABASE smart_attendance_system;
CREATE DATABASE smart_attendance_system;
```

## Next Steps

1. ✅ Backend is running on http://localhost:8080
2. ✅ Database is created and tables are ready
3. ✅ Test API endpoints with Postman or curl
4. ✅ Start your React frontend
5. ✅ Begin testing the full application

## Need Help?

- Check `README.md` for detailed documentation
- Check `API_DOCUMENTATION.md` for all endpoints
- Review application logs in console

## Default Test Accounts

After running the application, create these test accounts:

**Admin Account:**

- Email: admin@example.com
- Password: admin123
- Role: ADMIN

**Student Account:**

- Email: student@example.com
- Password: student123
- Role: STUDENT
- Student ID: STU001

---

🎉 **You're all set! Happy coding!**
