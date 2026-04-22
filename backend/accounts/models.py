from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# ─── Custom Manager ───────────────────────────────────────────────
class UserManager(BaseUserManager):
    """
    Custom manager because we removed 'username' and use 'email' instead.
    Without this, createsuperuser and create_user will break.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)          # lowercases the domain part
        extra_fields.setdefault('is_active', True)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)                  # hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


# ─── Custom User Model ─────────────────────────────────────────────
class User(AbstractUser):
    username = None                                  # ← Remove username field
    email = models.EmailField(unique=True)           # ← Email is now the login field

    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('provider', 'Provider'),
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='customer'
    )

    USERNAME_FIELD = 'email'                         # ← Login with email
    REQUIRED_FIELDS = []                             # ← No extra required fields

    objects = UserManager()                          # ← Attach custom manager

    def __str__(self):
        return self.email