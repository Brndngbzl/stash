package api

import (
	"context"
)

func (r *queryResolver) FindUsers(ctx context.Context) ([]*User, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) FindUser(ctx context.Context, id string) (*User, error) {
	return nil, ErrNotImplemented
}

func (r *queryResolver) FindSharingConfig(ctx context.Context) (*SharingConfig, error) {
	return nil, ErrNotImplemented
}
