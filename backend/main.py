from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

from database import Base, engine
import models
from routers import tom_tat, auth, bac_si
from seed import seed_du_lieu

Base.metadata.create_all(bind=engine)
seed_du_lieu()

app = FastAPI(title="He thong ho tro kham benh")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tom_tat.router)
app.include_router(auth.router)
app.include_router(bac_si.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
