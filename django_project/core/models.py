from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Signal to create UserProfile automatically
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Bill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bills')
    customer_name = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id} - {self.customer_name}"

class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} ({self.quantity})"

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200, default='Untitled Note')
    category = models.CharField(max_length=50, default='General')  # New Field
    is_pinned = models.BooleanField(default=False)                 # New Field
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class NoteItem(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.item_name

# Chit Fund Models
class ChitFund(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('MISSED', 'Target Missed'),
        ('LATE', 'Ahieved (Late)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chit_funds')
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    target_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def progress_percentage(self):
        if self.target_amount > 0:
            return min(int((self.current_balance / self.target_amount) * 100), 100)
        return 0
        
    def remaining_days(self):
        from django.utils import timezone
        today = timezone.now().date()
        if today > self.target_date:
            return 0
        delta = self.target_date - today
        return delta.days

    def check_status(self):
        from django.utils import timezone
        today = timezone.now().date()
        
        # Balance >= Target
        if self.current_balance >= self.target_amount:
            if today <= self.target_date:
                self.status = 'COMPLETED'
            else:
                self.status = 'LATE' # Achieved (Late)
        # Balance < Target
        elif today > self.target_date:
            self.status = 'MISSED' # Target Missed
        else:
            self.status = 'ACTIVE'
            
        self.save()

class ChitTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('ADD', 'Add Money'),
        ('WITHDRAW', 'Withdraw Money'),
    ]

    chit_fund = models.ForeignKey(ChitFund, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True, null=True) 
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"


