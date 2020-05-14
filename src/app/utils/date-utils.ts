const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getDateString(date: Date): string {
  const day = dayNames[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = monthNames[date.getMonth()];
  return `${day}, ${dayOfMonth} ${month}`;
}

export function getTimeStampString(timestamp: number): string {
  const lastModifiedDate = new Date(timestamp);
  return lastModifiedDate.toLocaleDateString() === new Date().toLocaleDateString()
    ? getTimeString(lastModifiedDate)
    : getDateString(lastModifiedDate);
}

export function getCurrentTimeStringWithMillis(): string {
  const date = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function getCurrentTimeInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
