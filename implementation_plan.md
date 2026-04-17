# Movie Streaming and Management System

This document outlines the implementation plan for building a robust Movie Streaming and Management System based on the provided `project.md` and `techstack.md` guidelines. It will include a fully responsive React frontend, a Node.js backend API, and a deeply normalized Oracle SQL database structue.

## User Review Required

> [!IMPORTANT]
> The database requires an **Oracle SQL** instance to connect to (unlike SQLite, it cannot simply be an embedded file). 
> Please review the Open Questions below regarding how you want to handle the database connection and the project stack before we begin.

## Proposed Changes

### Database Architecture
* Detailed schema design using strictly normalized tables in BCNF.
* Use of `SEQUENCE` and `TRIGGER` for auto-increment keys to accommodate Oracle standards.
* Generates SQL scripts (`init.sql` and `seed.sql`) containing the table creations, foreign keys, sequences, triggers, and mock data.

#### [NEW] `database/init.sql`
#### [NEW] `database/seed.sql`

---

### Backend Components (Node.js & Express)
* Implement a robust Node.js backend using `express` and the `oracledb` package.
* Structure:
  * `db.js` for Oracle connection pooling.
  * APIs to serve movie data, handles complex multi-table queries involving genres, trailers, and reviews.
  * APIs to handle user management and reviews creation.

#### [NEW] `backend/package.json`
#### [NEW] `backend/server.js`
#### [NEW] `backend/src/db.js`
#### [NEW] `backend/src/routes/movies.js`
#### [NEW] `backend/src/routes/reviews.js`

---

### Frontend Components (React & Tailwind CSS)
* A modern, responsive interface initialized using Vite.
* Rich aesthetic utilizing Tailwind CSS to mimic popular streaming platforms (dark theme, glassmorphism, smooth hover transitions).
* Pages:
  * **Dashboard:** A grid of available movies, filtered by genres.
  * **Movie Details:** A comprehensive view showing cast, crew, trailers, streaming platforms, and reviews.
  * **Review Submission:** Interacting with the backend to let users post their review and rating.

#### [NEW] `frontend/package.json` 
#### [NEW] `frontend/src/App.jsx`
#### [NEW] `frontend/src/index.css`
#### [NEW] `frontend/src/components/MovieList.jsx`
#### [NEW] `frontend/src/components/MovieCard.jsx`
#### [NEW] `frontend/src/components/MovieDetails.jsx`

## Open Questions

> [!WARNING]
> 1. **Oracle Database Connectivity**: Do you have a local Oracle Database (like Oracle XE or an Oracle container) currently running? I will need the connection details (Username, Password, Host, Port, and Service Name/SID) for the backend to connect. If not, would you prefer I set up a `docker-compose.yml` to spin up an Oracle container for you alongside the code?
> 2. **Technology Selection**: I have selected **Node.js (Express)** for the backend and **React (Vite+TailwindCSS)** for the frontend as they were suggested in the techstack document. Does this stack work for you?

## Verification Plan

### Automated Tests
* Use simple endpoint testing in the Node.js server setup to verify database connectivity and basic querying.

### Manual Verification
* Run the SQL scripts in SQL*Plus to ensure they execute without syntax errors and correctly build the schema.
* Start the backend server and ensure it connects to Oracle.
* Run the frontend server `npm run dev` and test user interactions (browsing movies, viewing details, submitting a review) using the browser tool.
