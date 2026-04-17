const fs = require('fs');
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
        "DROP TABLE AVAILABLE_ON CASCADE CONSTRAINTS",
        "DROP TABLE MOVIE_GENRE CASCADE CONSTRAINTS",
        "DROP TABLE REVIEW CASCADE CONSTRAINTS",
        "DROP TABLE USER_LOGINS CASCADE CONSTRAINTS",
        "DROP TABLE STREAMING_PLATFORM CASCADE CONSTRAINTS",
        "DROP TABLE GENRE CASCADE CONSTRAINTS",
        "DROP TABLE USERS CASCADE CONSTRAINTS",
        "DROP TABLE MOVIE CASCADE CONSTRAINTS",
        "DROP TABLE PRODUCTION CASCADE CONSTRAINTS",
        
        "DROP SEQUENCE prod_seq", "DROP SEQUENCE movie_seq", "DROP SEQUENCE users_seq", "DROP SEQUENCE review_seq", "DROP SEQUENCE genre_seq", "DROP SEQUENCE platform_seq", "DROP SEQUENCE login_seq",
        
        "CREATE TABLE PRODUCTION (production_id NUMBER, name VARCHAR2(150) NOT NULL, founded_year NUMBER(4))",
        "ALTER TABLE PRODUCTION ADD CONSTRAINT pk_prod PRIMARY KEY (production_id)",
        "CREATE SEQUENCE prod_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER prod_trg BEFORE INSERT ON PRODUCTION FOR EACH ROW BEGIN IF :NEW.production_id IS NULL THEN :NEW.production_id := prod_seq.NEXTVAL; END IF; END;",
        
        // ADDED description, poster_url, director, and main_cast
        "CREATE TABLE MOVIE (movie_id NUMBER, title VARCHAR2(255) NOT NULL, duration_mins NUMBER(4), release_year NUMBER(4), description CLOB, poster_url VARCHAR2(1000), director VARCHAR2(255), main_cast VARCHAR2(1000), production_id NUMBER, CONSTRAINT fk_movie_prod FOREIGN KEY (production_id) REFERENCES PRODUCTION(production_id))",
        "ALTER TABLE MOVIE ADD CONSTRAINT pk_movie PRIMARY KEY (movie_id)",
        "CREATE SEQUENCE movie_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER movie_trg BEFORE INSERT ON MOVIE FOR EACH ROW BEGIN IF :NEW.movie_id IS NULL THEN :NEW.movie_id := movie_seq.NEXTVAL; END IF; END;",
        
        "CREATE TABLE USERS (user_id NUMBER, username VARCHAR2(50) UNIQUE NOT NULL, email VARCHAR2(150) UNIQUE NOT NULL, active_status VARCHAR2(20) DEFAULT 'ACTIVE')",
        "ALTER TABLE USERS ADD CONSTRAINT pk_user PRIMARY KEY (user_id)",
        "CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER users_trg BEFORE INSERT ON USERS FOR EACH ROW BEGIN IF :NEW.user_id IS NULL THEN :NEW.user_id := users_seq.NEXTVAL; END IF; END;",
        
        // USER LOGINS
        "CREATE TABLE USER_LOGINS (login_id NUMBER PRIMARY KEY, user_id NUMBER, login_time DATE DEFAULT SYSDATE, CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE)",
        "CREATE SEQUENCE login_seq START WITH 1 INCREMENT BY 1",
        "CREATE OR REPLACE TRIGGER login_trg BEFORE INSERT ON USER_LOGINS FOR EACH ROW BEGIN IF :NEW.login_id IS NULL THEN :NEW.login_id := login_seq.NEXTVAL; END IF; END;",

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

        // PRODUCTIONS
        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('Warner Bros', 1923)",
        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('Universal Pictures', 1923)",
        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('A24', 2012)",
        "INSERT INTO PRODUCTION (name, founded_year) VALUES ('Paramount Pictures', 1912)",

        // USERS
        "INSERT INTO USERS (username, email, active_status) VALUES ('demo_user', 'demo@cinestream.com', 'ACTIVE')",
        "INSERT INTO USERS (username, email, active_status) VALUES ('movie_buff99', 'buff@cinestream.com', 'ACTIVE')",

        // GENRES
        "INSERT INTO GENRE (name) VALUES ('Sci-Fi')",
        "INSERT INTO GENRE (name) VALUES ('Action')",
        "INSERT INTO GENRE (name) VALUES ('Thriller')",
        "INSERT INTO GENRE (name) VALUES ('Drama')",
        "INSERT INTO GENRE (name) VALUES ('Comedy')",
        "INSERT INTO GENRE (name) VALUES ('Horror')",
        "INSERT INTO GENRE (name) VALUES ('Romance')"
    ];

    for (let q of queries) {
        await executeStatement(q);
    }
    
    console.log('--- Inserting Movies ---');

    // A real list of detailed movies
    const movies = [
        { title: 'Inception', duration: 148, year: 2010, prod: 1, 
          desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", 
          poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", 
          director: "Christopher Nolan", cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy", genres: [1, 2] },
        { title: 'The Dark Knight', duration: 152, year: 2008, prod: 1, 
          desc: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", 
          poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", 
          director: "Christopher Nolan", cast: "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine", genres: [2, 3, 4] },
        { title: 'Dune', duration: 155, year: 2021, prod: 1, 
          desc: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.", 
          poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", 
          director: "Denis Villeneuve", cast: "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Zendaya", genres: [1, 2] },
        { title: 'Oppenheimer', duration: 180, year: 2023, prod: 2, 
          desc: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.", 
          poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", 
          director: "Christopher Nolan", cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.", genres: [4] },
        { title: 'Everything Everywhere All at Once', duration: 139, year: 2022, prod: 3, 
          desc: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.", 
          poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", 
          director: "Daniel Kwan, Daniel Scheinert", cast: "Michelle Yeoh, Ke Huy Quan, Stephanie Hsu, Jamie Lee Curtis", genres: [1, 2, 5] },
        { title: 'Interstellar', duration: 169, year: 2014, prod: 4, 
          desc: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", 
          poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", 
          director: "Christopher Nolan", cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine", genres: [1, 4] },
        { title: 'Midsommar', duration: 148, year: 2019, prod: 3, 
          desc: "A couple travels to Scandinavia to visit a rural hometown's fabled midsummer festival. What begins as an idyllic retreat quickly devolves into an increasingly violent and bizarre competition at the hands of a pagan cult.", 
          poster: "https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKcEt82.jpg", 
          director: "Ari Aster", cast: "Florence Pugh, Jack Reynor, William Jackson Harper, Vilhelm Blomgren", genres: [4, 6] },
        { title: 'The Matrix', duration: 136, year: 1999, prod: 1, 
          desc: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.", 
          poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", 
          director: "Lana Wachowski, Lilly Wachowski", cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving", genres: [1, 2] },
        { title: 'Jurassic Park', duration: 136, year: 1993, prod: 2, 
          desc: "A pragmatic paleontologist touring an almost complete theme park on an island in Central America is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose.", 
          poster: "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VuEEVvh5vR.jpg", 
          director: "Steven Spielberg", cast: "Sam Neill, Laura Dern, Jeff Goldblum, Richard Attenborough", genres: [1, 2] },
        { title: 'Parasite', duration: 132, year: 2019, prod: 2, 
          desc: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", 
          poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", 
          director: "Bong Joon Ho", cast: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik", genres: [3, 4] },
        { title: 'Spider-Man: Across the Spider-Verse', duration: 140, year: 2023, prod: 1, 
          desc: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.", 
          poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", 
          director: "Joaquim Dos Santos, Kemp Powers", cast: "Shameik Moore, Hailee Steinfeld, Oscar Isaac, Jake Johnson", genres: [1, 2] },
        { title: 'The Godfather', duration: 175, year: 1972, prod: 4, 
          desc: "An organized crime dynasty's aging patriarch transfers control of his clandestine empire to his reluctant son.", 
          poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", 
          director: "Francis Ford Coppola", cast: "Marlon Brando, Al Pacino, James Caan, Diane Keaton", genres: [2, 4] },
        { title: 'Pulp Fiction', duration: 154, year: 1994, prod: 3, 
          desc: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", 
          poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPbOYKQruzY.jpg", 
          director: "Quentin Tarantino", cast: "John Travolta, Uma Thurman, Samuel L. Jackson, Bruce Willis", genres: [2, 3] },
        { title: 'Inglourious Basterds', duration: 153, year: 2009, prod: 2, 
          desc: "In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner's vengeful plans.", 
          poster: "https://image.tmdb.org/t/p/w500/7sfbEAT0sV0IpnAScK2eb58OaK6.jpg", 
          director: "Quentin Tarantino", cast: "Brad Pitt, Mélanie Laurent, Christoph Waltz, Eli Roth", genres: [2, 4] },
        { title: 'Kill Bill: Vol. 1', duration: 111, year: 2003, prod: 3, 
          desc: "After awakening from a four-year coma, a former assassin wreaks vengeance on the team of assassins who betrayed her.", 
          poster: "https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yOXDqGEj1oVZf21.jpg", 
          director: "Quentin Tarantino", cast: "Uma Thurman, Lucy Liu, Vivica A. Fox, Michael Madsen", genres: [2, 3] }
    ];

    let movieId = 1;
    for (const m of movies) {
        await executeQuery(
            `INSERT INTO MOVIE (title, duration_mins, release_year, production_id, description, poster_url, director, main_cast) 
             VALUES (:t, :d, :y, :p, :ds, :post, :dir, :cas)`,
            [m.title, m.duration, m.year, m.prod, m.desc, m.poster, m.director, m.cast], 
            { autoCommit: true }
        );
        for(const g of m.genres) {
            await executeQuery(`INSERT INTO MOVIE_GENRE (movie_id, genre_id) VALUES (:m, :g)`, [movieId, g], { autoCommit: true });
        }
        movieId++;
    }

    console.log('--- Setting up Reviews and Defaults ---');
    let finalQueries = [
        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (2, 1, 10, 'A masterpiece of modern cinema. Mind bending.')",
        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (1, 2, 9, 'Heath Ledger was phenomenal.')",
        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (2, 3, 8, 'Visually stunning adaptation.')",
        "INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (1, 4, 10, 'Easily the movie of the decade.')"
    ];
    
    // Add review for movies that don't have one manually added above
    for (let i = 5; i <= movies.length; i++) {
        finalQueries.push(`INSERT INTO REVIEW (user_id, movie_id, rating, review_text) VALUES (1, ${i}, 8, 'Really enjoyable watch!')`);
    }

    finalQueries = finalQueries.concat([
        "INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('Netflix', 15.99)",
        "INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('HBO Max', 14.99)",
        "INSERT INTO STREAMING_PLATFORM (name, subscription_price) VALUES ('Prime Video', 8.99)",
        
        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (1, 2)",
        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (3, 2)",
        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (4, 2)",
        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (8, 2)",
        "INSERT INTO AVAILABLE_ON (movie_id, platform_id) VALUES (10, 1)"
    ]);

    for (let fq of finalQueries) {
        await executeStatement(fq);
    }
    
    await closeDb();
    console.log('Database setup complete!');
}

setup();