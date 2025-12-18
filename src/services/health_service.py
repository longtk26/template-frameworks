
from fastapi import Depends
from typing import Annotated
from src.repository import UserRepoDep
from src.libs.exceptions import NotFoundException
class HealthService:
    def __init__(self, user_repo: UserRepoDep):
        self.user_repo = user_repo
    
    async def health_check(self) -> dict:
        raise NotFoundException()
        return {"status": "healthy2"}
    

HealthServiceDep = Annotated[HealthService, Depends(HealthService)]