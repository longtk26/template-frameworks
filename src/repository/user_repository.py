from src.libs.repository import BaseRepository
from src.models import UserModel
from src.libs.database import SessionDep
from typing import Annotated
from fastapi import Depends

class UserRepository(BaseRepository):
    _model = UserModel

    def __init__(self, session: SessionDep):
        super().__init__(session)

UserRepoDep = Annotated[UserRepository, Depends(UserRepository)]