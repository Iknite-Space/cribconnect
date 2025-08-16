-- Payments
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

CREATE TABLE "payment" (
  "payment_id"         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(36),
  "payer_id"           VARCHAR(36) NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
  "target_user_id"     VARCHAR(36) NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
  "thread_id"          VARCHAR(36) NOT NULL REFERENCES "thread"("thread_id") ON DELETE CASCADE,
  "phone"              VARCHAR(255), 
  "amount"             NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  "status"             "payment_status" NOT NULL DEFAULT 'PENDING',
  "provider"           VARCHAR(32)        NOT NULL DEFAULT 'campay',
  "reference"          VARCHAR(36), 
  "external_reference" TEXT,
  "created_at"         TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payment_thread ON payment("thread_id");
CREATE INDEX idx_payment_status ON payment("status");