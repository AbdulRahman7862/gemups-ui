export function formatExpireStatus(unixTimestamp: number): string {
  if (!unixTimestamp) return "-";

  const expireDate = new Date(unixTimestamp * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expireDate.setHours(0, 0, 0, 0);

  const timeDiff = expireDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff > 0) {
    return `${daysDiff} day${daysDiff !== 1 ? "s" : ""} left`;
  } else {
    return "Expired";
  }
}


