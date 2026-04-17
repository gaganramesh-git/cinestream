-- ==========================================
-- SEED DATA for MOVIE STREAMING SYSTEM 
-- ==========================================

-- 1. Insert Production Companies
INSERT INTO PRODUCTION (name, founded_year) VALUES ('Warner Bros', 1923);
INSERT INTO PRODUCTION (name, founded_year) VALUES ('Universal Pictures', 1923);
INSERT INTO PRODUCTION (name, founded_year) VALUES ('A24', 2012);

-- 2. Insert Users (User ID 1 is expected by frontend review submission)
INSERT INTO USERS (username, email, active_status) VALUES ('demo_user', 'demo@cinestream.com', 'ACTIVE');
INSERT INTO USERS (username, email, active_status) VALUES ('movie_buff99', 'buff@cinestream.com', 'ACTIVE');

-- 3. Insert Movies
INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Inception', 148, 2010, 1);
INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('The Dark Knight', 152, 2008, 1);
INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Dune', 155, 2021, 1);
INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Oppenheimer', 155, 2023, 2);
INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Everything Everywhere All at Once', 139, 2022, 3);
INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Interstellar', 169, 2014, 1);

-- 4. Insert Genres
INSERT INTO GENRE (name) VALUES ('Sci-Fi');
INSERT INTO GENRE (name) VALUES ('Action');
INSERT INTO GENRE (name) VALUES ('Thriller');
INSERT INTO GENRE (name) VALUES ('Drama');

-- 5. Map Movies to Genres (Many-to-Many)
INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (1, 1);
INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (1, 2);
INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (2, 2);
INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (2, 3);
INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (3, 1);
INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (4, 4);

-- 6. Insert Reviews
INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (2, 1, 10, 'A masterpiece of modern cinema. Mind bending.');
INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (1, 2, 9, 'Heath Ledger was phenomenal.');
INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (2, 3, 8, 'Visually stunning adaptation.');

-- 7. Insert Streaming Platforms
INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('Netflix', 15.99);
INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('HBO Max', 14.99);

-- 8. Map Movies Available on Platforms
INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (1, 2);
INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (3, 2);

COMMIT;
