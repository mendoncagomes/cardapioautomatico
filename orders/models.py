from django.db import models


class Order(models.Model):
    ORDER_TYPES = [
        ('eat_in', 'Comer aqui'),
        ('takeaway', 'Levar para viagem'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('confirmed', 'Confirmado'),
        ('preparing', 'Em preparo'),
        ('ready', 'Pronto'),
        ('completed', 'Finalizado'),
        ('cancelled', 'Cancelado'),
    ]

    order_type = models.CharField(max_length=20, choices=ORDER_TYPES)
    table_number = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'pedido'
        verbose_name_plural = 'pedidos'

    def __str__(self):
        return f'Pedido #{self.pk}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=120)
    product_snapshot = models.JSONField(default=dict, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = 'item do pedido'
        verbose_name_plural = 'itens do pedido'

    def __str__(self):
        return f'{self.quantity}x {self.product_name}'


class OrderItemOption(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'opcao do item'
        verbose_name_plural = 'opcoes do item'

    def __str__(self):
        return self.name

# Create your models here.
