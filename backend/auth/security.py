from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import os
#  Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# -------------------------
# PASSWORD FUNCTIONS
# -------------------------

def hash_password(password: str) -> str:
    # bcrypt max length = 72 bytes (important!)
    return pwd_context.hash(password[:72])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)


# -------------------------
# JWT TOKEN CREATION
# -------------------------

def create_access_token(*, user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "user_id": user_id,
        "role": role,
        "exp": expire
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
