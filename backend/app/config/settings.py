import os
from pathlib import Path

from dotenv import load_dotenv


# backend/app/config/settings.py → parents[2] == backend root
BACKEND_ROOT = Path(__file__).resolve().parents[2]
# Monorepo root when running from a full checkout; may be filesystem root
# when Railway Root Directory is set to /backend.
REPO_ROOT = Path(__file__).resolve().parents[3]


def _is_filesystem_root(path: Path) -> bool:
    """True when path is / on Linux or a drive root on Windows."""
    resolved = path.resolve()
    return resolved.parent == resolved


def _load_local_env_files() -> None:
    """
    Load optional local .env files for development.

    Never override variables already present in the process environment
    (Railway / hosting injects DATABASE_URL, JWT_*, CORS_ORIGINS at runtime).

    Never load /.env — when Root Directory is /backend, parents[3] is
    the filesystem root and must not be treated as the project root.
    """
    candidates: list[Path] = [BACKEND_ROOT / ".env"]
    if not _is_filesystem_root(REPO_ROOT):
        candidates.append(REPO_ROOT / ".env")

    for env_path in candidates:
        if env_path.is_file():
            load_dotenv(env_path, override=False)


_load_local_env_files()


def _env(name: str, default: str = "") -> str:
    value = os.getenv(name)
    if value is None:
        return default
    return value


class Settings:
    """Plain settings object — reads process environment (and optional .env)."""

    def __init__(self) -> None:
        # Supabase / PostgreSQL connection string (single source of truth)
        self.DATABASE_URL: str = _env("DATABASE_URL")

        self.JWT_SECRET: str = _env("JWT_SECRET")
        self.JWT_ALGORITHM: str = _env("JWT_ALGORITHM", "HS256")
        self.JWT_EXPIRE_MINUTES: int = int(_env("JWT_EXPIRE_MINUTES", "60"))

        self.CORS_ORIGINS: str = _env(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        )


settings = Settings()
