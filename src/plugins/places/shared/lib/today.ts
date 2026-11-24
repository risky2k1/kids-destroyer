const VN_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

/** Calendar day in Vietnam as 'YYYY-MM-DD' (servers run in UTC). */
export const todayInVietnam = (now: Date = new Date()): string => VN_DATE.format(now);
