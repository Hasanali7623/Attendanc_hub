# API Documentation - Smart Attendance System

## Base URL

```
http://localhost:8080
```

## Authentication Header

All protected endpoints require JWT token:

```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication APIs

### 1.1 Register User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "studentId": "STU001",
  "phoneNumber": "1234567890",
  "department": "Computer Science",
  "semester": "6th",
  "profileImage": "https://example.com/image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
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

### 1.2 Login User

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as Register

---

## 2. Student APIs

### 2.1 Get Student Dashboard

**Endpoint:** `GET /api/student/dashboard?studentId={id}`

**Access:** Student/Admin (Requires JWT)

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "totalPresent": 45,
    "totalAbsent": 5,
    "totalLeaveRequests": 3,
    "pendingLeaves": 1,
    "approvedLeaves": 2,
    "rejectedLeaves": 0,
    "attendancePercentage": 90.0,
    "chartData": {
      "present": 45,
      "absent": 5
    },
    "subjectWiseAttendance": {
      "Mathematics": 20,
      "Physics": 15,
      "Chemistry": 15
    }
  }
}
```

### 2.2 Get User Profile

**Endpoint:** `GET /api/student/profile?userId={id}`

**Access:** Student/Admin (Requires JWT)

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "studentId": "STU001",
    "phoneNumber": "1234567890",
    "department": "Computer Science",
    "semester": "6th",
    "isActive": true
  }
}
```

---

## 3. Attendance APIs

### 3.1 Mark Attendance

**Endpoint:** `POST /api/attendance/mark`

**Access:** Student/Admin (Requires JWT)

**Request Body:**

```json
{
  "studentId": 1,
  "date": "2024-12-02",
  "status": "PRESENT",
  "subject": "Mathematics",
  "remarks": "On time"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "date": "2024-12-02",
    "status": "PRESENT",
    "subject": "Mathematics",
    "remarks": "On time",
    "markedBy": "john@example.com",
    "createdAt": "2024-12-02T10:30:00"
  }
}
```

### 3.2 Get My Attendance

**Endpoint:** `GET /api/attendance/my-attendance?studentId={id}`

**Access:** Student/Admin (Requires JWT)

**Response:**

```json
{
  "success": true,
  "message": "Attendance retrieved successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "studentName": "John Doe",
      "date": "2024-12-02",
      "status": "PRESENT",
      "subject": "Mathematics"
    }
  ]
}
```

### 3.3 Get Attendance Stats

**Endpoint:** `GET /api/attendance/stats?studentId={id}`

**Access:** Student/Admin (Requires JWT)

**Response:**

```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "totalPresent": 45,
    "totalAbsent": 5,
    "totalClasses": 50,
    "percentage": 90.0,
    "subjectWise": {
      "Mathematics": 20,
      "Physics": 15
    }
  }
}
```

### 3.4 Get Attendance by Date Range

**Endpoint:** `GET /api/attendance/date-range?studentId={id}&startDate={date}&endDate={date}`

**Access:** Student/Admin (Requires JWT)

**Example:** `/api/attendance/date-range?studentId=1&startDate=2024-11-01&endDate=2024-11-30`

---

## 4. Leave APIs

### 4.1 Apply for Leave

**Endpoint:** `POST /api/leave/apply?studentId={id}`

**Access:** Student/Admin (Requires JWT)

**Request Body:**

```json
{
  "fromDate": "2024-12-10",
  "toDate": "2024-12-12",
  "reason": "Medical emergency"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "studentName": "John Doe",
    "fromDate": "2024-12-10",
    "toDate": "2024-12-12",
    "reason": "Medical emergency",
    "status": "PENDING",
    "createdAt": "2024-12-02T10:30:00"
  }
}
```

### 4.2 Get My Leaves

**Endpoint:** `GET /api/leave/my-leaves?studentId={id}`

**Access:** Student/Admin (Requires JWT)

---

## 5. Admin APIs

### 5.1 Get Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

**Access:** Admin Only (Requires JWT)

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "totalStudents": 100,
    "totalPresent": 85,
    "totalAbsent": 15,
    "totalLeaveRequests": 20,
    "pendingLeaves": 5,
    "approvedLeaves": 12,
    "rejectedLeaves": 3,
    "chartData": {
      "presentToday": 85,
      "absentToday": 15,
      "totalStudents": 100
    }
  }
}
```

### 5.2 Get All Attendance Records

**Endpoint:** `GET /api/admin/attendance/all`

**Access:** Admin Only (Requires JWT)

### 5.3 Get Pending Leave Requests

**Endpoint:** `GET /api/admin/leaves/pending`

**Access:** Admin Only (Requires JWT)

### 5.4 Get All Leave Requests

**Endpoint:** `GET /api/admin/leaves/all`

**Access:** Admin Only (Requires JWT)

### 5.5 Approve Leave Request

**Endpoint:** `PUT /api/admin/leave/approve/{id}`

**Access:** Admin Only (Requires JWT)

**Request Body:**

```json
{
  "adminRemarks": "Approved due to valid reason"
}
```

### 5.6 Reject Leave Request

**Endpoint:** `PUT /api/admin/leave/reject/{id}`

**Access:** Admin Only (Requires JWT)

**Request Body:**

```json
{
  "adminRemarks": "Insufficient documentation"
}
```

### 5.7 Create Student

**Endpoint:** `POST /api/admin/student/create`

**Access:** Admin Only (Requires JWT)

**Request Body:** Same as Register

### 5.8 Get All Students

**Endpoint:** `GET /api/admin/students`

**Access:** Admin Only (Requires JWT)

---

## 6. Chatbot APIs

### 6.1 Ask Question

**Endpoint:** `POST /api/chatbot/ask?userId={id}`

**Access:** Student/Admin (Requires JWT)

**Request Body:**

```json
{
  "message": "How can I check my attendance?",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "id": 1,
    "userMessage": "How can I check my attendance?",
    "botResponse": "You can mark your attendance through the attendance page...",
    "sessionId": "abc123",
    "timestamp": "2024-12-02T10:30:00"
  }
}
```

### 6.2 Get Chat History

**Endpoint:** `GET /api/chatbot/history?userId={id}`

**Access:** Student/Admin (Requires JWT)

### 6.3 Get Session Chat History

**Endpoint:** `GET /api/chatbot/history/session?userId={id}&sessionId={sessionId}`

**Access:** Student/Admin (Requires JWT)

---

## 7. PDF APIs

### 7.1 Generate Monthly Attendance PDF

**Endpoint:** `GET /api/pdf/monthly/{studentId}?month={month}&year={year}`

**Access:** Student/Admin (Requires JWT)

**Example:** `/api/pdf/monthly/1?month=11&year=2024`

**Response:** PDF file download

### 7.2 Generate PDF (Alternate)

**Endpoint:** `GET /api/pdf/generate?studentId={id}&month={month}&year={year}`

**Access:** Student/Admin (Requires JWT)

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Student not found",
  "data": null
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An error occurred: ...",
  "data": null
}
```

---

## Status Enums

### User Role

- `STUDENT`
- `ADMIN`

### Attendance Status

- `PRESENT`
- `ABSENT`
- `LATE`
- `EXCUSED`

### Leave Status

- `PENDING`
- `APPROVED`
- `REJECTED`

---

## Notes

1. All dates should be in ISO format: `YYYY-MM-DD`
2. JWT tokens expire after 24 hours
3. Include Authorization header for all protected endpoints
4. CORS is enabled for `localhost:5173` and `localhost:3000`
5. Maximum file upload size: 10MB
