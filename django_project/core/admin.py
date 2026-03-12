from django.contrib import admin
from .models import Bill, BillItem, Note, NoteItem

class BillItemInline(admin.TabularInline):
    model = BillItem
    extra = 0

class BillAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'user', 'total_amount', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('customer_name', 'user__username')
    inlines = [BillItemInline]

class NoteItemInline(admin.TabularInline):
    model = NoteItem
    extra = 0

class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'total_amount', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('title', 'user__username')
    inlines = [NoteItemInline]

admin.site.register(Bill, BillAdmin)
admin.site.register(Note, NoteAdmin)

# Custom User Admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

# Unregister original User admin
admin.site.unregister(User)

class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'username', 'email', 'date_joined', 'last_login', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)
    actions = ['reset_passwords_to_default']

    @admin.action(description="Reset password to '1234'")
    def reset_passwords_to_default(self, request, queryset):
        for user in queryset:
            user.set_password('1234')
            user.save()
        self.message_user(request, f"Successfully reset passwords for {queryset.count()} user(s) to '1234'.")

admin.site.register(User, UserAdmin)
