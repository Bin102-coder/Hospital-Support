from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mat_khau_da_bam = Column(String(255), nullable=False)
    ho_ten = Column(String(255), nullable=False)
    vai_tro = Column(String(20), nullable=False)

    ho_so_kham = relationship("HoSoKham", back_populates="benh_nhan")


class HoSoKham(Base):
    __tablename__ = "ho_so_kham"

    id = Column(Integer, primary_key=True, index=True)
    benh_nhan_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    noi_dung_tom_tat = Column(JSON, nullable=True)
    loi_benh_nhan = Column(Text, nullable=False)
    canh_bao_khan_cap = Column(Boolean, default=False)
    trang_thai = Column(String(20), default="moi")
    tao_luc = Column(DateTime, default=datetime.utcnow)

    benh_nhan = relationship("User", back_populates="ho_so_kham")
