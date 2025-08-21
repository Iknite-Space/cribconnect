-- -- name: CreateMessage :one
-- INSERT INTO message (thread, sender, content)
-- VALUES ($1, $2, $3)
-- RETURNING *;

-- -- name: GetMessageByID :one
-- SELECT * FROM message
-- WHERE id = $1;

-- -- name: GetMessagesByThread :many
-- SELECT * FROM message
-- WHERE thread = $1
-- ORDER BY created_at DESC;

-- -- name: DeleteMessage :exec
-- DELETE FROM message
-- WHERE id = $1;


-- name: RegisterUser :one
INSERT INTO users (user_id,email)
VALUES ($1, $2)
RETURNING user_id,email;

-- name: GetUserByFirebaseId :one
SELECT user_id, email FROM users
WHERE user_id = $1
LIMIT 1;

-- name: GetAllUsers :many
SELECT 
  COALESCE(user_id, '') AS user_id,
  COALESCE(fname, '') AS fname,
  COALESCE(lname, '') AS lname,
  COALESCE(birthdate, '2000-01-01') AS birthdate,
  COALESCE(phoneno, '') AS phoneno,
  COALESCE(email, '') AS email,
  COALESCE(bio, '') AS bio,
  COALESCE(habbits, '{}'::jsonb) AS habbits,
  COALESCE(profile_picture, '') AS profile_picture,
  COALESCE(created_at, now()) AS created_at
FROM users
WHERE user_id != $1;

-- name: GetUserById :one
SELECT 
  COALESCE(user_id, '') AS user_id,
  COALESCE(fname, '') AS fname,
  COALESCE(lname, '') AS lname,
  COALESCE(birthdate, '2000-01-01') AS birthdate,
  COALESCE(phoneno, '') AS phoneno,
  COALESCE(email, '') AS email,
  COALESCE(bio, '') AS bio,
  COALESCE(habbits, '{}'::jsonb) AS habbits,
  COALESCE(profile_picture, '') AS profile_picture,
  COALESCE(created_at, now()) AS created_at
FROM users
WHERE user_id = $1
LIMIT 1;


-- name: UpdateUserProfile :one
UPDATE users
SET
    fname = COALESCE($2, fname),
    lname = COALESCE($3, lname),
    email = COALESCE($4, email),
    phoneno = COALESCE($5, phoneno),
    birthdate = COALESCE($6, birthdate),
    bio = COALESCE($7, bio),
    habbits = COALESCE($8, habbits),
    profile_picture = COALESCE($9, profile_picture)
WHERE user_id = $1
RETURNING *;

-- name: GetUserHabbits :one
SELECT habbits
FROM users
WHERE user_id = $1;

-- name: FilterUsersByPreferences :many
SELECT 
 COALESCE(user_id, '') AS user_id,
  COALESCE(fname, '') AS fname,
  COALESCE(lname, '') AS lname,
  COALESCE(birthdate, '2000-01-01') AS birthdate,
  COALESCE(phoneno, '') AS phoneno,
  COALESCE(email, '') AS email,
  COALESCE(bio, '') AS bio,
  COALESCE(habbits, '{}'::jsonb) AS habbits,
  COALESCE(profile_picture, '') AS profile_picture,
  COALESCE(created_at, now()) AS created_at
  FROM users
WHERE habbits @> $1::jsonb;

-- name: CreateThread :one
INSERT INTO thread (initiator_id, target_user_id, topic)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetThreadBetweenUsers :one
SELECT 
   thread_id,
   initiator_id,
   target_user_id,
   topic,
   is_unlocked,
   created_at
FROM thread
WHERE (initiator_id = $1 AND target_user_id = $2);

-- name: GetThreadById :many
SELECT * 
FROM thread
WHERE initiator_id = $1;

-- name: GetNamesOnThread :many
SELECT u.user_id, u.fname, u.lname, t.is_unlocked
FROM thread t
JOIN users u ON t.target_user_id = u.user_id
WHERE t.thread_id = $1;

-- name: CreateMessage :one
INSERT INTO message (thread_id, sender_id, receiver_id, message_text)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreatePayment :one
INSERT INTO payment (payer_id, target_user_id, thread_id, amount, external_reference)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetPaymentIdByThreadId :one
SELECT payment_id FROM payment
WHERE thread_id = $1;

-- name: UpdatePaymentStatus :one
UPDATE payment
SET status = $2,
    phone = $3,
    reference = $4,
    external_reference = $5
WHERE payment_id = $1
RETURNING *;

