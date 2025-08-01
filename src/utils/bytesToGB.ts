export function bytesToGB(bytes: number, decimals?: number): string {
  if (!bytes || bytes <= 0) return "0";

  const gb = bytes / 1024 ** 3;
  const fixed = decimals !== undefined ? decimals : gb >= 1 ? 2 : 5;

  return `${gb.toFixed(fixed)}`;
}

// Calculate flow balance in bytes based on user data amount, unit, and quantity
export const calculateFlowBalance = (userDataAmount: number, unit: string, quantity: number = 1): number => {
  const unitUpper = unit.toUpperCase();
  
  if (unitUpper === 'GB') {
    return (userDataAmount * 1024 * 1024 * 1024) * quantity;
  } else if (unitUpper === 'MB') {
    return (userDataAmount * 1024 * 1024) * quantity;
  } else if (unitUpper === 'KB') {
    return (userDataAmount * 1024) * quantity;
  } else {
    // Default to bytes
    return userDataAmount * quantity;
  }
};
