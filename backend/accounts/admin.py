from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # What shows in the user list page
    list_display  = ('email', 'role', 'is_staff', 'is_active')
    list_filter   = ('role', 'is_staff', 'is_active')
    search_fields = ('email',)
    ordering      = ('email',)

    # Fieldsets for the EDIT user page
    fieldsets = (
        (None,            {'fields': ('email', 'password')}),
        ('Role',          {'fields': ('role',)}),
        ('Permissions',   {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Fieldsets for the ADD user page
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_staff', 'is_active'),
        }),
    )