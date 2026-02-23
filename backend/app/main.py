from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.habits import router as habits_router

app = FastAPI(title="HabitFlow API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(habits_router)
