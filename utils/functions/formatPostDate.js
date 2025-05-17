export default function formatPostDate(createdAt) {
  const now = new Date();
  const postDate = new Date(createdAt);
  const diffMs = now - postDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Handle very recent posts (less than a minute old)
  if (diffMinutes <= 0) {
    return "just now";
  } else if (diffHours < 24) {
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  } else if (diffDays <= 7) {
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    return postDate.toLocaleString(undefined, options);
  } else {
    const day = postDate.getDate();
    const month = postDate.toLocaleString(undefined, { month: 'long' });
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
        ? 'rd'
        : 'th';

    return `${day}${suffix} ${month}`;
  }
}