from django.contrib import admin

from .models import Order, OrderItem, OrderItemOption


class OrderItemOptionInline(admin.TabularInline):
    model = OrderItemOption
    extra = 0
    readonly_fields = ('name', 'price')


class OrderItemInline(admin.StackedInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'product_snapshot', 'quantity', 'unit_price', 'total')
    inlines = []


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_type', 'table_number', 'status', 'total', 'created_at')
    list_filter = ('status', 'order_type', 'created_at')
    list_editable = ('status',)
    readonly_fields = ('created_at', 'total')
    search_fields = ('id', 'table_number')
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_name', 'quantity', 'unit_price', 'total')
    readonly_fields = ('order', 'product_name', 'product_snapshot', 'quantity', 'unit_price', 'total')


@admin.register(OrderItemOption)
class OrderItemOptionAdmin(admin.ModelAdmin):
    list_display = ('order_item', 'name', 'price')

# Register your models here.
