from fastapi import APIRouter, Depends, status
from typing import Annotated
from src.modules.users.usecases import (
    CreateUserUsecaseDep,
    GetUserUsecaseDep
)
from src.modules.users.presenter.dtos import (
    CreateUserRequestDto,
    CreateUserResponseDto,
    GetUserResponseDto
)


user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.post("", response_model=CreateUserResponseDto, status_code=status.HTTP_201_CREATED)
async def create_user(user: CreateUserRequestDto, usecase:CreateUserUsecaseDep) -> CreateUserResponseDto:
    return await usecase.execute(user)


@user_router.get("/{user_id}", response_model=GetUserResponseDto)
async def get_user(user_id: str, usecase:GetUserUsecaseDep ):
    return await usecase.execute(user_id)
