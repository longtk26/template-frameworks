from fastapi import Depends
from typing import Annotated
from src.modules.users.ports.output import IUserRepository
from src.modules.shared.domain.entities import UserEntity
from src.modules.shared.infrastructure.models import UserModel
from src.libs.database.session import SessionDep


class UserRepository(IUserRepository):
    def __init__(self, session: SessionDep):
        self.session = session

    def create(self, user: UserEntity) -> UserEntity:
        model = self.__to_model(user)
        self.session.add(model)
        self.session.flush()
        return self.__to_entity(model)

    def find_by_id(self, user_id: str) -> UserEntity | None:
        model = self.session.get(UserModel, user_id)
        if model is None:
            return None
        return self.__to_entity(model)

    def __to_entity(self, model: UserModel) -> UserEntity:
        return UserEntity(id=model.id, username=model.username, email=model.email, is_active=model.is_active)

    def __to_model(self, entity: UserEntity) -> UserModel:
        return UserModel(id=entity.id, username=entity.username, email=entity.email, is_active=entity.is_active)

IUserRepoDep = Annotated[IUserRepository, Depends(UserRepository)]
