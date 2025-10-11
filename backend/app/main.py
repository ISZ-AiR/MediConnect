from api import api_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

app = FastAPI(
    title="Medi Connect API",
    description="API",
    version="1.0.0",
    contact={
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configure CORS
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE",
                   "PATCH"],  # Restrict to necessary methods
    # Restrict to necessary headers
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url='/docs')

app.include_router(api_router)
