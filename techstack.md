# Technical Stack & Architecture

## Database Architecture (Core Focus)
The backbone of this application is a highly normalized relational database.
* [cite_start]**Primary Database Engine:** Oracle SQL[cite: 270].
* [cite_start]**Normalization Standard:** All tables are strictly normalized to Boyce-Codd Normal Form (BCNF)[cite: 228].
* [cite_start]**Key Mechanisms:** Uses Oracle `SEQUENCE` and `TRIGGER` blocks to handle auto-incrementing primary keys (adapted from an initial MySQL draft)[cite: 271, 272].
* [cite_start]**Core Tables:** USERS, MOVIE, REVIEW, WATCH_HISTORY, TRAILER, GENRE, PRODUCTION, AWARD, CONTENT_WARNING, STREAMING_PLATFORM, THEATER, CAST_MEMBER, CREW_MEMBER [cite: 273-298].
* [cite_start]**Mapping Tables (Many-to-Many):** MOVIE_GENRE, MOVIE_AWARD, MOVIE_WARNING, AVAILABLE_ON, SHOWN_IN, FEATURES, TEAM [cite: 299-312].

## Backend Framework (Suggested)
* **Language/Framework:** Node.js with Express (or Python with Django/FastAPI).
* **Database Driver:** `oracledb` (Node.js) or `cx_Oracle` (Python) to establish secure connections to the Oracle database.
* **Architecture Style:** RESTful API to handle CRUD operations for movies, users, and reviews.

## Frontend Framework (Suggested)
* **Framework:** React.js or Vue.js.
* **State Management:** Redux or Context API (for managing user sessions and complex data loads like watch history).
* **Styling:** Tailwind CSS or Material-UI for a clean, streaming-platform aesthetic.