# Auto-Card: Credit Card Reward Optimizer

Auto-Card is a mobile application designed to help users manage their credit cards and make informed decisions about which card to use for purchases to maximize rewards.

## Features

*   **User Authentication:** Secure user registration and login.
*   **Card Management:** Add, view, and delete your credit cards.
*   **Reward Rules:** Define custom reward rules for each card (e.g., 3% cashback on dining, 2x points on travel).
*   **Card Recommendation:** Get an instant recommendation for the best card to use for a specific purchase category and amount.

## Tech Stack

*   **Frontend:** React Native with Expo
*   **Backend:** Python with Flask
*   **Database:** SQLite
*   **Authentication:** JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

*   Node.js and npm/yarn for the frontend.
*   Python and pip for the backend.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    ```
3.  **Activate the virtual environment:**
    ```bash
    source venv/bin/activate
    ```
4.  **Install the dependencies:**
    ```bash
    pip install Flask Flask-SQLAlchemy Flask-Cors Flask-Bcrypt Flask-JWT-Extended
    ```
5.  **Run the application:**
    ```bash
    flask run
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install the dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm start
    ```
