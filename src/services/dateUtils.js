// services/dateUtils.js
const moment = require('moment-timezone');

export function extract_time_from_timestamp_handler(timestamp) {
  const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local_date = moment.tz(timestamp, time_zone);
  const offset_in_hours = local_date.utcOffset() / 60;

  let adjusted_local_date;
  if (offset_in_hours > 0) {
      adjusted_local_date = local_date.add(offset_in_hours, 'hours');
  } else {
      adjusted_local_date = local_date.subtract(Math.abs(offset_in_hours), 'hours');
  }

  const adjusted_local_timeString = adjusted_local_date.format('YYYY-MM-DDTHH:mm:ss.SSSZ');

  return adjusted_local_timeString;
}

export function format_time_for_display(timestamp) {
  const time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local_date = moment.tz(timestamp, time_zone);
  const local_TimeString = local_date.format('HH:mm');

  return local_TimeString;
}




