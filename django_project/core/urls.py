from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', views.signup, name='signup'),
    
    # Bill URLs
    path('bills/', views.bill_list, name='bill_list'),
    path('bill/new/', views.create_bill, name='create_bill'),
    path('bill/<int:pk>/', views.bill_detail, name='bill_detail'),
    path('bill/<int:pk>/edit/', views.edit_bill, name='edit_bill'),
    path('bill/<int:pk>/delete/', views.delete_bill, name='delete_bill'),

    # Note URLs
    path('notes/', views.note_list, name='note_list'),
    path('note/new/', views.create_note, name='create_note'),
    path('note/<int:pk>/', views.note_detail, name='note_detail'),
    path('note/<int:pk>/edit/', views.edit_note, name='edit_note'),
    path('note/<int:pk>/delete/', views.delete_note, name='delete_note'),

    # Admin Power URLs
    path('portal/privacy/', views.admin_privacy_dashboard, name='admin_privacy'),
    path('portal/impersonate/<int:user_id>/', views.impersonate_user, name='impersonate_user'),
    
    # Profile
    # Profile
    path('profile/', views.profile, name='profile'),
    

    # Chit Fund URLs
    path('chits/', views.chit_list, name='chit_list'),
    path('chits/new/', views.create_chit, name='create_chit'),
    path('chits/<int:pk>/', views.chit_detail, name='chit_detail'),
    path('chits/<int:pk>/transaction/', views.add_transaction, name='add_transaction'),
]
