# Guest User Initialization Fix

## Issue Description

The guest user initialization was not working properly when users visited the website. The problem was:

1. **Multiple initialization points**: Guest user initialization was happening in multiple places (Proxy component, AuthInitializer, etc.) without proper coordination
2. **Inconsistent behavior**: Users visiting the website weren't consistently getting guest user initialization
3. **Route-specific issues**: The initialization logic wasn't properly handling the different routes where guest users should be initialized

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

### 2. Updated Layout Structure

Modified the main layout to include the `GuestUserInitializer`:

**File**: `src/app/layout.tsx`

**Changes**:
- Added `GuestUserInitializer` component to the component tree
- Positioned it after `AuthInitializer` but before other components
- Uses dynamic import to avoid SSR issues

### 3. Cleaned Up Duplicate Logic

Removed duplicate guest user initialization logic from the Proxy component:

**File**: `src/components/proxy/Proxy.tsx`

**Changes**:
- Removed the `useEffect` that was handling guest user initialization
- Removed unused imports (`initializeGuestUserAction`, `getAuthToken`)
- Simplified the component to focus on its core functionality

### 4. Updated AuthInitializer

Modified the `AuthInitializer` to work better with the new guest user flow:

**File**: `src/components/common/AuthInitializer.tsx`

**Changes**:
- Removed `/proxy` and `/proxy/detail` from public routes (since guest users can access them)
- Updated comments to clarify the authentication flow
- Maintained existing functionality for regular user authentication

## How It Works Now

### Scenario 1: New User Visits Website
1. User visits `https://yourdomain.com/`
2. Middleware redirects to `/proxy`
3. `GuestUserInitializer` detects no token and no user
4. Automatically calls `initializeGuestUserAction`
5. Creates new guest user with device UID
6. User can immediately browse and use the app

### Scenario 2: Existing Guest User Returns
1. User visits `https://yourdomain.com/`
2. Middleware redirects to `/proxy`
3. `GuestUserInitializer` detects existing token but no user in Redux
4. Automatically calls `initializeGuestUserAction`
5. Logs in existing guest user using device UID
6. User's previous data (cart, orders, etc.) is restored

### Scenario 3: User Clicks "Continue as Guest"
1. User goes to `/signin` or `/signup`
2. Clicks "Continue as Guest" button
3. `SignInForm` or `SignUpForm` calls `initializeGuestUserAction`
4. Guest user is created/logged in
5. User is redirected to `/proxy`

### Scenario 4: User Has Logged Out
1. User has explicitly logged out (logout flag set)
2. `GuestUserInitializer` detects logout flag
3. Does NOT initialize guest user
4. User sees login/signup options

## Benefits

✅ **Consistent Behavior**: Guest user initialization now happens reliably on every visit  
✅ **Better UX**: Users can immediately start using the app without manual intervention  
✅ **Data Persistence**: Existing guest users get their data restored automatically  
✅ **Clean Architecture**: Centralized logic eliminates duplication and conflicts  
✅ **Proper State Management**: Respects user logout decisions  

## Technical Details

### Key Functions Used
- `initializeGuestUser()` - Handles both creation and login of guest users
- `getDeviceUid()` - Generates/retrieves unique device identifier
- `hasUserLoggedOut()` - Checks if user has explicitly logged out
- `getAuthToken()` - Retrieves stored authentication token

### Redux Actions
- `initializeGuestUserAction` - Main action for guest user initialization
- `createGuestUserAction` - Creates new guest user
- `loginGuestUserAction` - Logs in existing guest user

### API Endpoints
- `POST /auth/add-user` - Handles both guest user creation and login
- `GET /auth/me` - Validates existing tokens

## Testing

To test the implementation:

1. **New User Test**:
   - Clear browser storage
   - Visit the website
   - Should automatically get guest user initialized

2. **Returning Guest User Test**:
   - Visit the website as a guest user
   - Close browser and return later
   - Should automatically log in as the same guest user

3. **Manual Guest Login Test**:
   - Go to `/signin` or `/signup`
   - Click "Continue as Guest"
   - Should create/login guest user and redirect to `/proxy`

4. **Logout Test**:
   - Log out explicitly
   - Visit the website
   - Should NOT initialize guest user automatically 