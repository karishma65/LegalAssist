from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
#This file only creates a connection
DB_USER = "postgres"
DB_PASSWORD = "admin" #our postgres password
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "case_intake_db"   # we have give our db name 
DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()
