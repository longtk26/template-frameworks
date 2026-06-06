from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.routers import all_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    for router in all_router:
        app.include_router(router)
    yield


app = FastAPI(lifespan=lifespan)
