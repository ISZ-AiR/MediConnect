from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "/",
    response_description="API health check status",
    summary="Check API Health",
    description="Verify if the API is operational. Returns a status and a message indicating the API's health.",
)
async def health_check():
    """
    Perform a health check for the API.

    This endpoint verifies if the API is operational.
    - **Returns**: A JSON object with a status of 'ok' and a message confirming that the API is running.
    """
    return {"status": "ok", "message": "API is running"}
