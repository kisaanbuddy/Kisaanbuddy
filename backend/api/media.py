"""Public delivery for explicitly published owner-uploaded images and decoupled storage assets."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from db import models
from db.session import get_db
from services.storage import storage_service

router = APIRouter()


@router.get("/{media_id}", include_in_schema=False)
def get_media(media_id: int, db: Session = Depends(get_db)):
    asset = db.query(models.MediaAsset).filter(
        models.MediaAsset.id == media_id,
        models.MediaAsset.is_published.is_(True),
    ).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Media asset not found.")

    content = None
    if asset.storage_path:
        content = storage_service.get_file(asset.storage_path)

    if content is None and asset.data:
        content = asset.data

    if content is None:
        raise HTTPException(status_code=404, detail="Media content unavailable.")

    return Response(
        content=content,
        media_type=asset.content_type,
        headers={"Cache-Control": "public, max-age=86400"}
    )


@router.get("/file/{filename}", include_in_schema=False)
def get_media_file(filename: str):
    storage_path = f"local://{filename}"
    content = storage_service.get_file(storage_path)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found.")
    
    # Infer content type from extension
    content_type = "image/jpeg"
    if filename.endswith(".png"):
        content_type = "image/png"
    elif filename.endswith(".webp"):
        content_type = "image/webp"
    elif filename.endswith(".gif"):
        content_type = "image/gif"

    return Response(
        content=content,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=86400"}
    )
