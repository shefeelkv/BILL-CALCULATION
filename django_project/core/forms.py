from django import forms
from .models import ChitFund, ChitTransaction
from django.utils import timezone

class ChitFundForm(forms.ModelForm):
    class Meta:
        model = ChitFund
        fields = ['name', 'target_amount', 'target_date'] # Removed description
        widgets = {
            'target_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. New Car Fund'}),
            'target_amount': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Target Amount'}),
        }

    def clean_target_date(self):
        target_date = self.cleaned_data.get('target_date')
        if target_date and target_date < timezone.now().date():
            raise forms.ValidationError("Target date cannot be in the past.")
        return target_date

class ChitTransactionForm(forms.ModelForm):
    class Meta:
        model = ChitTransaction
        fields = ['transaction_type', 'amount', 'description']
        widgets = {
            'transaction_type': forms.Select(attrs={'class': 'form-select', 'id': 'id_transaction_type'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Amount'}),
            'description': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Reason for withdrawal', 'id': 'id_description'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['description'].required = False # Handled in view logic based on type
