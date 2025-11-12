from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.diagnosis_model import Diagnosis
from models.patient_model import Patient
from models.visit_model import Visit
from models.disease_model import Disease
from schemas.diagnosis_schema import DiagnosisBase, DiagnosisModel, DiagnosisCreate, DiagnosisUpdate


router = APIRouter(
    prefix="/diagnosis",
    tags=["Diagnosis"]
)

@router.post("/", response_model=DiagnosisModel)
async def create_diagnosis(diagnosis: DiagnosisCreate, db: AsyncSession = Depends(get_db)):

    """
    Create a new diagnosis entry.
    """

    patient = (await db.execute(select(Patient).where(Patient.patient_id == diagnosis.patient_id))).scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visit = (await db.execute(select(Visit).where(Visit.visit_id == diagnosis.visit_id))).scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    disease = (await db.execute(select(Disease).where(Disease.disease_id == diagnosis.disease_id))).scalar_one_or_none()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    new_diagnosis = Diagnosis(patient_id=diagnosis.patient_id, visit_id=diagnosis.visit_id,
                              disease_id=diagnosis.disease_id, diagnosis_date=diagnosis.diagnosis_date,
                              doctor_notes=diagnosis.doctor_notes)

    db.add(new_diagnosis)
    await db.commit()
    await db.refresh(new_diagnosis)

    return new_diagnosis


@router.get("/", response_model=list[DiagnosisModel])
async def get_all_diagnoses(db: AsyncSession = Depends(get_db)):

    """
    Return all diagnoses from the database.
    """

    result = await db.execute(select(Diagnosis))
    diagnoses = result.scalars().all()

    return diagnoses


@router.get("/{diagnosis_id}", response_model=DiagnosisModel)
async def get_diagnosis_by_id(diagnosis_id: int, db: AsyncSession = Depends(get_db)):

    """
    Get diagnosis details by id.
    """

    result = await db.execute(select(Diagnosis).where(Diagnosis.diagnosis_id==diagnosis_id))
    diagnosis = result.scalar_one_or_none()

    if not diagnosis:
        raise HTTPException(status_code=400, detail="Diagnosis not found")

    return diagnosis


@router.put("/{diagnosis_id}", response_model=DiagnosisModel)
async def update_diagnosis(diagnosis_id: int, new_diagnosis: DiagnosisUpdate, db: AsyncSession = Depends(get_db)):

    """
    Update an existing diagnosis record.
    """

    result = await db.execute(select(Diagnosis).where(Diagnosis.diagnosis_id == diagnosis_id))
    diagnosis = result.scalar_one_or_none()

    if not diagnosis:
        raise HTTPException(status_code=400, detail="Diagnosis not found")

    # Relation update
    if new_diagnosis.patient_id is not None:
        patient = (await db.execute(
            select(Patient).where(Patient.patient_id == new_diagnosis.patient_id))).scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        diagnosis.patient = patient

    if new_diagnosis.visit_id is not None:
        visit = (await db.execute(select(Visit).where(Visit.visit_id == new_diagnosis.visit_id))).scalar_one_or_none()
        if not visit:
            raise HTTPException(status_code=404, detail="Visit not found")
        diagnosis.visit = visit

    if new_diagnosis.disease_id is not None:
        disease = ((await db.execute(select(Disease).where(Disease.disease_id == new_diagnosis.disease_id)))
                   .scalar_one_or_none())
        if not disease:
            raise HTTPException(status_code=404, detail="Disease not found")
        diagnosis.disease = disease

    update_data = new_diagnosis.model_dump(exclude_unset=True, exclude={"patient_id", "visit_id", "disease_id"})
    for key, value in update_data.items():
        setattr(diagnosis, key, value)

    await db.commit()
    await db.refresh(diagnosis)

    return diagnosis


@router.delete("/{diagnosis_id}")
async def delete_diagnosis(diagnosis_id: int, db: AsyncSession = Depends(get_db)):

    """
    Delete an existing diagnosis record.
    """

    result = await db.execute(select(Diagnosis).where(Diagnosis.diagnosis_id == diagnosis_id))
    diagnosis = result.scalar_one_or_none()

    if not diagnosis:
        raise HTTPException(status_code=400, detail="Disease not found")

    await db.delete(diagnosis)
    await db.commit()

    return {"status": "Diagnosis deleted successfully", "id": diagnosis_id}