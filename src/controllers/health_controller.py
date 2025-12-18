from fastapi import APIRouter
from src.services import (
    HealthServiceDep
)

health_router = APIRouter()


@health_router.get("/health")
async def health_check(health_service: HealthServiceDep):
    return await health_service.health_check()

