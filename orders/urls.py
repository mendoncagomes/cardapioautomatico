from django.urls import path

from . import views

app_name = 'orders'

urlpatterns = [
    path('finalizar/', views.checkout, name='checkout'),
    path('confirmar/', views.confirm, name='confirm'),
    path('confirmado/<int:pk>/', views.confirmed, name='confirmed'),
]
