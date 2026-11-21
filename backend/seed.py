from database import SessionLocal
from models import User
from auth import bam_mat_khau

BAC_SI_EMAIL = "admin@hospital.com"
BAC_SI_MAT_KHAU = "admin123"


def seed_du_lieu():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == BAC_SI_EMAIL).first():
            db.add(User(
                id=0,
                email=BAC_SI_EMAIL,
                mat_khau_da_bam=bam_mat_khau(BAC_SI_MAT_KHAU),
                ho_ten="Bác sĩ Demo",
                vai_tro="bac_si",
            ))
            db.commit()
    finally:
        db.close()