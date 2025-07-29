# Guest User Initialization Fix

## Issue Description

The guest user initialization was not working properly when users visited the website. The problem was:

1. **Multiple initialization points**: Guest user initialization was happening in multiple places (Proxy component, AuthInitializer, etc.) without proper coordination
2. **Inconsistent behavior**: Users visiting the website weren't consistently getting guest user initialization
3. **Route-specific issues**: The initialization logic wasn't properly handling the different routes where guest users should be initialized
4. **Redirect issue**: Users were being redirected to login page instead of staying on proxy page with guest user initialization

## Solution Implemented

### 1. Centralized Guest User Initialization

Created a dedicated `GuestUserInitializer` component that handles all guest user initialization logic:

**File**: `src/components/common/GuestUserInitializer.tsx`

**Key Features**:
- **Route-specific initialization**: Only initializes guest users on specific routes (`/proxy`, `/proxy/detail`)
- **Smart detection**: Checks for existing tokens, user state, and logout flags
- **Handles both scenarios**: 
  - New guest users (no token exists)
  - Existing guest users (token exists but user not found)
- **Respects logout state**: Doesn't initialize if user has explicitly logged out
- **Uses device UID**: Automatically uses the stored `user_uid` from localStorage for continuity

### 2. Updated Layout Structure

Modified the main layout to include the `GuestUserInitializer`:

**File**: `src/app/layout.tsx`

**Changes**:
- Added `GuestUserInitializer` component to the component tree
- Positioned it after `AuthInitializer` but before other components
- Uses dynamic import to avoid SSR issues

### 3. Fixed AuthInitializer Redirect Issue

Updated the `AuthInitializer` to not redirect users away from proxy routes:

**File**: `src/components/common/AuthInitializer.tsx`

**Changes**:
- Added `/proxy` and `/proxy/detail` to public routes list
- This prevents the AuthInitializer from redirecting users to `/signin` when they visit proxy pages
- Allows the GuestUserInitializer to handle guest user initialization properly

### 4. Cleaned Up Duplicate Logic

Removed duplicate guest user initialization logic from the Proxy component:

**File**: `src/components/proxy/Proxy.tsx`

**Changes**:
- Removed the `useEffect` that was handling guest user initialization
- Removed unused imports (`initializeGuestUserAction`, `getAuthToken`)
- Simplified the component to focus on its core functionality

### 5. Enhanced Sign-Up Form

Updated the sign-up form to properly handle guest user initialization:

**File**: `src/components/auth/SignUpForm.tsx`

**Changes**:
- Added `clearUserLoggedOutFlag()` call when user clicks "Continue as Guest"
- Ensures consistent behavior with sign-in form
- Properly handles the logout state reset

## How It Works Now

### Scenario 1: New User Visits Website
1. User visits `https://yourdomain.com/`
2. Middleware redirects to `/proxy`
3. `AuthInitializer` allows access (proxy is now public route)
4. `GuestUserInitializer` detects no token and no user
5. Automatically calls `initializeGuestUserAction`
6. Creates new guest user with device UID
7. User can immediately browse and use the app

### Scenario 2: Existing Guest User Returns
1. User visits `https://yourdomain.com/`
2. Middleware redirects to `/proxy`
3. `AuthInitializer` allows access (proxy is now public route)
4. `GuestUserInitializer` detects existing token but no user in Redux
5. Automatically calls `initializeGuestUserAction`
6. Logs in existing guest user using device UID
7. User's previous data (cart, orders, etc.) is restored

### Scenario 3: User Clicks "Continue as Guest"
1. User goes to `/signin` or `/signup`
2. Clicks "Continue as Guest" button
3. `SignInForm` or `SignUpForm` calls `initializeGuestUserAction`
4. Guest user is created/logged in using existing device UID
5. User is redirected to `/proxy`

### Scenario 4: User Has Logged Out
1. User has explicitly logged out (logout flag set)
2. `GuestUserInitializer` detects logout flag
3. Does NOT initialize guest user
4. User sees login/signup options

## Key Technical Details

### Device UID Continuity
- The `getDeviceUid()` function uses the same storage key (`user_uid`) as `getUserUID()`
- This ensures that the same device UID is used consistently across all guest user operations
- When a user returns, the same device UID is used to log in as the existing guest user

### API Endpoint Usage
- All guest user operations use the `/auth/add-user` endpoint
- This endpoint handles both creation (new user) and login (existing user) based on the device UID
- The backend automatically determines if the user exists and returns the appropriate response

### State Management
- Guest user initialization respects the logout flag
- Users who explicitly log out won't get automatic guest user initialization
- Users who click "Continue as Guest" have their logout flag cleared

## Benefits

✅ **No More Redirects**: Users stay on proxy page instead of being redirected to login  
✅ **Immediate Access**: Users can start using the app right away without registration  
✅ **Data Persistence**: Returning guest users get their previous data restored  
✅ **Consistent Behavior**: Works reliably across all scenarios  
✅ **Clean Code**: Centralized logic eliminates conflicts and duplication  
✅ **User Choice**: Still allows manual guest login from auth pages  
✅ **Device Continuity**: Same device UID ensures user data persistence  

## Testing

To test the implementation:

1. **New User Test**:
   - Clear browser storage
   - Visit the website
   - Should automatically get guest user initialized and stay on proxy page

2. **Returning Guest User Test**:
   - Visit the website as a guest user
   - Close browser and return later
   - Should automatically log in as the same guest user and stay on proxy page

3. **Manual Guest Login Test**:
   - Go to `/signin` or `/signup`
   - Click "Continue as Guest"
   - Should create/login guest user and redirect to `/proxy`

4. **Logout Test**:
   - Log out explicitly
   - Visit the website
   - Should NOT initialize guest user automatically 