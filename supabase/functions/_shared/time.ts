import { DateTime } from 'https://esm.sh/luxon@3.4.4';

export const todayInTz = (tz: string) => {
  return DateTime.now().setZone(tz).startOf('day');
};

export const nowUtc = () => DateTime.utc();
