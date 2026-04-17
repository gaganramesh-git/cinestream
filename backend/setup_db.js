const fs = require('fs');
const path = require('path');
const { initDb, closeDb, executeQuery } = require('./src/db');

async function executeStatement(statement) {
    let cleanStmt = statement.trim();
    if (!cleanStmt || cleanStmt.startsWith('--') || cleanStmt.toUpperCase() === 'COMMIT') return;
    
    cleanStmt = cleanStmt.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
    if (!cleanStmt) return;

    try {
        await executeQuery(cleanStmt, [], { autoCommit: true });
        console.log(`Success: ${cleanStmt.substring(0, 45).replace(/\n/g, ' ')}...`);
    } catch (err) {
        if (!err.message.includes('ORA-00942') && !err.message.includes('ORA-02289') && !err.message.includes('ORA-00955')) {
            console.error(`Error: ${err.message} on statement: ${cleanStmt.substring(0, 45).replace(/\n/g, ' ')}...`);
        }
    }
}

async function setup() {
    await initDb();

    console.log('--- Creating Tables ---');
    const queries = [
        "CREATE TABLE PRODUCTION (production_id NUMBER, name VARCHAR2(150) NOT NULL, founded_year NUMBER(4))",
        "ALTER TABLE PRODUCTION ADD CONSTRAINT pk_prod PRIMARY KEY (production_id)",
        "CREATE SEQUENCE prod_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER prod_trg BEFORE INSERT ON PRODUCTION FOR EACH ROW BEGIN IF :NEW.production_id IS NULL THEN :NEW.production_id := prod_seq.NEXTVAL; END IF; END;",
        "CREATE TABLE MOVIE (movie_id NUMBER, title VARCHAR2(255) NOT NULL, duration_mins NUMBER(4), release_year NUMBER(4), production_id NUMBER, CONSTRAINT fk_movie_prod FOREIGN KEY (production_id) REFERENCES PRODUCTION(production_id))",
        "ALTER TABLE MOVIE ADD CONSTRAINT pk_movie PRIMARY KEY (movie_id)",
        "CREATE SEQUENCE movie_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER movie_trg BEFORE INSERT ON MOVIE FOR EACH ROW BEGIN IF :NEW.movie_id IS NULL THEN :NEW.movie_id := movie_seq.NEXTVAL; END IF; END;",
        "CREATE TABLE USERS (user_id NUMBER, username VARCHAR2(50) UNIQUE NOT NULL, email VARCHAR2(150) UNIQUE NOT NULL, active_status VARCHAR2(20) DEFAULT 'ACTIVE')",
        "ALTER TABLE USERS ADD CONSTRAINT pk_user PRIMARY KEY (user_id)",
        "CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER users_trg BEFORE INSERT ON USERS FOR EACH ROW BEGIN IF :NEW.user_id IS NULL THEN :NEW.user_id := users_seq.NEXTVAL; END IF; END;",
        "CREATE TABLE REVIEW (review_id NUMBER, user_id NUMBER NOT NULL, movie_id NUMBER NOT NULL, rating NUMBER(2) CHECK (rating BETWEEN 1 AND 10), review_text CLOB, review_date DATE DEFAULT SYSDATE, CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE, CONSTRAINT fk_review_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE)",
        "ALTER TABLE REVIEW ADD CONSTRAINT pk_rev PRIMARY KEY (review_id)",
        "CREATE SEQUENCE review_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER review_trg BEFORE INSERT ON REVIEW FOR EACH ROW BEGIN IF :NEW.review_id IS NULL THEN :NEW.review_id := review_seq.NEXTVAL; END IF; END;",
        "CREATE TABLE GENRE (genre_id NUMBER, name VARCHAR2(100) UNIQUE NOT NULL)",
        "ALTER TABLE GENRE ADD CONSTRAINT pk_genre PRIMARY KEY (genre_id)",
        "CREATE SEQUENCE genre_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER genre_trg BEFORE INSERT ON GENRE FOR EACH ROW BEGIN IF :NEW.genre_id IS NULL THEN :NEW.genre_id := genre_seq.NEXTVAL; END IF; END;",
        "CREATE TABLE STREAMING_PLATFORM (platform_id NUMBER, name VARCHAR2(100) UNIQUE NOT NULL, subscription_price NUMBER(5, 2))",
        "ALTER TABLE STREAMING_PLATFORM ADD CONSTRAINT pk_platform PRIMARY KEY (platform_id)",
        "CREATE SEQUENCE platform_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER platform_trg BEFORE INSERT ON STREAMING_PLATFORM FOR EACH ROW BEGIN IF :NEW.platform_id IS NULL THEN :NEW.platform_id := platform_seq.NEXTVAL; END IF; END;",
        "CREATE TABLE MOVIE_GENRE (movie_id NUMBER, genre_id NUMBER, PRIMARY KEY (movie_id, genre_id), CONSTRAINT fk_mg_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE, CONSTRAINT fk_mg_genre FOREIGN KEY (genre_id) REFERENCES GENRE(genre_id) ON DELETE CASCADE)",
        "CREATE TABLE AVAILABLE_ON (movie_id NUMBER, platform_id NUMBER, PRIMARY KEY (movie_id, platform_id), CONSTRAINT fk_ao_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE, CONSTRAINT fk_ao_platform FOREIGN KEY (platform_id) REFERENCES STREAMING_PLATFORM(platform_id) ON DELETE CASCADE)",

        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('Warner Bros', 1923)",
        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('Universal Pictures', 1923)",
        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('A24', 2012)",

        "INSERT INTO USERS (username, email, active_status) VALUES ('demo_user', 'demo@cinestream.com', 'ACTIVE')",
        "INSERT INTO USERS (username, email, active_status) VALUES ('movie_buff99', 'buff@cinestream.com', 'ACTIVE')",

        "INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Inception', 148, 2010, 1)",
        "INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('The Dark Knight', 152, 2008, 1)",
        "INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Dune', 155, 2021, 1)",
        "INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Oppenheimer', 155, 2023, 2)",
        "INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Everything Everywhere All at Once', 139, 2022, 3)",
        "INSERT INTO MOVIE (title, duration_mins, release_year, production_id) VALUES ('Interstellar', 169, 2014, 1)",

        "INSERT INTO GENRE (name) VALUES ('Sci-Fi')",
        "INSERT INTO GENRE (name) VALUES ('Action')",
        "INSERT INTO GENRE (name) VALUES ('Thriller')",
        "INSERT INTO GENRE (name) VALUES ('Drama')",

        "INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (1, 1)",
        "INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (1, 2)",
        "INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (2, 2)",
        "INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (2, 3)",
        "INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (3, 1)",
        "INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (4, 4)",

        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (2, 1, 10, 'A masterpiece of modern cinema. Mind bending.')",
        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (1, 2, 9, 'Heath Ledger was phenomenal.')",
        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (2, 3, 8, 'Visually stunning adaptation.')",

        "INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('Netflix', 15.99)",
        "INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('HBO Max', 14.99)",

        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (1, 2)",
        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (3, 2)"
    ];

    for (let q of queries) {
        await executeStatement(q);
    }
    
    await closeDb();
    console.log('Database setup complete!');
}

setup();
