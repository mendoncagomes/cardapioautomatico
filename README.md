# QuickMenu MVP

MVP de cardapio automatico e autoatendimento mobile-first feito com Django.

## Rodar localmente

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

## Rotas principais

- `/` - escolha entre comer aqui ou levar para viagem.
- `/cardapio/` - categorias e produtos.
- `/carrinho/` - carrinho em sessao.
- `/pedido/finalizar/` - revisao e confirmacao do pedido.
- `/painel/` - painel simples para cozinha/balcao.
- `/admin/` - Django Admin para CRUD de catalogo e pedidos.

## O que ja esta implementado

- Apps `core`, `menu`, `cart`, `orders` e `dashboard`.
- Models para categorias, produtos, opcoes, pedidos e itens.
- Carrinho persistente por sessao.
- Recalculo de precos no backend ao confirmar pedido.
- Dados de demonstracao com hamburgueres, combos, bebidas e acompanhamentos.
- Interface responsiva, simples e mobile-first.
