
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_slist.settings')
django.setup()

from django.contrib.auth.models import User

username = 'user'
password = '123'
email = 'user@example.com'

try:
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists.")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"Updated password for '{username}' to '{password}'.")
    else:
        User.objects.create_user(username, email, password)
        print(f"User '{username}' created successfully.")
except Exception as e:
    print(f"Error creating user: {e}")
