import { Timetable } from '../types';

/**
 * Timetable read from the Amizone screenshots (B.Tech CSE 1A + ME Robotics & IoT 1A).
 * Slots: 1 = 9:15, 2 = 10:10, 3 = 11:05, 4 = 12:55, 5 = 1:50, 6 = 2:45.
 * CSE327 and BC209 are still shown by code. Rename them inside the app: Settings > Subjects.
 * Monday and Thursday were cut off in the screenshots, so they are flagged as incomplete.
 */
export function defaultTimetable(): Timetable {
  return {
    subjects: [
      { id: 'french', name: 'French', teacher: 'Mr Vishal Raj Diwakar', color: 0 },
      { id: 'maths', name: 'Maths', teacher: 'Dr Atul Kumar Srivastava', color: 1 },
      { id: 'evs', name: 'Environmental Studies', teacher: 'Dr Vishal Kumar Parida', color: 2 },
      { id: 'cprog', name: 'C Programming', teacher: 'Ms Chanda Pathak', color: 3 },
      { id: 'cse327', name: 'CSE327', teacher: 'Dr Mamta Jain', color: 4 },
      { id: 'bc209', name: 'BC209', teacher: 'Dr Diksha Verma', color: 5 },
    ],
    week: {
      1: {
        1: { subjectId: 'french', room: '' },
        3: { subjectId: 'maths', room: '' },
        4: { subjectId: 'cprog', room: '' },
        5: { subjectId: 'cse327', room: '' },
      },
      2: {
        1: { subjectId: 'cprog', room: 'Computer Lab 120' },
        2: { subjectId: 'cprog', room: 'Computer Lab 120' },
        3: { subjectId: 'evs', room: '' },
        4: { subjectId: 'maths', room: '' },
        5: { subjectId: 'bc209', room: '' },
        6: { subjectId: 'cse327', room: '' },
      },
      3: {
        2: { subjectId: 'cse327', room: 'Computer Lab 121' },
        3: { subjectId: 'cse327', room: 'Computer Lab 121' },
        4: { subjectId: 'cprog', room: '' },
        6: { subjectId: 'evs', room: '' },
      },
      4: {
        1: { subjectId: 'cse327', room: '' },
        2: { subjectId: 'maths', room: '' },
        3: { subjectId: 'bc209', room: '' },
        4: { subjectId: 'cprog', room: '' },
      },
      5: {
        1: { subjectId: 'maths', room: '' },
        3: { subjectId: 'french', room: '' },
        4: { subjectId: 'evs', room: '' },
        5: { subjectId: 'bc209', room: '' },
        6: { subjectId: 'cse327', room: '' },
      },
    },
    incompleteDays: [1, 4],
  };
}
