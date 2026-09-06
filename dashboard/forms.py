from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group, User

from menu.models import Category, Product, ProductOption


class MoneyInput(forms.NumberInput):
    input_type = 'number'


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'name',
            'slug',
            'category',
            'kind',
            'description',
            'ingredients',
            'price',
            'promotional_price',
            'uploaded_image',
            'active',
            'available',
            'featured',
            'order',
        ]
        widgets = {
            'price': MoneyInput(attrs={'min': '0', 'step': '0.01'}),
            'promotional_price': MoneyInput(attrs={'min': '0', 'step': '0.01'}),
            'order': forms.NumberInput(attrs={'min': '0'}),
            'description': forms.Textarea(attrs={'rows': 3}),
            'ingredients': forms.Textarea(attrs={'rows': 3}),
        }

    def clean_price(self):
        price = self.cleaned_data['price']
        if price < 0:
            raise forms.ValidationError('O preco nao pode ser negativo.')
        return price

    def clean_promotional_price(self):
        price = self.cleaned_data.get('promotional_price')
        if price is not None and price < 0:
            raise forms.ValidationError('O preco promocional nao pode ser negativo.')
        return price


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'slug', 'active', 'order']
        widgets = {'order': forms.NumberInput(attrs={'min': '0'})}


class ProductOptionForm(forms.ModelForm):
    class Meta:
        model = ProductOption
        fields = ['product', 'name', 'option_type', 'price', 'image', 'active', 'available', 'order']
        widgets = {
            'price': MoneyInput(attrs={'min': '0', 'step': '0.01'}),
            'order': forms.NumberInput(attrs={'min': '0'}),
        }

    def clean_price(self):
        price = self.cleaned_data['price']
        if price < 0:
            raise forms.ValidationError('O preco nao pode ser negativo.')
        return price


class StaffForm(UserCreationForm):
    role = forms.ChoiceField(choices=[('Funcionarios', 'Funcionario'), ('Administradores', 'Administrador')])

    class Meta:
        model = User
        fields = ['first_name', 'username', 'email', 'role', 'is_active']

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            group, _ = Group.objects.get_or_create(name=self.cleaned_data['role'])
            user.groups.add(group)
        return user
