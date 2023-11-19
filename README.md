# KSU Reservation App

The KSU Reservation App allows users to reserve devices and rooms. Admins have the ability to approve requests and add new devices. Please note that the authentication/login functionality is still a work in progress and a UITS ticket has been submitted for its implementation.

## Getting Started

To work on this project, ensure that you have Node.js installed on your machine and a database set up.

1. Add .env files accordingly in the `backend` folder for database connection settings.
2. Open two integrated terminals: one for the backend and one for the frontend.
3. Run `npm init` on both terminals to initialize the project.
4. Run `npm install express` on the backend terminal to install the required dependencies.
5. Launch the development environment by running `npm start` on both terminals.
6. Use `ctrl + c` to exit the development environments.

## Project Structure

The project is structured into two main parts: the backend and the frontend.

- `backend`: Manages server-side logic, handles database connections, and exposes APIs for frontend communication.
- `frontend`: Handles the user interface, user interactions, and communicates with the backend.
