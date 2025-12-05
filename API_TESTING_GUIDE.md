# API Testing Guide - Authentication APIs

This guide will walk you through testing the Signup and Login APIs step by step, from running the server to testing in Postman and the UI.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Starting the Backend Server](#starting-the-backend-server)
4. [Testing with Postman](#testing-with-postman)
5. [Testing in the UI](#testing-in-the-ui)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- Node.js installed (v16 or higher)
- Backend server running on port 8081
- Postman installed (for API testing)
- The frontend UI project set up

---

## Environment Setup

### 1. Configure Environment Variables

The frontend uses environment variables to configure the API base URL.

**For Local Testing:**
1. Open the `.env` file in the root of the project
2. Set the API URL to `http://localhost:8081`:

```env
VITE_API_BASE_URL=http://localhost:8081
```

**For Server/Production Testing:**
1. Update the `.env` file with your server IP:

```env
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8081
```

**Important:** After changing `.env` file, you must restart the Vite dev server for changes to take effect.

---

## Starting the Backend Server

### Step 1: Navigate to Backend Directory
```bash
cd /path/to/your/backend/server
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

### Step 3: Start the Server
```bash
# Check your backend's package.json for the correct start command
# Common commands:
npm start
# or
npm run dev
# or
node server.js
```

### Step 4: Verify Server is Running
- The server should start on port **8081**
- You should see a message like: `Server running on http://localhost:8081`
- Test with a simple GET request:
  ```bash
  curl http://localhost:8081/health
  # or
  curl http://localhost:8081/api/status
  ```

---

## Testing with Postman

### Test 1: Signup API

#### Request Setup:
1. **Method:** `POST`
2. **URL:** `http://localhost:8081/auth/signup`
3. **Headers:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body (raw JSON):**
   ```json
   {
     "email": "user@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "1234567890"
   }
   ```

#### Steps in Postman:
1. Open Postman
2. Create a new request
3. Set method to **POST**
4. Enter URL: `http://localhost:8081/auth/signup`
5. Go to **Headers** tab
6. Add header: `Content-Type: application/json`
7. Go to **Body** tab
8. Select **raw** and **JSON** format
9. Paste the JSON body above
10. Click **Send**

#### Expected Success Response (200 OK):
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "693277e031eac08f396e9efe",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-12-05T06:12:48.643Z"
  }
}
```

#### Common Errors:
- **400 Bad Request:** Missing required fields or invalid data
- **409 Conflict:** Email already exists
- **500 Internal Server Error:** Server-side error

---

### Test 2: Login API

#### Request Setup:
1. **Method:** `POST`
2. **URL:** `http://localhost:8081/auth/login`
3. **Headers:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body (raw JSON):**
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

#### Steps in Postman:
1. Create a new request in Postman
2. Set method to **POST**
3. Enter URL: `http://localhost:8081/auth/login`
4. Go to **Headers** tab
5. Add header: `Content-Type: application/json`
6. Go to **Body** tab
7. Select **raw** and **JSON** format
8. Paste the JSON body above
9. Click **Send**

#### Expected Success Response (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "693277e031eac08f396e9efe",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-12-05T06:12:48.643Z",
    "lastLoginAt": "2025-12-05T06:12:57.632Z"
  }
}
```

#### Common Errors:
- **401 Unauthorized:** Invalid email or password
- **400 Bad Request:** Missing email or password
- **500 Internal Server Error:** Server-side error

---

### Using cURL (Alternative to Postman)

#### Signup:
```bash
curl -X POST http://localhost:8081/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## Testing in the UI

### Step 1: Start the Frontend Development Server

1. Navigate to the frontend project directory:
   ```bash
   cd /Users/govindtiwari/Vapp_Voice_Agent_UI
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The app should open at `http://localhost:3000` (or the port shown in terminal)

### Step 2: Test Signup Flow

1. **Open the application** in your browser
2. You should see the **Login** screen
3. Click **"Sign Up"** link at the bottom
4. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Phone Number: `1234567890`
   - Email: `user@example.com`
   - Password: `password123`
5. Click **"Create Account"**
6. **Expected Result:**
   - Success message: "Account created successfully! Please login."
   - Form switches to login mode
   - Form fields are cleared

### Step 3: Test Login Flow

1. On the login screen, enter:
   - Email: `user@example.com`
   - Password: `password123`
2. Click **"Sign In"**
3. **Expected Result:**
   - You are redirected to the Dashboard
   - Your name and email appear in the sidebar
   - You can access all features of the application

### Step 4: Test Logout

1. Click the **Logout** button (logout icon) in the sidebar
2. **Expected Result:**
   - You are logged out
   - Login screen appears again
   - All authentication data is cleared

### Step 5: Test Authentication Persistence

1. After logging in, **refresh the page** (F5 or Cmd+R)
2. **Expected Result:**
   - You remain logged in
   - Dashboard is still visible
   - Your session persists

---

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Possible Causes:**
- Backend server is not running
- Wrong API URL in `.env` file
- CORS issues

**Solutions:**
1. Verify backend server is running on port 8081
2. Check `.env` file has correct URL
3. Restart the frontend dev server after changing `.env`
4. Check browser console for detailed error messages

### Issue: "401 Unauthorized" in UI

**Possible Causes:**
- Invalid credentials
- Token expired
- Backend authentication middleware issue

**Solutions:**
1. Verify credentials are correct
2. Try logging in again
3. Clear browser localStorage and try again
4. Check backend logs for authentication errors

### Issue: "CORS Error"

**Possible Causes:**
- Backend not configured to allow frontend origin
- Missing CORS headers

**Solutions:**
1. Check backend CORS configuration
2. Ensure backend allows requests from `http://localhost:3000`
3. Contact backend team to update CORS settings

### Issue: Environment Variables Not Working

**Possible Causes:**
- `.env` file not in root directory
- Variable name incorrect (must start with `VITE_`)
- Dev server not restarted after changes

**Solutions:**
1. Ensure `.env` is in project root
2. Variable must be `VITE_API_BASE_URL` (not `API_BASE_URL`)
3. **Restart the dev server** after changing `.env`
4. Check `vite.config.js` for any overrides

### Issue: Port Already in Use

**Solutions:**
```bash
# Find process using port 8081
lsof -i :8081

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port in backend configuration
```

---

## Quick Testing Checklist

- [ ] Backend server running on port 8081
- [ ] `.env` file configured with correct API URL
- [ ] Frontend dev server restarted after `.env` changes
- [ ] Signup API tested in Postman - Success
- [ ] Login API tested in Postman - Success
- [ ] Signup flow tested in UI - Success
- [ ] Login flow tested in UI - Success
- [ ] Logout functionality works
- [ ] Authentication persists on page refresh

---

## Next Steps

After successful testing:
1. Update `.env` with production server IP when ready
2. Test with multiple user accounts
3. Test error scenarios (invalid credentials, duplicate email, etc.)
4. Verify token is being stored and sent with subsequent API calls

---

## Additional Notes

- The authentication token is stored in `localStorage` as `authToken`
- User data is stored in `localStorage` as `user`
- Token should be included in headers for authenticated API calls: `Authorization: Bearer <token>`
- For production, consider implementing token refresh mechanism

---

**Need Help?** Check the browser console (F12) and network tab for detailed error messages.

