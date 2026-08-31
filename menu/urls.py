from django.urls import path

from . import views

app_name = 'menu'

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('produto/<slug:slug>/', views.product_detail, name='product_detail'),
    path('personalizar/', views.custom_burger, name='custom_burger'),
]
