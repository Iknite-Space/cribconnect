CREATE TABLE matches (
    "match_id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(36),
    "user1_id" VARCHAR(36) REFERENCES "users"("user_id") ON DELETE CASCADE,
    "user2_id" VARCHAR(36) REFERENCES "users"("user_id") ON DELETE CASCADE,
    "match_score" INT CHECK ("match_score" >= 0 AND "match_score" <= 100), -- Compatibility percentage
    "status" VARCHAR(50) DEFAULT 'pending', -- Pending, accepted, declined
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);