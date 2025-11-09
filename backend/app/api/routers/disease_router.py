from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.disease_model import Disease
from schemas.disease_schema import DiseaseBase, DiseaseModel
from re import match


router = APIRouter(
    prefix="/disease",
    tags=["Disease"]
)

@router.post("/", response_model=DiseaseModel)
async def create_disease(disease: DiseaseBase, db: AsyncSession = Depends(get_db)):

    """
    Create a new disease entry.
    """

    pattern = "^[A-Z]\d{2}(\.[A-Z0-9]{1,2})?$"
    if not match(pattern, disease.icd10_code):
        raise HTTPException(status_code=400, detail="Code format invalid")

    result = await db.execute(select(Disease).where(Disease.icd10_code==disease.icd10_code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="The disease already exists")

    new_disease = Disease(icd10_code = disease.icd10_code, name = disease.name, description = disease.description)

    db.add(new_disease)
    await db.commit()
    await db.refresh(new_disease)

    return new_disease


@router.get("/", response_model=list[DiseaseModel])
async def get_all_diseases(db: AsyncSession = Depends(get_db)):

    """
    Return all disease from the database.
    """

    result = await db.execute(select(Disease))
    diseases = result.scalars().all()

    return diseases


@router.get("/{disease_id}", response_model=DiseaseModel)
async def get_disease_by_id(disease_id: int, db: AsyncSession = Depends(get_db)):

    """
    Get disease details by id.
    """

    result = await db.execute(select(Disease).where(Disease.disease_id==disease_id))
    disease = result.scalar_one_or_none()

    if not disease:
        raise HTTPException(status_code=400, detail="Disease not found")

    return disease


@router.put("/{disease_id}", response_model=DiseaseModel)
async def update_disease(disease_id: int, new_disease: DiseaseBase, db: AsyncSession = Depends(get_db)):

    """
    Update an existing disease record.
    """

    result = await db.execute(select(Disease).where(Disease.disease_id == disease_id))
    disease = result.scalar_one_or_none()

    if not disease:
        raise HTTPException(status_code=400, detail="Disease not found")

    disease.icd10_code = new_disease.icd10_code
    disease.name = new_disease.name
    disease.description = new_disease.description

    await db.commit()
    await db.refresh(disease)

    return disease


@router.delete("/{disease_id}")
async def delete_disease(disease_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Disease).where(Disease.disease_id == disease_id))
    disease = result.scalar_one_or_none()

    if not disease:
        raise HTTPException(status_code=400, detail="Disease not found")

    await db.delete(disease)
    await db.commit()

    return {"status": "Disease deleted successfully", "id": disease_id}