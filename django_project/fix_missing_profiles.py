
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smart_slist.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

users = User.objects.all()
print(f"Checking {users.count()} users for missing profiles...")

count = 0
for user in users:
    if not hasattr(user, 'profile'):
        print(f"Creating profile for {user.username}...")
        UserProfile.objects.create(user=user)
        count += 1
    else:
        print(f"User {user.username} already has a profile.")

print(f"Done. Created {count} missing profiles.")
