--drop table thread;
-- User Table 
CREATE TABLE "users" (
  "user_id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(36),
  "fname" VARCHAR(255) NOT NULL,
  "lname" VARCHAR(255) NOT NULL,
  "birthdate" DATE NOT NULL,
  "phoneno" VARCHAR(255) NOT NULL UNIQUE CONSTRAINT phoneno_format CHECK (phoneno ~* '^(6(70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89)|65[0-9]|69[1-9]|62[0-3])\d{6}$'),
  "email" VARCHAR(255) NOT NULL UNIQUE CONSTRAINT email_format CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  "password" TEXT NOT NULL, -- Hashed
  "bio" TEXT,
  "preferences" JSONB NOT NULL, --'{}'::JSONB, -- Stores preferences (e.g., smoking, pets)
  "profile_picture" VARCHAR(255) , -- URL to profile image
  "created_at" TIMESTAMP DEFAULT now()
);