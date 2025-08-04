# Pricing Selector Best Offer Feature

## Overview
The PricingSelector component now includes an intelligent feature that automatically selects the best pricing tier when users increase their quantity. This ensures users always get the most cost-effective option for their needs.

## How It Works

### Automatic Best Offer Detection
When a user increases the quantity (either by clicking the "+" button or manually entering a value), the system:

1. **Calculates Current Total Price**: Determines the total cost based on current tier and quantity
2. **Finds Better Value Tiers**: Identifies all pricing tiers that provide more data for the same or lower price
3. **Calculates Value for Money**: For each better tier, calculates data per dollar (data/price ratio)
4. **Selects Best Option**: Automatically selects the tier with the highest value for money
5. **Applies Data Increase Threshold**: Only auto-selects if it provides significantly more data (>10% increase)

### Key Features

#### Smart Tier Selection
- **Value for Money Calculation**: `userDataAmount / price` for each tier (data per dollar)
- **Data Amount Comparison**: When value for money is similar, prefers higher total data
- **Data Increase Threshold**: Only auto-selects if data increase exceeds 10% to avoid unnecessary changes

#### User Experience Enhancements
- **Visual Notification**: Shows a green notification when a better offer is automatically selected
- **Data Increase Display**: Shows the percentage of additional data received
- **Non-Intrusive**: Notification disappears after 3 seconds
- **Manual Override**: Users can still manually select any tier if they prefer

#### Trigger Points
The best offer detection is triggered when:
1. User clicks the "+" button to increase quantity
2. User manually enters a quantity value
3. Quantity changes through any other means

## Implementation Details

### Core Functions

#### `findBestOffer(currentQuantity, currentTier)`
- Analyzes all available pricing tiers
- Finds tiers that provide more data for the same or lower price
- Calculates value for money (data per dollar) for comparison
- Returns the tier with the highest value for money

#### `handleQuantityIncrease()`
- Increments quantity by 1
- Triggers best offer detection
- Automatically selects better tier if found
- Shows notification with savings information

### State Management
- `showBetterOfferNotification`: Controls notification visibility
- `savingsAmount`: Stores the percentage of additional data received
- Automatic cleanup of notifications after 3 seconds

### UI Components
- **Notification Banner**: Green-themed notification with sparkle icon
- **Savings Display**: Shows exact percentage saved
- **Smooth Transitions**: Notification appears/disappears smoothly

## Example Scenarios

### Scenario 1: Better Value Selection
- User selects 1MB tier at $2
- Increases quantity to 15 (total: 15MB for $30)
- System finds 20MB tier at $30 (same price, more data)
- Automatically selects 20MB tier, providing 33% more data

### Scenario 2: Popular Tier Selection
- User selects 2GB tier at $8
- Increases quantity to 5 (total: 10GB for $40)
- System finds popular 15GB tier at $40 (same price, more data)
- Automatically selects popular tier, providing 50% more data

### Scenario 3: No Better Option
- User selects 10GB tier at $25
- Increases quantity to 2 (total: 20GB for $50)
- No tier provides more data for $50 or less
- Keeps current selection, no auto-change

## Benefits

1. **Value Optimization**: Users automatically get more data for the same price
2. **Improved UX**: Reduces manual comparison effort
3. **Transparency**: Clear notification when changes are made
4. **Flexibility**: Users can still override automatic selections
5. **Smart Thresholds**: Prevents unnecessary changes for minimal data increases

## Technical Notes

- Uses React hooks (`useState`, `useEffect`) for state management
- Implements debounced checking to avoid excessive calculations
- Maintains backward compatibility with existing functionality
- Follows existing code patterns and styling conventions
- Includes proper TypeScript typing for all new functions 