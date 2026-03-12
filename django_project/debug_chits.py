import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_project.settings')
django.setup()

from core.models import ChitFund, User

print("--- Debugging Chit Funds ---")
users = User.objects.all()
print(f"Total Users: {users.count()}")
for u in users:
    chits = ChitFund.objects.filter(user=u)
    print(f"User: {u.username} (ID: {u.id}) has {chits.count()} chits.")
    for c in chits:
        print(f"  - Chit ID: {c.id}, Name: {c.name}, Status: {c.status}")

print("----------------------------")
