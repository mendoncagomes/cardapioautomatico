from django.urls import path

from . import views

app_name = 'cart'

urlpatterns = [
    path('', views.detail, name='detail'),
    path('atualizar/<int:index>/', views.update, name='update'),
    path('remover/<int:index>/', views.remove, name='remove'),
]
