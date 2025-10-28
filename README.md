# Mentimeter Clone - Frontend

This is the frontend for a real-time interactive quiz and presentation application, similar to Mentimeter. It is built using React and communicates with a Spring Boot backend via REST APIs and WebSockets.

## Features

* **User Authentication:** Secure login and registration using JWT.
* **Quiz Management:**
    * Create new quizzes with multiple-choice questions.
    * Edit existing quizzes.
    * View all quizzes on a central dashboard.
* **Real-time Sessions (Host):**
    * Host a live quiz session.
    * Control the flow of questions.
    * View a real-time leaderboard.
* **Real-time Sessions (Participant):**
    * Join a session using a unique code.
    * Submit answers in real-time.
    * View your score and the leaderboard.
* **Asynchronous Quizzes:**
    * Share quizzes via a unique link for participants to take at their own pace.
    * View results and analytics for asynchronous quizzes.
* **AI Quiz Generation:** (via backend)
    * Generate quiz questions automatically from text using AI.
* **Analytics:**
    * View detailed analytics for both live and asynchronous quizzes.
* **Theme:**
    * Includes a dark mode/light mode toggle.

## Tech Stack

* **React.js:** Core frontend library.
* **React Router:** For client-side routing.
* **Tailwind CSS:** For styling and UI components.
* **Axios:** For making HTTP requests to the backend API.
* **SockJS & StompJS:** For WebSocket communication during real-time sessions.
* **React Context API:** For managing global state (e.g., authentication, theme).

## Setup and Installation

Follow these steps to get the development environment running locally.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/RounakDagar/mentimeter-frontend.git]
    cd mentimeter-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```
    This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
