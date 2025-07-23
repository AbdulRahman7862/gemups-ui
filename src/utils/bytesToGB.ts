export function bytesToGB(bytes: number, decimals?: number): string {
  if (!bytes || bytes <= 0) return "0";

  const gb = bytes / 1024 ** 3;
  const fixed = decimals !== undefined ? decimals : gb >= 1 ? 2 : 5;

  return `${gb.toFixed(fixed)}`;
}
