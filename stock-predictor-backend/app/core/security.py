"""
Security utilities including password verification and hashing stubs.
"""

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that a plain text password matches its hash."""
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """Generates a hash of a password."""
    return f"hashed_{password}"
