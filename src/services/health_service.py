
from fastapi import Depends
from typing import Annotated

class HealthService:
    def __init__(self):
        pass
    async def health_check(self) -> dict:
        return {"status": "healthy"}
    
  
    

HealthServiceDep = Annotated[HealthService, Depends(HealthService)]