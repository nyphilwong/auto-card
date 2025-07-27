# Auto-Card To-Do List

This file tracks the development progress of the Auto-Card project.

## High Priority

*   [x] **Refactor HomeScreen to be the Card Management Screen:**
    *   [x] Merge the functionality of `CardManagementScreen` into `HomeScreen`.
    *   [x] Redesign the layout to resemble Apple Wallet, with a vertically scrolling list of cards.
    *   [x] Tapping a card should navigate to its `RewardRuleScreen`.
*   [x] **Card Management UI:**
    *   [x] Create a new screen to display a list of the user's credit cards.
    *   [x] Implement a form to add a new credit card.
    *   [x] Add the ability to delete a credit card.
*   [x] **Reward Rule UI:**
    *   [x] Design a user interface for adding, viewing, and deleting reward rules for each card.
    *   [x] Connect the UI to the backend API endpoints for reward rules.

## Medium Priority

*   [ ] **Improved Reward Calculation:**
    *   [ ] Enhance the backend logic to handle different reward types (e.g., points with varying values).
    *   [ ] Consider adding support for rotating categories or special offers.
*   [ ] **UI/UX Enhancements:**
    *   [ ] Improve the overall design and user experience of the app.
    *   [ ] Add more user-friendly components for managing cards and rules.
*   [ ] **Testing:**
    *   [ ] Write unit tests for the backend API endpoints.
    *   [ ] Implement component and integration tests for the frontend.

## Low Priority

*   [ ] **Database Migration:**
    *   [ ] Evaluate and potentially migrate to a more robust database for production (e.g., PostgreSQL).
*   [ ] **Deployment:**
    *   [ ] Set up a CI/CD pipeline for automated testing and deployment.
    *   [ ] Deploy the backend and frontend to a cloud provider.
*   [ ] **Advanced Features:**
    *   [ ] Track rewards earned over time.
    *   [ ] Set spending goals and receive personalized recommendations.
