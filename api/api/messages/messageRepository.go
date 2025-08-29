package messages

import (
	"context"

	"github.com/Iknite-Space/c4-project-boilerplate/api/db/repo"
)

type MessageRepository interface {
	CreateMessage(ctx context.Context, arg repo.CreateMessageParams) (repo.Message, error)
	CreateThread(ctx context.Context, arg repo.CreateThreadParams) (repo.Thread, error)
	GetNamesOnThread(ctx context.Context, threadID string) ([]repo.GetNamesOnThreadRow, error)
	GetThreadBetweenUsers(ctx context.Context, arg repo.GetThreadBetweenUsersParams) (repo.Thread, error)
	GetThreadById(ctx context.Context, initiatorID string) ([]repo.Thread, error)
	GetMessagesByThread(ctx context.Context, threadID string) ([]repo.Message, error)
	GetMessageByID(ctx context.Context, messageID string) (repo.Message, error)
	DeleteMessage(ctx context.Context, messageID string) error
}