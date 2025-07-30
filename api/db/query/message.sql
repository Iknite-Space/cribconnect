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
FROM users;

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
