
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_slist.settings')
django.setup()

from django.contrib.auth.models import User

username = 'shefimon'
password = 'shefimon123'
email = 'shefimon@example.com'

try:
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists.")
        user = User.objects.get(username=username)
        # Update password to ensure it uses the new plain text hasher
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Updated password and permissions for '{username}'.")
    else:
        User.objects.create_superuser(username, email, password)
        print(f"Superuser '{username}' created successfully.")
except Exception as e:
    print(f"Error creating user: {e}")
