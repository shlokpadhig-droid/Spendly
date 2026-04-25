# Spendly - Personal Finance & Event Tracking

Spendly is a modern, responsive personal finance application built to help you track expenses, set monthly category budgets, and monitor specific events (like trips, weddings, or parties).

## Features

- **Dashboard:** Visualize your spending with charts and budget progress bars.
- **Budgeting:** Set monthly budgets per category and track your progress.
- **Events (New):** Create events with a total budget, and link expenses to them to see real-time remaining limits.
- **Secure Authentication:** Integrated with Firebase Google Auth. No anonymous data viewing.
- **Responsive design:** Fully optimized for seamless mobile and desktop use.

## Setup Instructions (for GitHub / Local Development)

This app uses Vite, React, Tailwind CSS, and Firebase.

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

This application requires a Firebase project for authentication and Firestore data.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project or select an existing one.
3. Enable **Google Authentication** in the Auth providers list.
4. Enable **Firestore Database**.
5. Add a web app to the project and copy its configuration json.
6. Create a `firebase-applet-config.json` inside the root of this project:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT_ID.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

7. (Optional but recommended) Deploy the strict security rules in `firestore.rules` using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit the displayed localhost link (typically `http://localhost:3000` or `http://localhost:5173`).

### Built with Modern Tech
- React 19 + Vite
- Tailwind CSS 4
- Recharts for data visualization
- Motion for smooth animations
- Lucide React for consistent icons
- Firebase Firestore & Auth
