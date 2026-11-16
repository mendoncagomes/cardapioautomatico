# QuickMenu — React + React Native

Conversão completa da interface do projeto Django original para um monorepo moderno. A lógica de catálogo, adicionais, preços, carrinho, pedidos e status fica em `packages/shared` e é usada pelos dois aplicativos.

## Estrutura

```text
apps/
  web/       React + Vite (cliente e painel administrativo)
  mobile/    React Native + Expo (cliente e painel mobile)
packages/
  shared/    dados iniciais e regras de negócio compartilhadas
```

## Executar a versão web

```bash
npm install
npm run web
```

Acesse `http://localhost:5173`. Para conferir a versão de produção:

```bash
npm run web:build
npm run preview --workspace @quickmenu/web
```

## Executar a versão mobile

```bash
npm install
npm run mobile
```

Abra o QR Code no Expo Go ou pressione `a` para Android. O app usa Expo SDK 54.

## Login do painel

- Usuário: `admin`
- Senha: `admin12345`

## Funcionalidades convertidas

- escolha entre consumo no local ou viagem e identificação da mesa;
- catálogo por categorias com todas as imagens e produtos originais;
- detalhes, bebida e acompanhamento, montagem personalizada e preço dinâmico;
- carrinho com quantidades, remoção, totais, checkout e confirmação;
- painel com visão geral, kanban de pedidos, avanço de status e cancelamento;
- gestão de produtos, categorias, opções, equipe e relatórios na versão web;
- visão geral, pedidos, disponibilidade de produtos e relatórios no app mobile;
- persistência local (`localStorage` na web e `AsyncStorage` no mobile).

## Integração com backend

Esta entrega converte a camada originalmente escrita em HTML, CSS e JavaScript. Ela funciona de forma independente com dados locais e mantém as regras de negócio compartilhadas. Para produção com múltiplos dispositivos, substitua as ações do `store.jsx` e do estado do `App.jsx` por chamadas à API escolhida (Django REST, Node, Supabase etc.).
