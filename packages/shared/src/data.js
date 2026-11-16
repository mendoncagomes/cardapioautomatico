export const categories = [
  { id: 'combos', name: 'Combos', icon: '▣' },
  { id: 'promocoes', name: 'Promoções', icon: '◇' },
  { id: 'lanches', name: 'Lanches', icon: '▤' },
  { id: 'personalizar', name: 'Personalizar pedido', icon: '＋' },
];

const product = (slug, category, name, description, price, kind = 'burger', promotionalPrice = null, available = true) => ({
  id: slug,
  slug,
  category,
  name,
  description,
  ingredients: description,
  price,
  kind,
  promotionalPrice,
  available,
  image: `${slug}.png`,
});

export const initialProducts = [
  product('combo-smash','combos','Combo Smash','Smash Clássico, batata média e refrigerante médio.',36.9,'combo'),
  product('combo-bacon','combos','Combo Bacon','Smash Bacon, batata média e refrigerante.',41.9,'combo'),
  product('combo-cheddar-duplo','combos','Combo Cheddar Duplo','Duplo Cheddar, batata média e refrigerante médio.',45.9,'combo'),
  product('combo-chicken-crispy','combos','Combo Chicken Crispy','Chicken Crispy com batata média e refrigerante.',39.9,'combo'),
  product('combo-bbq','combos','Combo BBQ','Burger BBQ, batata rústica e refrigerante.',43.9,'combo'),
  product('combo-picanha','combos','Combo Picanha','Burger Picanha, batata grande e refrigerante.',49.9,'combo'),
  product('combo-vegetariano','combos','Combo Vegetariano','Burger vegetariano, onion rings e suco.',42.9,'combo'),
  product('combo-kids','combos','Combo Kids','Mini burger, batata pequena e suco.',29.9,'combo'),
  product('combo-hot-dog','combos','Combo Hot Dog','Hot dog especial, batata pequena e refrigerante.',32.9,'combo'),
  product('combo-salada-crispy','combos','Combo Salada Crispy','Burger leve com frango crispy, salada e água.',37.9,'combo'),
  product('combo-triplo-smash','combos','Combo Triplo Smash','Triplo smash, batata grande e refrigerante grande.',55.9,'combo'),
  product('dupla-smash','promocoes','Dupla Smash','2 Smash Burgers e 1 batata grande.',59.9,'promotion',44.9),
  product('terca-do-bacon','promocoes','Terça do Bacon','Smash Bacon com desconto especial.',27.9,'promotion',22.9),
  product('combo-casal','promocoes','Combo Casal','2 burgers, 2 bebidas e 1 batata grande.',78.9,'promotion',64.9),
  product('hora-do-smash','promocoes','Hora do Smash','Smash Clássico por preço promocional.',22.9,'promotion',18.9),
  product('batata-em-dobro','promocoes','Batata em Dobro','Burger Clássico com duas batatas médias.',42.9,'promotion',34.9),
  product('festival-cheddar','promocoes','Festival Cheddar','Burger com cheddar extra e batata média.',44.9,'promotion',36.9),
  product('oferta-crispy','promocoes','Oferta Crispy','Chicken Crispy com bebida por preço reduzido.',32.9,'promotion',27.9),
  product('smash-classico','lanches','Smash Clássico','Pão brioche, carne 120g, queijo e molho da casa.',22.9),
  product('smash-bacon','lanches','Smash Bacon','Pão brioche, smash, cheddar e bacon.',27.9),
  product('duplo-cheddar','lanches','Duplo Cheddar','Duas carnes, cheddar e cebola caramelizada.',31.9),
  product('chicken-crispy','lanches','Chicken Crispy','Frango crocante, alface e molho especial.',25.9),
  product('bbq-bacon','lanches','BBQ Bacon','Carne smash, bacon, queijo prato e barbecue.',29.9),
  product('onion-cheddar','lanches','Onion Cheddar','Smash com cheddar e cebola crispy.',28.9),
  product('pepper-jack','lanches','Pepper Jack','Burger picante com queijo, jalapeño e molho apimentado.',30.9),
  product('mushroom-swiss','lanches','Mushroom Swiss','Burger com cogumelos salteados e queijo suíço.',33.9),
  product('picanha-classic','lanches','Picanha Classic','Burger de picanha, queijo prato e maionese da casa.',36.9),
  product('triplo-smash','lanches','Triplo Smash','Três carnes smash com queijo derretido.',39.9),
  product('egg-burger','lanches','Egg Burger','Smash com ovo, queijo e bacon.',31.9),
  product('salad-burger','lanches','Salad Burger','Burger com bastante salada fresca.',26.9),
  product('veggie-green','lanches','Veggie Green','Hambúrguer vegetal com queijo, salada e molho verde.',29.9),
  product('costela-smash','lanches','Costela Smash','Burger de costela com queijo e cebola caramelizada.',35.9),
  product('gorgonzola-crispy','lanches','Gorgonzola Crispy','Smash com creme de gorgonzola e cebola crispy.',34.9),
  product('frango-ranch','lanches','Frango Ranch','Frango grelhado com queijo, salada e molho ranch.',27.9),
  product('crispy-spicy','lanches','Crispy Spicy','Frango crocante com molho levemente apimentado.',28.9),
  product('mini-smash','lanches','Mini Smash','Versão menor do smash clássico com queijo.',17.9),
  product('monster-bacon','lanches','Monster Bacon','Burger alto com duas carnes, cheddar e muito bacon.',42.9),
  product('monte-seu-hamburguer','personalizar','Monte seu hambúrguer','Escolha pão, carnes, queijo e adicionais.',14.9,'custom'),
];

const option = (id, name, type, price) => ({ id, name, type, price, available: true });
export const initialOptions = [
  option('coca','Coca-Cola','drink',7), option('guarana','Guaraná','drink',7), option('fanta','Fanta','drink',7), option('sprite','Sprite','drink',7), option('agua','Água','drink',4),
  option('batata-p','Batata pequena','side',8), option('batata-m','Batata média','side',11), option('batata-g','Batata grande','side',14), option('onion-rings','Onion Rings','side',13),
  option('brioche','Brioche','bread',0), option('australiano','Australiano','bread',2), option('tradicional','Tradicional','bread',0),
  option('carne-1','1 carne','meat',0), option('carne-2','2 carnes','meat',7), option('carne-3','3 carnes','meat',14),
  option('cheddar','Cheddar','cheese',3), option('mussarela','Mussarela','cheese',3), option('sem-queijo','Sem queijo','cheese',0),
  option('bacon','Bacon','extra',5), option('cebola','Cebola caramelizada','extra',3), option('ovo','Ovo','extra',4), option('molho','Molho especial','extra',2),
];

export const initialOrders = [
  { id: 1042, type: 'eat_in', table: 7, status: 'preparing', createdAt: '12:32', items: [{ name: 'Combo Bacon', quantity: 2, options: [] }], total: 83.8 },
  { id: 1041, type: 'takeaway', status: 'confirmed', createdAt: '12:28', items: [{ name: 'Smash Clássico', quantity: 1, options: ['Coca-Cola'] }], total: 29.9 },
  { id: 1040, type: 'eat_in', table: 3, status: 'ready', createdAt: '12:21', items: [{ name: 'Combo Smash', quantity: 1, options: [] }], total: 36.9 },
  { id: 1039, type: 'takeaway', status: 'completed', createdAt: '12:12', items: [{ name: 'Dupla Smash', quantity: 1, options: [] }], total: 44.9 },
];

export const initialStaff = [
  { id: '1', name: 'Administrador', username: 'admin', role: 'Administrador' },
  { id: '2', name: 'Equipe Cozinha', username: 'cozinha', role: 'Funcionário' },
];
