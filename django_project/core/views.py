from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from .models import Bill, Note, BillItem, NoteItem, UserProfile, ChitFund, ChitTransaction
from .forms import ChitFundForm, ChitTransactionForm
from django.contrib import messages

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'home.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

@login_required
def dashboard(request):
    # Data Isolation
    bills = Bill.objects.filter(user=request.user).order_by('-created_at')
    notes = Note.objects.filter(user=request.user).order_by('-created_at')
    
    # Stats Calculation
    total_bills_count = bills.count()
    total_notes_count = notes.count()
    total_revenue = sum(bill.total_amount for bill in bills)
    
    # Recent (Last 5)
    recent_bills = bills[:5]
    recent_notes = notes[:5]
    
    context = {
        'bills': recent_bills, # Only showing 5 recent
        'notes': recent_notes,
        'total_bills_count': total_bills_count,
        'total_notes_count': total_notes_count,
        'total_revenue': total_revenue,
    }
    return render(request, 'dashboard.html', context)

@login_required
def bill_list(request):
    bills = Bill.objects.filter(user=request.user).order_by('-created_at')
    
    # Search & Filter
    search_query = request.GET.get('search', '')
    if search_query:
        bills = bills.filter(customer_name__icontains=search_query) # Or ID if needed
        
    return render(request, 'bill_list.html', {'bills': bills, 'search_query': search_query})

@login_required
def note_list(request):
    # Sort by Pinned First, then Newest
    notes = Note.objects.filter(user=request.user).order_by('-is_pinned', '-created_at')
    return render(request, 'note_list.html', {'notes': notes})

@login_required
def create_bill(request):
    if request.method == 'POST':
        customer_name = request.POST.get('customer_name')
        product_names = request.POST.getlist('product_name[]')
        quantities = request.POST.getlist('quantity[]')
        rates = request.POST.getlist('rate[]')

        # Calculate total
        total = 0
        items_data = []
        for i in range(len(product_names)):
            if product_names[i]:
                qty = int(quantities[i])
                rate = float(rates[i])
                amount = qty * rate
                total += amount
                items_data.append({
                    'product_name': product_names[i],
                    'quantity': qty,
                    'rate': rate,
                    'amount': amount
                })

        # Create Bill
        bill = Bill.objects.create(
            user=request.user,
            customer_name=customer_name,
            total_amount=total
        )

        # Create Items
        for item in items_data:
            BillItem.objects.create(bill=bill, **item)

        return redirect('bill_detail', pk=bill.id)

    return render(request, 'bill_form.html')

@login_required
def bill_detail(request, pk):
    # Strict Data Isolation: User can only see their own bills
    bill = get_object_or_404(Bill, pk=pk, user=request.user)
    return render(request, 'bill_detail.html', {'bill': bill})

@login_required
def edit_bill(request, pk):
    bill = get_object_or_404(Bill, pk=pk, user=request.user)
    if request.method == 'POST':
        # Simple implementation: Delete all items and recreate
        # In prod, you might want to diff updates
        bill.customer_name = request.POST.get('customer_name')
        
        product_names = request.POST.getlist('product_name[]')
        quantities = request.POST.getlist('quantity[]')
        rates = request.POST.getlist('rate[]')
        
        bill.items.all().delete()
        
        total = 0
        for i in range(len(product_names)):
            if product_names[i]:
                qty = int(quantities[i])
                rate = float(rates[i])
                amount = qty * rate
                total += amount
                BillItem.objects.create(
                    bill=bill,
                    product_name=product_names[i],
                    quantity=qty,
                    rate=rate,
                    amount=amount
                )
        
        bill.total_amount = total
        bill.save()
        return redirect('bill_detail', pk=bill.id)
        
    return render(request, 'bill_form.html', {'bill': bill})

@login_required
def delete_bill(request, pk):
    bill = get_object_or_404(Bill, pk=pk, user=request.user)
    if request.method == 'POST':
        bill.delete()
        return redirect('dashboard')
    return render(request, 'confirm_delete.html', {'object': bill, 'type': 'Bill'})

@login_required
def create_note(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        items = request.POST.getlist('item_name[]')
        prices = request.POST.getlist('price[]')

        total = 0
        note_items = []
        for i in range(len(items)):
            if items[i]:
                price = float(prices[i])
                total += price
                note_items.append({'item_name': items[i], 'price': price})
        
        note = Note.objects.create(user=request.user, title=title, total_amount=total)
        
        for item in note_items:
            NoteItem.objects.create(note=note, **item)
            
        return redirect('note_detail', pk=note.id)

    return render(request, 'note_form.html')

@login_required
def note_detail(request, pk):
    note = get_object_or_404(Note, pk=pk, user=request.user)
    return render(request, 'note_detail.html', {'note': note})

@login_required
def edit_note(request, pk):
    note = get_object_or_404(Note, pk=pk, user=request.user)
    if request.method == 'POST':
        note.title = request.POST.get('title')
        items = request.POST.getlist('item_name[]')
        prices = request.POST.getlist('price[]')
        
        note.items.all().delete()
        
        total = 0
        for i in range(len(items)):
            if items[i]:
                price = float(prices[i])
                total += price
                NoteItem.objects.create(note=note, item_name=items[i], price=price)
        
        note.total_amount = total
        note.save()
        return redirect('note_detail', pk=note.id)

    return render(request, 'note_form.html', {'note': note})

@login_required
def delete_note(request, pk):
    note = get_object_or_404(Note, pk=pk, user=request.user)
    if request.method == 'POST':
        note.delete()
        return redirect('dashboard')
    return render(request, 'confirm_delete.html', {'object': note, 'type': 'Note'})

# --- Admin Power Features ---

from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def admin_privacy_dashboard(request):
    users = User.objects.all().order_by('-date_joined')
    recent_users = users[:5]
    total_users = users.count()
    return render(request, 'admin/privacy_dashboard.html', {
        'users': users,
        'recent_users': recent_users,
        'total_users': total_users
    })

@staff_member_required
def impersonate_user(request, user_id):
    user_to_impersonate = get_object_or_404(User, id=user_id)
    # Log the admin in as the user without password
    login(request, user_to_impersonate, backend='django.contrib.auth.backends.ModelBackend')
    return redirect('dashboard')

@login_required
def profile(request):
    if request.method == 'POST':
        user = request.user
        profile = user.profile
        
        # Update User Fields
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.save()
        
        # Update Profile Fields
        age_val = request.POST.get('age', '')
        if age_val and age_val.isdigit():
            profile.age = int(age_val)
        else:
            profile.age = None
            
        profile.save()
        messages.success(request, 'Profile updated successfully!')
        return redirect('profile')
        
    return render(request, 'profile.html')


# -- Chit Fund Views --

@login_required
def chit_list(request):
    # Strict Data Isolation
    chits = ChitFund.objects.filter(user=request.user).order_by('-created_at')
    
    # Auto-update status for all chits
    for chit in chits:
        chit.check_status()
        
    return render(request, 'chit_list.html', {'chits': chits})

@login_required
def create_chit(request):
    if request.method == 'POST':
        form = ChitFundForm(request.POST)
        if form.is_valid():
            chit = form.save(commit=False)
            chit.user = request.user
            chit.save()
            messages.success(request, 'Chit Fund created successfully!')
            return redirect('chit_list')
    else:
        form = ChitFundForm()
    return render(request, 'chit_form.html', {'form': form})

@login_required
def chit_detail(request, pk):
    chit = get_object_or_404(ChitFund, pk=pk, user=request.user)
    chit.check_status() # Ensure status is up to date
    transactions = chit.transactions.all().order_by('-date')
    return render(request, 'chit_detail.html', {'chit': chit, 'transactions': transactions})

@login_required
def add_transaction(request, pk):
    chit = get_object_or_404(ChitFund, pk=pk, user=request.user)
    
    if request.method == 'POST':
        form = ChitTransactionForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            
            # Validation Logic
            if transaction.transaction_type == 'WITHDRAW':
                if not transaction.description:
                     messages.error(request, 'Description is required for withdrawals.')
                     return render(request, 'transaction_form.html', {'form': form, 'chit': chit})
                
                if transaction.amount > chit.current_balance:
                    messages.error(request, 'Withdrawal amount cannot exceed current balance.')
                    return render(request, 'transaction_form.html', {'form': form, 'chit': chit})
                
                if transaction.amount < 0:
                     messages.error(request, 'Negative values are not allowed.')
                     return render(request, 'transaction_form.html', {'form': form, 'chit': chit})

                chit.current_balance -= transaction.amount
            else: # ADD
                if transaction.amount < 0:
                     messages.error(request, 'Negative values are not allowed.')
                     return render(request, 'transaction_form.html', {'form': form, 'chit': chit})
                chit.current_balance += transaction.amount
            
            transaction.chit_fund = chit
            transaction.save()
            chit.save()
            chit.check_status()
            
            messages.success(request, 'Transaction added successfully!')
            return redirect('chit_detail', pk=pk)
    else:
        form = ChitTransactionForm()
    
    return render(request, 'transaction_form.html', {'form': form, 'chit': chit})


