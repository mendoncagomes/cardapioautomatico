from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.panel, name='panel'),
    path('pedido/<int:pk>/status/', views.update_status, name='update_status'),
]
