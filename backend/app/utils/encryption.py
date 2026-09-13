"""Symmetric encryption for stored OAuth credentials (encryption at rest).

The GitHub access token from the "Connect GitHub" integration must live in
the database, but never in plaintext. We encrypt it with Fernet (AES-128-CBC
+ HMAC) using a key derived from the application's SECRET_KEY.

Trade-off to understand: because the key derives from SECRET_KEY, rotating
SECRET_KEY invalidates stored tokens. That is acceptable (and arguably
desirable) — affected users simply reconnect GitHub from Settings.
"""
import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


def _fernet() -> Fernet:
    # Derive a stable 32-byte key from SECRET_KEY and shape it for Fernet
    key = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def encrypt_secret(plaintext: str) -> str:
    """Encrypt a secret for storage in the database. Returns a token string."""
    return _fernet().encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_secret(encrypted: str) -> str:
    """
    Decrypt a stored secret.

    Raises cryptography.fernet.InvalidToken if the value was encrypted with
    a different key (e.g. SECRET_KEY was rotated) — callers should treat
    that as "authorization expired" and ask the user to reconnect.
    """
    try:
        return _fernet().decrypt(encrypted.encode("utf-8")).decode("utf-8")
    except InvalidToken as e:
        raise InvalidToken(
            "Stored credential was encrypted with a different key. Reconnect required."
        ) from e
