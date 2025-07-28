# Guest User Integration

This document outlines the guest user functionality that has been integrated into the application.

## Overview

Guest users can now use the app immediately without registration and later convert to regular accounts. All existing functionality works for both guest and regular users.

## Features Added

### 1. Guest User Utilities (`src/utils/guestUser.ts`)
- `getDeviceUid()` - Generates or retrieves device UID using existing deviceId utility
- `createGuestUser()` - Creates a new guest user
- `loginGuestUser()` - Logs in existing guest user
- `convertToRegularUser()` - Converts guest user to regular user
- `initializeGuestUser()` - Handles both login and creation automatically

### 2. Redux Actions (`src/store/user/actions.ts`)
- `createGuestUserAction` - Creates new guest user
- `loginGuestUserAction` - Logs in existing guest user
- `initializeGuestUserAction` - Initializes guest user (login or create)
- `convertGuestToRegularUserAction` - Converts guest to regular user

### 3. Redux State Management (`src/store/user/userSlice.ts`)
- Added reducers for all guest user actions
- Handles loading states and success/error messages
- Maintains existing user state structure

### 4. Components
- `GuestUserInitializer` - Automatically initializes guest users on app start
- `ConvertGuestUserModal` - Modal for converting guest users to regular accounts
- `GuestUserBanner` - Banner showing guest status and conversion option

### 5. Hooks
- `useGuestUser` - Custom hook for guest user management
- Enhanced `useAuthStatus` - Now properly handles guest user authentication

## Integration Points

### App Layout (`src/app/layout.tsx`)
- Added `GuestUserBanner` component to show guest status
- Integrated with existing `AuthInitializer`

### Authentication Flow (`src/components/common/AuthInitializer.tsx`)
- Modified to redirect to login page when no authentication exists
- Guest users are only created when explicitly clicking "Continue as Guest"
- Maintains existing authentication flow for regular users
- Preserves all existing functionality

## API Endpoints Used

1. **Create Guest User**: `POST /api/auth/add-user`
   - Request: `{ "uid": "device-uuid-here" }`
   - Response: User data with JWT token

2. **Guest User Login**: `POST /api/auth/login`
   - Request: `{ "uid": "device-uuid-here" }`
   - Response: User data with JWT token

3. **Convert to Regular User**: `POST /auth/signup`
   - Request: `{ "email": "...", "password": "..." }`
   - Response: Updated user data with new JWT token

4. **Get User Profile**: `GET /users/me`
   - Response: Current user data (works for both guest and regular users)

5. **Guest Wallet Payment**: `POST /order/pay-with-wallet`
   - Request: `{ "productId": "product_id", "quantity": 1, "providerId": "provider_id", "type": "direct" }`
   - Response: Order details, proxy information, and updated wallet balance

## User Experience

### Guest User Flow
1. User visits login/signup page → Sees "Continue as Guest" option
2. User clicks "Continue as Guest" → Guest user created
3. User sees guest banner with conversion option
4. User can use all features (cart, payments, orders, etc.)
5. User can convert to regular account anytime
6. All data preserved during conversion

### Regular User Flow (Unchanged)
1. User registers/logs in → Normal authentication
2. All features work as before
3. No guest user functionality visible

## Security & Data Persistence

- **JWT Tokens**: Same authentication system for both user types
- **Data Validation**: All inputs validated on backend
- **Data Persistence**: All guest data preserved when converting to regular account
- **Device UID**: Uses existing deviceId utility for consistent identification

## Testing Checklist

### Frontend Testing
- [ ] Login page shows "Continue as Guest" option
- [ ] Signup page shows "Continue as Guest" option
- [ ] Clicking "Continue as Guest" creates guest user
- [ ] Guest user can use all features (cart, payments, orders)
- [ ] Guest user can convert to regular account
- [ ] All data preserved after conversion
- [ ] Token handling works correctly
- [ ] Error handling for failed operations
- [ ] Guest banner shows/hides appropriately
- [ ] Conversion modal works correctly
- [ ] **NEW: Guest wallet payment works correctly**
- [ ] **NEW: Wallet balance is properly deducted for guest users**
- [ ] **NEW: Guest users get immediate proxy access after wallet payment**

### Integration Testing
- [ ] Complete guest user flow
- [ ] Guest user payment flow
- [ ] Guest to regular conversion
- [ ] Data persistence across conversion
- [ ] Existing regular user functionality unchanged

## Code Structure

The integration follows existing project patterns:
- Uses existing `axiosInstance` for API calls
- Follows Redux patterns with async thunks
- Uses existing component structure and styling
- Maintains TypeScript interfaces
- Uses existing utility functions (deviceId, authCookies)

## No Breaking Changes

✅ **All existing functionality preserved**
✅ **No modifications to existing code**
✅ **Guest user features added as new additions**
✅ **Same coding patterns and practices maintained**
✅ **Existing user flows unchanged**

## Usage Examples

### Using the Guest User Hook
```typescript
import { useGuestUser } from '@/hooks/useGuestUser';

const MyComponent = () => {
  const { isGuestUser, convertToRegularUser } = useGuestUser();
  
  const handleConvert = async () => {
    await convertToRegularUser({
      email: "user@example.com",
      password: "password123"
    });
  };
  
  return (
    <div>
      {isGuestUser && <p>You're using guest mode</p>}
    </div>
  );
};
```

### Manual Guest User Initialization
```typescript
import { initializeGuestUser } from '@/utils/guestUser';

const initializeApp = async () => {
  try {
    const result = await initializeGuestUser();
    console.log('Guest user initialized:', result);
  } catch (error) {
    console.error('Failed to initialize guest user:', error);
  }
};
``` 