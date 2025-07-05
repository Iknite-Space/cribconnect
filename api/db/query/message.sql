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

-- name: UpdateUserProfile :one
UPDATE users
SET
    fname = COALESCE($2, fname),
    lname = COALESCE($3, lname),
    phoneno = COALESCE($4, phoneno),
    birthdate = COALESCE($5, birthdate),
    bio = COALESCE($6, bio),
    preferences = COALESCE($7, preferences),
    profile_picture = COALESCE($8, profile_picture)
WHERE user_id = $1
RETURNING *;