from django.urls import path

from . import views

app_name = 'core'

urlpatterns = [
    path('', views.start, name='start'),
    path('tipo-pedido/', views.choose_order_type, name='choose_order_type'),
    path('mesa/', views.table_number, name='table_number'),
]
