export function getTimeString(timestamp: number): string {
  const lastModifiedDate = new Date(timestamp);
  const timeString = lastModifiedDate.toTimeString().substring(0, 5);
  const dateString = lastModifiedDate.toDateString().substring(0, 3) + ' - ' + timeString;
  return lastModifiedDate.toLocaleDateString() === new Date().toLocaleDateString()
    ? timeString : dateString;
}
