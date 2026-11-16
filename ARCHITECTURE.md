# Arquitetura da conversão

## Camada compartilhada

`packages/shared/src/data.js` contém o catálogo demonstrativo e `domain.js` concentra cálculos e transições puras. Nenhum desses arquivos importa APIs de navegador ou de React Native.

## React web

O roteamento cobre o fluxo do cliente e o painel. `StoreProvider` mantém o estado global e persiste cada alteração no navegador. Os antigos manipuladores JavaScript de preço, quantidade e atualização de pedidos foram convertidos em estado declarativo e eventos React.

## React Native

O aplicativo Expo usa componentes nativos (`View`, `Text`, `Pressable`, `Image`, `ScrollView`) e não reaproveita HTML ou CSS. O catálogo, carrinho e painel consomem as mesmas regras de negócio do pacote compartilhado. O estado operacional é persistido com `AsyncStorage`.
