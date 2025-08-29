package messages

import (
	"context"
	"errors"
	"database/sql"
	"github.com/Iknite-Space/c4-project-boilerplate/api/db/repo"
)

var ErrMessageNotFound = errors.New("message not found")

type MessageService struct {
	messageRepository		MessageRepository
}

func NewMessageService(mr MessageRepository) *MessageService{
		service := &MessageService{
		messageRepository: mr,
	}
	return service
}

func (ms *MessageService) CreateMessage(ctx context.Context, req CreateMessageRequest) (repo.Message, error) {
	params := repo.CreateMessageParams{
		ThreadID: req.ThreadID,
		SenderID: req.SenderID,
		ReceiverID: req.ReceiverID,
		MessageText: req.MessageText,
		
	}
	message, err := ms.messageRepository.CreateMessage(ctx, params)
	return message, err
}

func (ms *MessageService) GetThreadMessages(ctx context.Context, thread_id string) ([]repo.Message, error) {
	message, err := ms.messageRepository.GetMessagesByThread(ctx, thread_id)
	return message, err
}

func (ms *MessageService) DeleteMessage(ctx context.Context, message_id string) error {
	

	err := ms.messageRepository.DeleteMessage(ctx, message_id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrMessageNotFound
		}
		return err // some other internal DB error
	}
	return nil

}