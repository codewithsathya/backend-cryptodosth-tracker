function getTimeFrameInMilliseconds(timeFrame) {
  let minute = 60000;
  let hour = 60 * minute;
  let day = 24 * hour;
  switch (timeFrame) {
    case "1m":
      return minute;
    case "3m":
      return 3 * minute;
    case "5m":
      return 5 * minute;
    case "15m":
      return 15 * minute;
    case "30m":
      return 30 * minute;
    case '1h':
      return hour;
    case '2h':
      return 2 * hour;
    case '4h':
      return 4 * hour;
    case '6h':
      return 6 * hour;
    case '8h':
      return 8 * hour;
    case '12h':
      return 12 * hour;
    case '1d':
      return day;
    case '3d':
      return 3 * day;
    case '1w':
      return 7 * day;
    default:
      throw new Error("Invalid timeframe");
  }
}

module.exports = getTimeFrameInMilliseconds;