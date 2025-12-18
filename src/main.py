from fastapi import FastAPI
from src.routers import all_router
from contextlib import asynccontextmanager
from src.libs.database import DBSessionManager

def init_routers():
    for router in all_router:
        app.include_router(router)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_routers()
    db_manager = DBSessionManager()
    db_manager.create_db_and_tables()
    yield
    

app = FastAPI(lifespan=lifespan)





