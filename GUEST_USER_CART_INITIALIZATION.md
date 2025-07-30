# Guest User Cart-Only Initialization

## Overview

This document outlines the changes made to implement guest user initialization only when users add items to cart after selecting from the price selector, rather than automatically initializing on website load.

## Changes Made

### 1. Modified GuestUserInitializer (`src/components/common/GuestUserInitializer.tsx`)

**Before**: Automatically initialized guest users on website load for specific routes
**After**: Only handles logout prevention logic, no automatic initialization

**Key Changes**:
- Removed automatic guest user initialization logic
- Kept logout prevention logic to clear logout flags on appropriate routes
- Guest user initialization now happens manually when needed

### 2. Updated AuthInitializer (`src/components/common/AuthInitializer.tsx`)

**Before**: Automatically initialized guest users when UID existed but no token
**After**: Only redirects to login for non-public routes, no automatic guest initialization

**Key Changes**:
- Removed `handleAddUserFlow` function that was automatically creating guest users
- Simplified logic to only handle authentication redirects
- Public routes (`/proxy`, `/proxy/detail`) allow access without authentication

### 3. Enhanced useGuestUser Hook (`src/hooks/useGuestUser.ts`)

**Added**: New function `initializeGuestUserForCart()` for manual guest user initialization

**Key Features**:
- Checks if token exists
- Initializes guest user only when needed
- Returns boolean indicating if initialization was performed
- Handles both new guest users and existing guest user login

### 4. Updated PricingSelector (`src/components/proxy/PricingSelector.tsx`)

**Before**: Showed login prompt when no token existed
**After**: Automatically initializes guest user when adding to cart

**Key Changes**:
- Added import for `useGuestUser` hook
- Modified `handleAddToCart` function to call `initializeGuestUserForCart()`
- Shows success message when guest session is created
- Continues with cart addition after guest initialization

### 5. Updated PaymentBuyClickModal (`src/components/common/Modals/PaymentBuyClickModal.tsx`)

**Before**: Showed login prompt when no token existed
**After**: Automatically initializes guest user when using "Buy in 1 click"

**Key Changes**:
- Added import for `useGuestUser` hook
- Modified `handleBuyClick` function to call `initializeGuestUserForCart()`
- Shows success message when guest session is created
- Continues with payment process after guest initialization

### 6. Updated CartDrawer (`src/components/common/Modals/CartDrawer.tsx`)

**Before**: Required existing authentication for cart payments
**After**: Automatically initializes guest user when making payments from cart

**Key Changes**:
- Added import for `useGuestUser` hook
- Modified `handlePayment` function to call `initializeGuestUserForCart()`
- Shows success message when guest session is created
- Continues with payment process after guest initialization

### 7. Updated UserDropdown (`src/components/header/UserDropdown.tsx`)

**Before**: Guest users were redirected to signin page when logging out
**After**: Guest users stay on the same page without guest session

**Key Changes**:
- Modified `handleLogout` function to not redirect guest users
- Guest users now stay on the current page after logout
- Regular users still redirect to proxy page as before

### 8. Cleaned Up Proxy Component (`src/components/proxy/Proxy.tsx`)

**Before**: Automatically initialized guest users on component mount
**After**: No automatic initialization, simplified loading logic

**Key Changes**:
- Removed automatic guest user initialization logic
- Removed unused imports (`initializeGuestUserAction`, `getAuthToken`)
- Simplified loading condition to only show spinner for data fetching
- Removed dependency on guest user state for loading

## How It Works Now

### Scenario 1: User Visits Website
1. User visits the website
2. No automatic guest user initialization
3. User can browse proxy listings without authentication
4. User sees login/signup options or "Continue as Guest" buttons

### Scenario 2: User Adds Item to Cart
1. User selects a pricing tier and quantity
2. User clicks "Add to Cart"
3. System checks if user has authentication token
4. If no token, automatically initializes guest user
5. Shows success message: "Guest session created! You can now add items to cart."
6. Item is added to cart successfully

### Scenario 3: User Uses "Buy in 1 Click"
1. User selects a pricing tier and quantity
2. User clicks "Buy in 1 click"
3. System checks if user has authentication token
4. If no token, automatically initializes guest user
5. Shows success message: "Guest session created! You can now make purchases."
6. Payment process continues

### Scenario 4: User Makes Payment from Cart
1. User has items in cart
2. User clicks "Pay" in cart drawer
3. System checks if user has authentication token
4. If no token, automatically initializes guest user
5. Shows success message: "Guest session created! You can now make payments."
6. Payment process continues

### Scenario 5: Guest User Logs Out
1. Guest user explicitly logs out
2. Logout flag is set in localStorage
3. User stays on the same page without guest session
4. No redirect to signin page
5. User can continue browsing without guest privileges
6. Guest user initialization is prevented for future actions

### Scenario 6: Manual Guest Login
1. User goes to `/signin` or `/signup`
2. User clicks "Continue as Guest" button
3. Guest user is initialized manually
4. User is redirected to `/proxy`

## Benefits

✅ **No Automatic Initialization**: Guest users are only created when needed  
✅ **Better User Experience**: Users can browse without being forced into guest mode  
✅ **Intentional Actions**: Guest users are created only when users take specific actions  
✅ **Guest Logout Behavior**: Guest users stay on the same page when logging out  
✅ **Consistent Behavior**: All cart/payment actions trigger guest initialization consistently  
✅ **Manual Control**: Users can still manually choose to continue as guest from auth pages  

## Technical Details

### Guest User Initialization Flow
1. Check if authentication token exists
2. If no token, call `initializeGuestUserForCart()`
3. This function calls `initializeGuestUserAction` with `showToast: false`
4. Guest user is created or logged in using device UID
5. Success message is shown to user
6. Original action (add to cart, payment, etc.) continues

### Logout Prevention
- `GuestUserInitializer` still handles logout flag clearing
- Users who explicitly log out won't get automatic guest initialization
- Logout flag is cleared when users manually choose to continue as guest

### Device UID Continuity
- Same device UID is used consistently across all guest user operations
- Returning users get their previous data restored
- Device UID is stored in localStorage as `user_uid`

## Testing

To test the implementation:

1. **Browse Without Authentication**:
   - Clear browser storage
   - Visit the website
   - Should be able to browse without automatic guest initialization

2. **Add to Cart**:
   - Select a pricing tier and quantity
   - Click "Add to Cart"
   - Should see "Guest session created!" message
   - Item should be added to cart

3. **Buy in 1 Click**:
   - Select a pricing tier and quantity
   - Click "Buy in 1 click"
   - Should see "Guest session created!" message
   - Payment process should continue

4. **Cart Payment**:
   - Add items to cart
   - Click "Pay" in cart drawer
   - Should see "Guest session created!" message
   - Payment process should continue

5. **Guest User Logout**:
   - Log out as a guest user
   - Should stay on the same page without redirect
   - Should see the page without guest privileges
   - Try to add items to cart - should get guest initialization

6. **Manual Guest Login**:
   - Go to `/signin` or `/signup`
   - Click "Continue as Guest"
   - Should be redirected to `/proxy` as guest user 