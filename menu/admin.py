from django.contrib import admin

from .models import Category, Product, ProductOption


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'active', 'order')
    list_editable = ('active', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


class ProductOptionInline(admin.TabularInline):
    model = ProductOption
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'kind', 'price', 'promotional_price', 'active', 'order')
    list_filter = ('category', 'kind', 'active')
    list_editable = ('price', 'promotional_price', 'active', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    inlines = [ProductOptionInline]


@admin.register(ProductOption)
class ProductOptionAdmin(admin.ModelAdmin):
    list_display = ('name', 'option_type', 'product', 'price', 'active', 'order')
    list_filter = ('option_type', 'active')
    list_editable = ('price', 'active', 'order')
    search_fields = ('name',)

# Register your models here.
