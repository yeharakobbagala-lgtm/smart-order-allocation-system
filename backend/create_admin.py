from getpass import getpass

from app.database.session import SessionLocal
from app.services.admin_service import create_admin_user


def main():
    print("=== Create Initial Admin ===")

    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip()

    password = getpass("Admin password: ")
    confirm_password = getpass("Confirm password: ")

    if password != confirm_password:
        print("Passwords do not match.")
        return

    if not name or not email or not password:
        print("All fields are required.")
        return

    db = SessionLocal()

    try:
        admin = create_admin_user(
            db=db,
            name=name,
            email=email,
            password=password,
        )

        print("\nAdmin created successfully.")
        print("ID:", admin.id)
        print("Email:", admin.email)
        print("Role:", admin.role)

    except ValueError as error:
        print("\nAdmin creation failed.")
        print("Error:", error)

    finally:
        db.close()


if __name__ == "__main__":
    main()