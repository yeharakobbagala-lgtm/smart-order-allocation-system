from sqlalchemy import text

from app.database.connection import engine


with engine.begin() as connection:
    connection.execute(
        text("DELETE FROM users WHERE email = :email"),
        {"email": "admin@example.com"},
    )

print("Old test admin deleted.")
