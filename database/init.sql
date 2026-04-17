-- Drop tables if needed to reset schema (Optional, not included for safety)

-- ==========================================
-- 1. ENTITY TABLES
-- ==========================================

-- PRODUCTION table
CREATE TABLE PRODUCTION (
    production_id NUMBER PRIMARY KEY,
    name VARCHAR2(150) NOT NULL,
    founded_year NUMBER(4)
);

CREATE SEQUENCE prod_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER prod_trg
BEFORE INSERT ON PRODUCTION
FOR EACH ROW
BEGIN
  IF :NEW.production_id IS NULL THEN
    :NEW.production_id := prod_seq.NEXTVAL;
  END IF;
END;
/

-- MOVIE table
CREATE TABLE MOVIE (
    movie_id NUMBER PRIMARY KEY,
    title VARCHAR2(255) NOT NULL,
    duration_mins NUMBER(4),
    release_year NUMBER(4),
    production_id NUMBER,
    CONSTRAINT fk_movie_prod FOREIGN KEY (production_id) REFERENCES PRODUCTION(production_id)
);

CREATE SEQUENCE movie_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER movie_trg
BEFORE INSERT ON MOVIE
FOR EACH ROW
BEGIN
  IF :NEW.movie_id IS NULL THEN
    :NEW.movie_id := movie_seq.NEXTVAL;
  END IF;
END;
/

-- USERS table
CREATE TABLE USERS (
    user_id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    email VARCHAR2(150) UNIQUE NOT NULL,
    active_status VARCHAR2(20) DEFAULT 'ACTIVE'
);

CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER users_trg
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
  IF :NEW.user_id IS NULL THEN
    :NEW.user_id := users_seq.NEXTVAL;
  END IF;
END;
/

-- REVIEW table
CREATE TABLE REVIEW (
    review_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    movie_id NUMBER NOT NULL,
    rating NUMBER(2) CHECK (rating BETWEEN 1 AND 10),
    review_text CLOB,
    review_date DATE DEFAULT SYSDATE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE
);

CREATE SEQUENCE review_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER review_trg
BEFORE INSERT ON REVIEW
FOR EACH ROW
BEGIN
  IF :NEW.review_id IS NULL THEN
    :NEW.review_id := review_seq.NEXTVAL;
  END IF;
END;
/

-- WATCH_HISTORY table
CREATE TABLE WATCH_HISTORY (
    watch_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    movie_id NUMBER NOT NULL,
    watch_date DATE DEFAULT SYSDATE,
    CONSTRAINT fk_watch_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_watch_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE
);

CREATE SEQUENCE watch_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER watch_trg
BEFORE INSERT ON WATCH_HISTORY
FOR EACH ROW
BEGIN
  IF :NEW.watch_id IS NULL THEN
    :NEW.watch_id := watch_seq.NEXTVAL;
  END IF;
END;
/

-- TRAILER table
CREATE TABLE TRAILER (
    trailer_id NUMBER PRIMARY KEY,
    movie_id NUMBER NOT NULL,
    url VARCHAR2(500) NOT NULL,
    duration_secs NUMBER(4),
    CONSTRAINT fk_trailer_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE
);

CREATE SEQUENCE trailer_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER trailer_trg
BEFORE INSERT ON TRAILER
FOR EACH ROW
BEGIN
  IF :NEW.trailer_id IS NULL THEN
    :NEW.trailer_id := trailer_seq.NEXTVAL;
  END IF;
END;
/

-- GENRE table
CREATE TABLE GENRE (
    genre_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) UNIQUE NOT NULL
);

CREATE SEQUENCE genre_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER genre_trg
BEFORE INSERT ON GENRE
FOR EACH ROW
BEGIN
  IF :NEW.genre_id IS NULL THEN
    :NEW.genre_id := genre_seq.NEXTVAL;
  END IF;
END;
/

-- AWARD table
CREATE TABLE AWARD (
    award_id NUMBER PRIMARY KEY,
    name VARCHAR2(200) UNIQUE NOT NULL
);

CREATE SEQUENCE award_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER award_trg
BEFORE INSERT ON AWARD
FOR EACH ROW
BEGIN
  IF :NEW.award_id IS NULL THEN
    :NEW.award_id := award_seq.NEXTVAL;
  END IF;
END;
/

-- CONTENT_WARNING table
CREATE TABLE CONTENT_WARNING (
    warning_id NUMBER PRIMARY KEY,
    description VARCHAR2(200) UNIQUE NOT NULL
);

CREATE SEQUENCE warning_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER warning_trg
BEFORE INSERT ON CONTENT_WARNING
FOR EACH ROW
BEGIN
  IF :NEW.warning_id IS NULL THEN
    :NEW.warning_id := warning_seq.NEXTVAL;
  END IF;
END;
/

-- STREAMING_PLATFORM table
CREATE TABLE STREAMING_PLATFORM (
    platform_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) UNIQUE NOT NULL,
    subscription_price NUMBER(5, 2)
);

CREATE SEQUENCE platform_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER platform_trg
BEFORE INSERT ON STREAMING_PLATFORM
FOR EACH ROW
BEGIN
  IF :NEW.platform_id IS NULL THEN
    :NEW.platform_id := platform_seq.NEXTVAL;
  END IF;
END;
/

-- THEATER table
CREATE TABLE THEATER (
    theater_id NUMBER PRIMARY KEY,
    name VARCHAR2(150) NOT NULL,
    location VARCHAR2(255) NOT NULL
);

CREATE SEQUENCE theater_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER theater_trg
BEFORE INSERT ON THEATER
FOR EACH ROW
BEGIN
  IF :NEW.theater_id IS NULL THEN
    :NEW.theater_id := theater_seq.NEXTVAL;
  END IF;
END;
/

-- CAST_MEMBER table
CREATE TABLE CAST_MEMBER (
    cast_id NUMBER PRIMARY KEY,
    name VARCHAR2(150) NOT NULL,
    experience_level VARCHAR2(50)
);

CREATE SEQUENCE cast_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER cast_trg
BEFORE INSERT ON CAST_MEMBER
FOR EACH ROW
BEGIN
  IF :NEW.cast_id IS NULL THEN
    :NEW.cast_id := cast_seq.NEXTVAL;
  END IF;
END;
/

-- CREW_MEMBER table
CREATE TABLE CREW_MEMBER (
    crew_id NUMBER PRIMARY KEY,
    name VARCHAR2(150) NOT NULL,
    role VARCHAR2(100),
    experience_level VARCHAR2(50)
);

CREATE SEQUENCE crew_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER crew_trg
BEFORE INSERT ON CREW_MEMBER
FOR EACH ROW
BEGIN
  IF :NEW.crew_id IS NULL THEN
    :NEW.crew_id := crew_seq.NEXTVAL;
  END IF;
END;
/

-- ==========================================
-- 2. MAPPING TABLES (Many-to-Many)
-- ==========================================

-- MOVIE_GENRE
CREATE TABLE MOVIE_GENRE (
    movie_id NUMBER,
    genre_id NUMBER,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_mg_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_mg_genre FOREIGN KEY (genre_id) REFERENCES GENRE(genre_id) ON DELETE CASCADE
);

-- MOVIE_AWARD
CREATE TABLE MOVIE_AWARD (
    movie_id NUMBER,
    award_id NUMBER,
    PRIMARY KEY (movie_id, award_id),
    CONSTRAINT fk_ma_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_ma_award FOREIGN KEY (award_id) REFERENCES AWARD(award_id) ON DELETE CASCADE
);

-- MOVIE_WARNING
CREATE TABLE MOVIE_WARNING (
    movie_id NUMBER,
    warning_id NUMBER,
    PRIMARY KEY (movie_id, warning_id),
    CONSTRAINT fk_mw_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_mw_warning FOREIGN KEY (warning_id) REFERENCES CONTENT_WARNING(warning_id) ON DELETE CASCADE
);

-- AVAILABLE_ON
CREATE TABLE AVAILABLE_ON (
    movie_id NUMBER,
    platform_id NUMBER,
    PRIMARY KEY (movie_id, platform_id),
    CONSTRAINT fk_ao_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_ao_platform FOREIGN KEY (platform_id) REFERENCES STREAMING_PLATFORM(platform_id) ON DELETE CASCADE
);

-- SHOWN_IN
CREATE TABLE SHOWN_IN (
    movie_id NUMBER,
    theater_id NUMBER,
    PRIMARY KEY (movie_id, theater_id),
    CONSTRAINT fk_si_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_si_theater FOREIGN KEY (theater_id) REFERENCES THEATER(theater_id) ON DELETE CASCADE
);

-- FEATURES
CREATE TABLE FEATURES (
    movie_id NUMBER,
    cast_id NUMBER,
    character_name VARCHAR2(100),
    PRIMARY KEY (movie_id, cast_id),
    CONSTRAINT fk_feat_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_feat_cast FOREIGN KEY (cast_id) REFERENCES CAST_MEMBER(cast_id) ON DELETE CASCADE
);

-- TEAM
CREATE TABLE TEAM (
    movie_id NUMBER,
    crew_id NUMBER,
    PRIMARY KEY (movie_id, crew_id),
    CONSTRAINT fk_team_movie FOREIGN KEY (movie_id) REFERENCES MOVIE(movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_team_crew FOREIGN KEY (crew_id) REFERENCES CREW_MEMBER(crew_id) ON DELETE CASCADE
);

COMMIT;
