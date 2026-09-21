# My Timetable

A live college timetable app built with Expo (React Native) and TypeScript.

## Features
- Home: what class is on now, the previous class and the next one, with a live countdown, a day ribbon and today's weather (Open-Meteo API)
- Timetable: Monday to Friday, with free periods and lunch marked, in 12-hour time
- Attendance: present and absent counters per subject, with a "how many can I miss" calculator
- Editing inside the app: rename subjects, change colours and teachers, change any class slot, add rooms and labs
- Class reminders: a notification before each class (needs a real phone)
- Share with classmates: send your timetable as a code on WhatsApp, import theirs
- Everything is saved on the phone

## Run it with Expo Go
1. Install Node.js (LTS) from nodejs.org.
2. Open this folder in VS Code, then open the terminal (Ctrl + `) and run these in the project folder:

       npm install
       npx expo start

3. On your phone, install "Expo Go" from the Play Store, open it and scan the QR code shown in the terminal. Phone and laptop must be on the same Wi-Fi.
4. If college Wi-Fi blocks the connection, run `npx expo start --tunnel` instead.
5. For an Android emulator: in Android Studio create a device that has Google Play, start it, then press `a` in the terminal.

## Build a real app (APK) that installs without Expo Go
Run these in the project folder. You need a free account at expo.dev.

    npm install -g eas-cli
    eas login
    eas build -p android --profile preview

When the cloud build finishes you get a link to the .apk file. Send it to a phone and install it.

## Where things are
- App.tsx: the shell (tabs, back button, fonts)
- src/data/defaultTimetable.ts: the starting timetable
- src/logic/: the time, class and attendance maths (no UI in here)
- src/screens/: Home, Timetable, Attendance, Settings, Edit day, Subjects
- src/components/: cards, ribbon, sheets, tab bar
- src/state/AppContext.tsx: saved data and actions
- src/services/weather.ts: the weather API (change the city and coordinates at the top)
- src/services/reminders.ts: class reminders

## Notes
- CSE327 and BC209 are still shown by code. Rename them in Settings > Subjects.
- Monday and Thursday were cut off in the original screenshots. Open Timetable > Edit to add any missing classes, then turn on "All classes for this day are listed".
- Amizone has no public API, so attendance is entered by hand.
- Bricolage Grotesque font: SIL Open Font License.
