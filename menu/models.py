from django.db import models
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=80)
    slug = models.SlugField(unique=True)
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'categoria'
        verbose_name_plural = 'categorias'

    def __str__(self):
        return self.name


class Product(models.Model):
    KIND_CHOICES = [
        ('combo', 'Combo'),
        ('promotion', 'Promocao'),
        ('burger', 'Lanche'),
        ('custom', 'Personalizavel'),
    ]

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    promotional_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    image = models.CharField(max_length=255, blank=True)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default='burger')
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category__order', 'order', 'name']
        verbose_name = 'produto'
        verbose_name_plural = 'produtos'

    def __str__(self):
        return self.name

    @property
    def current_price(self):
        return self.promotional_price if self.promotional_price is not None else self.price

    def get_absolute_url(self):
        return reverse('menu:product_detail', kwargs={'slug': self.slug})


class ProductOption(models.Model):
    OPTION_TYPES = [
        ('drink', 'Bebida'),
        ('side', 'Acompanhamento'),
        ('bread', 'Pao'),
        ('meat', 'Carne'),
        ('cheese', 'Queijo'),
        ('extra', 'Adicional'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='options', null=True, blank=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    option_type = models.CharField(max_length=20, choices=OPTION_TYPES)
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['option_type', 'order', 'name']
        verbose_name = 'opcao de produto'
        verbose_name_plural = 'opcoes de produto'

    def __str__(self):
        return f'{self.name} ({self.get_option_type_display()})'

# Create your models here.
