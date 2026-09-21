// Class slots from Amizone: each class is 50 minutes. Values are minutes since midnight.
export const SLOTS: { id: number; start: number; end: number }[] = [
  { id: 1, start: 555, end: 605 }, // 9:15 - 10:05
  { id: 2, start: 610, end: 660 }, // 10:10 - 11:00
  { id: 3, start: 665, end: 715 }, // 11:05 - 11:55
  { id: 4, start: 775, end: 825 }, // 12:55 - 1:45
  { id: 5, start: 830, end: 880 }, // 1:50 - 2:40
  { id: 6, start: 885, end: 935 }, // 2:45 - 3:35
];

export const LUNCH_START = 715; // 11:55
export const LUNCH_END = 775; // 12:55
export const DAY_START = 555; // 9:15
export const DAY_END = 935; // 3:35

export const WEEKDAYS = [1, 2, 3, 4, 5];
export const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_SHORT = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
