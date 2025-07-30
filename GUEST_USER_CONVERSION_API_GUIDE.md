# 🔄 Guest User Conversion API Integration Guide

## **Overview**
This guide details exactly how the frontend sends requests to convert a guest user to a regular user. The conversion process involves a single API call with specific headers and data structure.

## **API Endpoint Details**

### **Endpoint**
```
POST /auth/signup
```

### **Base URL**
The frontend uses the environment variable `NEXT_PUBLIC_BASE_URL` for the base URL.

### **Full URL Example**
```
POST {NEXT_PUBLIC_BASE_URL}/auth/signup
```

## **Request Headers**

### **Required Headers**
```
Content-Type: application/json
Authorization: Bearer {guest_user_jwt_token}
```

### **Header Details**
- **Content-Type**: Always `application/json`
- **Authorization**: Bearer token from the guest user's JWT token stored in localStorage
- **User-Agent**: Browser's default user agent
- **Accept**: `application/json`

### **Example Headers**
```http
POST /auth/signup HTTP/1.1
Host: your-backend-domain.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

## **Request Body**

### **Data Structure**
```typescript
interface ConvertToRegularUserData {
  email: string;
  password: string;
}
```

### **Request Body Example**
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

### **Important Notes**
- ✅ **Only `email` and `password` are sent** (no `confirmPassword`)
- ✅ **Email validation** is done on frontend before sending
- ✅ **Password validation** is done on frontend before sending
- ✅ **No additional fields** are included in the request

## **Complete Request Flow**

### **1. Frontend Form Submission**
```typescript
// User fills form in ConvertGuestUserModal
const formData = {
  email: "user@example.com",
  password: "userpassword123",
  confirmPassword: "userpassword123" // Only used for frontend validation
};

// Frontend validation
if (formData.password !== formData.confirmPassword) {
  // Show error, don't send request
  return;
}
```

### **2. Redux Action Dispatch**
```typescript
// ConvertGuestUserModal.tsx
await dispatch(convertGuestToRegularUserAction({
  payload: {
    email: formData.email,
    password: formData.password, // Only email and password sent
  },
  onSuccess: () => {
    toast.success("Successfully converted to regular user!");
    // Handle success
  },
}));
```

### **3. API Call Execution**
```typescript
// utils/guestUser.ts
export const convertToRegularUser = async (userData: ConvertToRegularUserData) => {
  const response = await axiosInstance.post<GuestUserResponse>("/auth/signup", userData);
  return response.data;
};
```

### **4. Axios Instance Configuration**
```typescript
// utils/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

// Request interceptor automatically adds Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken(); // Gets token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## **Expected Response**

### **Success Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id_here",
      "uid": "user_uid_here",
      "isGuest": false,
      "walletBalance": 0,
      "email": "user@example.com",
      "name": "User Name",
      "userName": "username",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "new_jwt_token_for_regular_user"
  },
  "message": "Successfully converted to regular user"
}
```

### **Error Response (400)**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### **Error Response (401)**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

## **Frontend Response Handling**

### **Success Handling**
```typescript
if (response.data.success) {
  // Update stored token with new regular user token
  setAuthToken(response.data.data.token);
  
  // Update Redux state
  // Show success message
  // Close modal
  // Redirect or refresh user data
}
```

### **Error Handling**
```typescript
catch (error: any) {
  console.error("DEBUG: Conversion error:", error.response?.data);
  console.error("DEBUG: Error status:", error.response?.status);
  
  // Show error message to user
  toast.error(error.response?.data?.message || "Failed to convert to regular user");
}
```

## **Debug Information**

### **Frontend Debug Logs**
The frontend includes comprehensive debug logging:

```typescript
console.log("DEBUG: Converting guest user to regular user");
console.log("DEBUG: Request data:", userData);
console.log("DEBUG: Request URL:", "/auth/signup");
console.log("DEBUG: Conversion response:", response.data);
```

### **Example Debug Output**
```
DEBUG: Converting guest user to regular user
DEBUG: Request data: { email: "user@example.com", password: "userpassword123" }
DEBUG: Request URL: /auth/signup
DEBUG: Conversion response: { success: true, data: { user: {...}, token: "..." } }
```

## **Backend Requirements**

### **What Backend Should Expect**
1. **POST request** to `/auth/signup`
2. **Authorization header** with guest user's JWT token
3. **JSON body** with only `email` and `password` fields
4. **Content-Type: application/json**

### **What Backend Should Return**
1. **Success (200)**: User data with new JWT token
2. **Error (400)**: Validation errors (email exists, invalid data, etc.)
3. **Error (401)**: Invalid or missing token
4. **Error (500)**: Server errors

### **Backend Processing Steps**
1. **Validate JWT token** from Authorization header
2. **Extract guest user ID** from token
3. **Validate email and password** from request body
4. **Check if email already exists** in regular users
5. **Convert guest user** to regular user
6. **Generate new JWT token** for regular user
7. **Return user data** with new token

## **Testing the Integration**

### **Test Request**
```bash
curl -X POST "http://localhost:3000/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {guest_user_jwt_token}" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### **Expected Test Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "test_user_id",
      "uid": "test_user_uid",
      "isGuest": false,
      "email": "test@example.com",
      "walletBalance": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "new_jwt_token_for_regular_user"
  },
  "message": "Successfully converted to regular user"
}
```

## **Important Notes for Backend Developer**

### **Key Points**
1. **Only 2 fields**: Frontend sends only `email` and `password`
2. **JWT Token Required**: Authorization header must contain valid guest user token
3. **Email Validation**: Backend should validate email format and uniqueness
4. **Password Requirements**: Backend should enforce password strength rules
5. **Token Replacement**: Return new JWT token for the converted regular user
6. **User Data Preservation**: Maintain all guest user data (wallet balance, etc.)

### **Error Scenarios to Handle**
- ✅ Email already exists in regular users
- ✅ Invalid email format
- ✅ Weak password
- ✅ Missing or invalid JWT token
- ✅ Guest user not found
- ✅ Server errors

### **Success Scenarios**
- ✅ Valid email and password
- ✅ Valid guest user JWT token
- ✅ Email not already used by regular user
- ✅ Successful conversion and token generation

---

**This guide provides all the technical details needed to implement the backend endpoint for guest user conversion. The frontend is ready and will work once the backend endpoint is properly implemented according to these specifications.** 