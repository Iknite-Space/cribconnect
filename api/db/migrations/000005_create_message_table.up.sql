-- Threads
CREATE TABLE "thread" (
  "thread_id"        VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(36),
  "initiator_id"     VARCHAR(36) NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
  "target_user_id"   VARCHAR(36) NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
  "topic"            TEXT,
  "is_unlocked"      BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"       TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_thread_initiator ON thread(initiator_id);
CREATE INDEX idx_thread_target    ON thread(target_user_id);

CREATE TYPE message_status AS ENUM ('sent', 'read', 'deleted', 'failed');

-- Messages
CREATE TABLE "message" (
  "message_id"     VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(36),
  "thread_id"      VARCHAR(36) NOT NULL REFERENCES "thread"("thread_id") ON DELETE CASCADE,
  "sender_id"      VARCHAR(36) NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
  "receiver_id"    VARCHAR(36) NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
  "message_text"   TEXT NOT NULL,
  "is_deleted"     BOOLEAN NOT NULL DEFAULT FALSE,
  "status"         "message_status" NOT NULL DEFAULT 'sent',
  "sent_at"        TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_message_thread ON message(thread_id);
CREATE INDEX idx_message_sender ON message(sender_id);