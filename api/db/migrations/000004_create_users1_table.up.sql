DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS thread;
DROP TABLE IF EXISTS users;

-- Getting started
-- Users table
CREATE TABLE "users" (
  "user_id" VARCHAR(36) NOT NULL PRIMARY KEY,
  "fname" VARCHAR(255),
  "lname" VARCHAR(255),
  "birthdate" DATE ,
  "phoneno" VARCHAR(255) UNIQUE CONSTRAINT phoneno_format CHECK (phoneno ~* '^\+237(6(70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89)|65[0-9]|69[1-9]|62[0-3])\d{6}$'),
  "email" VARCHAR(255) NOT NULL  UNIQUE CONSTRAINT email_format CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  --"password" TEXT NOT NULL, -- Hashed
  "bio" TEXT,
  "habbits" JSONB, --'{}'::JSONB, -- Stores habbits (e.g., smoking, pets)
  "profile_picture" VARCHAR(255) , -- URL to profile image
  "created_at" TIMESTAMP DEFAULT now()
);