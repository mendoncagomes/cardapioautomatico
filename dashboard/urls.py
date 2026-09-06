from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('login/', views.StaffLoginView.as_view(), name='login'),
    path('sair/', views.StaffLogoutView.as_view(), name='logout'),
    path('', views.panel, name='panel'),
    path('pedidos/', views.orders_board, name='orders'),
    path('pedidos.json', views.orders_json, name='orders_json'),
    path('pedidos/<int:pk>/', views.order_detail, name='order_detail'),
    path('pedido/<int:pk>/status/', views.update_status, name='update_status'),
    path('pedido/<int:pk>/cancelar/', views.cancel_order, name='cancel_order'),
    path('produtos/', views.products, name='products'),
    path('produtos/novo/', views.product_create, name='product_create'),
    path('produtos/<int:pk>/editar/', views.product_edit, name='product_edit'),
    path('produtos/<int:pk>/disponibilidade/', views.product_toggle_available, name='product_toggle_available'),
    path('produtos/<int:pk>/desativar/', views.product_deactivate, name='product_deactivate'),
    path('categorias/', views.categories, name='categories'),
    path('categorias/nova/', views.category_create, name='category_create'),
    path('categorias/<int:pk>/editar/', views.category_edit, name='category_edit'),
    path('opcoes/', views.options, name='options'),
    path('opcoes/nova/', views.option_create, name='option_create'),
    path('opcoes/<int:pk>/editar/', views.option_edit, name='option_edit'),
    path('opcoes/<int:pk>/disponibilidade/', views.option_toggle_available, name='option_toggle_available'),
    path('funcionarios/', views.staff_users, name='staff_users'),
    path('funcionarios/novo/', views.staff_create, name='staff_create'),
    path('relatorios/', views.reports, name='reports'),
]
