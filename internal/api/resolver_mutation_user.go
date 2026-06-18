package api

import (
	"context"
)

func (r *mutationResolver) UserCreate(ctx context.Context, input UserCreateInput) (*User, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) UserUpdate(ctx context.Context, input UserUpdateInput) (*User, error) {
	return nil, ErrNotImplemented
}

func (r *mutationResolver) UserDelete(ctx context.Context, id string) (bool, error) {
	return false, ErrNotImplemented
}

func (r *mutationResolver) ConfigureSharing(ctx context.Context, input SharingConfigInput) (*SharingConfig, error) {
	return nil, ErrNotImplemented
}
