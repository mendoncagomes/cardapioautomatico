import { useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BarChart3, Check, ChefHat, ChevronLeft, ClipboardList, Coffee, LogOut, Menu, Package, Pencil, Plus, Search, ShoppingBag, ShoppingCart, SlidersHorizontal, Trash2, Users, Utensils, X } from 'lucide-react';
import { cartCount, cartTotal, categories, currentPrice, itemUnitPrice, money, nextStatus, orderTypeLabel, statusLabels } from '@quickmenu/shared';
import { useStore } from './store.jsx';

const imageUrl = (product) => `/images/products/${product.image}`;

function Brand() { return <Link className="brand" to="/cardapio"><img className="brand-logo" src="/logo-quickmenu.png" alt="QuickMenu — Peça, Escolha, Receba" /></Link>; }

function CustomerLayout({ children }) {
  const { state } = useStore();
  const count = cartCount(state.cart);
  return <><header className="app-header"><Brand/><Link className="cart-link" to="/carrinho"><ShoppingBag size={19}/> Carrinho <b>{count}</b></Link></header><main className="page">{children}</main>{count > 0 && <Link className="cart-bar" to="/carrinho"><span>{count} {count === 1 ? 'item' : 'itens'}</span><strong>{money(cartTotal(state.cart))}</strong><b>Ver pedido</b></Link>}</>;
}

function Start() {
  const { dispatch } = useStore(); const navigate = useNavigate();
  const choose = (type) => { if (type === 'eat_in') navigate('/mesa'); else { dispatch({ type: 'SERVICE', payload: { type } }); navigate('/cardapio'); } };
  return <CustomerLayout><section className="start-screen"><div><p className="eyebrow">Autoatendimento</p><h1>Como deseja receber seu pedido?</h1></div><div className="choice-grid"><button className="choice-button" onClick={() => choose('eat_in')}><Utensils/><span><strong>Comer aqui</strong><small>Informe sua mesa e envie para preparo.</small></span><b>›</b></button><button className="choice-button" onClick={() => choose('takeaway')}><ShoppingBag/><span><strong>Levar para viagem</strong><small>Monte o pedido e retire no balcão.</small></span><b>›</b></button></div><p className="secure-note">Ambiente rápido e seguro.</p><Link className="admin-entry" to="/painel/login">Entrar como administrador</Link></section></CustomerLayout>;
}

function TableNumber() {
  const [table, setTable] = useState(''); const { dispatch } = useStore(); const navigate = useNavigate();
  const submit = (event) => { event.preventDefault(); dispatch({ type: 'SERVICE', payload: { type: 'eat_in', table: Number(table) } }); navigate('/cardapio'); };
  return <CustomerLayout><section className="narrow-flow"><Link className="back-link" to="/"><ChevronLeft/> Voltar</Link><h1>Qual o número da sua mesa?</h1><form className="form-stack" onSubmit={submit}><label>Número da mesa<input type="number" min="1" value={table} onChange={(event) => setTable(event.target.value)} required autoFocus/></label><button className="primary-button">Continuar</button></form></section></CustomerLayout>;
}

function ProductCard({ product }) {
  return <article className="product-card"><div className="product-body"><div><h2>{product.name}</h2><p>{product.description}</p></div><div className="product-footer"><div>{product.promotionalPrice && <span className="old-price">{money(product.price)}</span>}<strong>{money(currentPrice(product))}</strong></div><Link className="small-button icon-button" to={product.kind === 'custom' ? '/personalizar' : `/produto/${product.slug}`} aria-label={`Abrir ${product.name}`}><Plus/></Link></div></div><Link className="product-image" to={product.kind === 'custom' ? '/personalizar' : `/produto/${product.slug}`}><img src={imageUrl(product)} alt={product.name}/></Link></article>;
}

function Catalog() {
  const { state } = useStore(); const [params, setParams] = useSearchParams(); const selected = params.get('categoria') || 'combos';
  if (!state.service) return <Navigate to="/" replace/>;
  const products = state.products.filter((product) => product.category === selected && product.available);
  return <CustomerLayout><section className="menu-head"><div><p className="eyebrow">{state.service.type === 'eat_in' ? `Mesa ${state.service.table}` : 'Pedido para viagem'}</p><h1>Cardápio</h1></div><Link className="ghost-button" to="/">Trocar</Link></section><nav className="category-tabs">{categories.map((category) => <button className={selected === category.id ? 'active' : ''} key={category.id} onClick={() => setParams({ categoria: category.id })}><span>{category.icon}</span>{category.name}</button>)}</nav><section className="product-list">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</section></CustomerLayout>;
}

function OptionGroup({ title, type, mode = 'radio', selected, onChange, options }) {
  return <fieldset><legend>{title}</legend>{options.filter((option) => option.type === type && option.available).map((option) => <label className="option-row" key={option.id}><span><input type={mode} name={type} checked={mode === 'checkbox' ? selected.includes(option.id) : selected === option.id} onChange={() => onChange(option.id)}/>{option.name}</span><b>{option.price ? `+ ${money(option.price)}` : 'Incluso'}</b></label>)}</fieldset>;
}

function ProductDetail() {
  const { slug } = useParams(); const { state, dispatch } = useStore(); const navigate = useNavigate(); const product = state.products.find((item) => item.slug === slug);
  const [drink, setDrink] = useState(''); const [side, setSide] = useState('');
  if (!product) return <Navigate to="/cardapio"/>;
  const add = () => { const options = state.options.filter((option) => [drink, side].includes(option.id)); dispatch({ type: 'ADD_CART', product, options }); navigate('/carrinho'); };
  return <CustomerLayout><section className="product-detail"><Link className="back-link overlay-back" to="/cardapio"><ChevronLeft/> Voltar</Link><div className="detail-image"><img src={imageUrl(product)} alt={product.name}/><span className="image-count">1/1</span></div><h1>{product.name}</h1><p>{product.description}</p><p className="ingredients">{product.ingredients}</p><strong className="detail-price">{money(currentPrice(product))}</strong>{product.kind === 'burger' && <div className="form-stack"><OptionGroup title="Deseja adicionar uma bebida?" type="drink" selected={drink} onChange={setDrink} options={state.options}/><OptionGroup title="Deseja adicionar um acompanhamento?" type="side" selected={side} onChange={setSide} options={state.options}/></div>}<button className="primary-button" onClick={add}>Adicionar ao pedido</button></section></CustomerLayout>;
}

function CustomBurger() {
  const { state, dispatch } = useStore(); const navigate = useNavigate(); const product = state.products.find((item) => item.kind === 'custom');
  const first = (type) => state.options.find((option) => option.type === type)?.id || '';
  const [choices, setChoices] = useState({ bread: first('bread'), meat: first('meat'), cheese: first('cheese'), extra: [] });
  const select = (type, id) => setChoices((value) => type === 'extra' ? { ...value, extra: value.extra.includes(id) ? value.extra.filter((item) => item !== id) : [...value.extra, id] } : { ...value, [type]: id });
  const selected = state.options.filter((option) => Object.values(choices).flat().includes(option.id)); const total = currentPrice(product) + selected.reduce((sum, option) => sum + option.price, 0);
  const add = () => { dispatch({ type: 'ADD_CART', product, options: selected }); navigate('/carrinho'); };
  return <CustomerLayout><section className="product-detail"><Link className="back-link" to="/cardapio"><ChevronLeft/> Cardápio</Link><h1>Monte seu hambúrguer</h1><p>Escolha os itens e acompanhe o preço antes de adicionar.</p><strong className="detail-price">{money(total)}</strong><div className="form-stack"><OptionGroup title="Tipo de pão" type="bread" selected={choices.bread} onChange={(id) => select('bread', id)} options={state.options}/><OptionGroup title="Quantidade de carne" type="meat" selected={choices.meat} onChange={(id) => select('meat', id)} options={state.options}/><OptionGroup title="Queijo" type="cheese" selected={choices.cheese} onChange={(id) => select('cheese', id)} options={state.options}/><OptionGroup title="Adicionais" type="extra" mode="checkbox" selected={choices.extra} onChange={(id) => select('extra', id)} options={state.options}/></div><button className="primary-button" onClick={add}>Adicionar ao pedido</button></section></CustomerLayout>;
}

function Cart() {
  const { state, dispatch } = useStore();
  return <CustomerLayout><section className="cart-page"><Link className="back-link" to="/cardapio"><ChevronLeft/> Continuar comprando</Link><h1>Seu pedido</h1>{state.cart.length === 0 ? <div className="empty-state"><ShoppingCart/><h2>Seu carrinho está vazio</h2><Link className="primary-button" to="/cardapio">Ver cardápio</Link></div> : <><div className="cart-list">{state.cart.map((item, index) => <article className="cart-item" key={item.signature}><div className="cart-thumb"><img src={imageUrl(item.product)} alt=""/></div><div><h2>{item.product.name}</h2>{item.options.length > 0 && <p>{item.options.map((option) => option.name).join(', ')}</p>}<strong>{money(itemUnitPrice(item) * item.quantity)}</strong></div><div className="quantity-form"><button onClick={() => dispatch({ type: 'QUANTITY', index, quantity: item.quantity - 1 })}>−</button><b>{item.quantity}</b><button onClick={() => dispatch({ type: 'QUANTITY', index, quantity: item.quantity + 1 })}>+</button><button className="remove" onClick={() => dispatch({ type: 'REMOVE_CART', index })}><Trash2 size={18}/></button></div></article>)}</div><div className="total-box"><span>Total</span><strong>{money(cartTotal(state.cart))}</strong></div><Link className="primary-button" to="/checkout">Revisar e finalizar</Link></>}</section></CustomerLayout>;
}

function Checkout() {
  const { state, dispatch } = useStore(); const navigate = useNavigate();
  if (!state.cart.length) return <Navigate to="/cardapio"/>;
  const confirm = () => { const id = Math.max(...state.orders.map((order) => order.id), 1042) + 1; dispatch({ type: 'CONFIRM_ORDER' }); navigate(`/confirmado/${id}`); };
  return <CustomerLayout><section className="narrow-flow"><Link className="back-link" to="/carrinho"><ChevronLeft/> Voltar</Link><p className="eyebrow">Última etapa</p><h1>Revise seu pedido</h1><div className="summary-box"><p><span>Atendimento</span><strong>{state.service.type === 'eat_in' ? `Mesa ${state.service.table}` : 'Para viagem'}</strong></p>{state.cart.map((item) => <p key={item.signature}><span>{item.quantity}× {item.product.name}</span><strong>{money(itemUnitPrice(item) * item.quantity)}</strong></p>)}<div className="total-line"><span>Total</span><strong>{money(cartTotal(state.cart))}</strong></div></div><button className="primary-button" onClick={confirm}>Confirmar pedido</button></section></CustomerLayout>;
}

function Confirmed() { const { id } = useParams(); return <CustomerLayout><section className="narrow-flow success-screen"><div className="success-mark"><Check/></div><p className="eyebrow">Pedido recebido</p><h1>Seu pedido #{id} foi confirmado!</h1><p>Acompanhe o chamado no balcão. Já enviamos tudo para a cozinha.</p><Link className="primary-button" to="/">Fazer novo pedido</Link></section></CustomerLayout>; }

function Login() {
  const { dispatch } = useStore(); const navigate = useNavigate(); const [error, setError] = useState('');
  const submit = (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); if (data.get('username') === 'admin' && data.get('password') === 'admin12345') { dispatch({ type: 'LOGIN' }); navigate('/painel'); } else setError('Usuário ou senha inválidos.'); };
  return <main className="login-page"><form className="login-card panel-form" onSubmit={submit}><Brand/><p className="panel-eyebrow">Área restrita</p><h1>Acessar painel</h1>{error && <p className="message error">{error}</p>}<label>Usuário<input name="username" defaultValue="admin"/></label><label>Senha<input name="password" type="password" defaultValue="admin12345"/></label><button className="primary-panel-button">Entrar</button><Link to="/">Voltar ao cardápio</Link></form></main>;
}

const panelLinks = [
  ['/painel', BarChart3, 'Visão geral'], ['/painel/pedidos', ClipboardList, 'Pedidos'], ['/painel/produtos', Package, 'Produtos'], ['/painel/categorias', Menu, 'Categorias'], ['/painel/opcoes', SlidersHorizontal, 'Opções'], ['/painel/relatorios', BarChart3, 'Relatórios'], ['/painel/equipe', Users, 'Equipe'],
];
function AdminLayout({ title, eyebrow = 'QuickMenu', action, children }) {
  const { state, dispatch } = useStore(); if (!state.admin) return <Navigate to="/painel/login" replace/>;
  return <div className="panel-shell"><aside className="panel-sidebar"><Brand/><nav className="panel-nav">{panelLinks.map(([to, Icon, label]) => <NavLink key={to} to={to} end={to === '/painel'}><Icon size={18}/>{label}</NavLink>)}</nav><div className="panel-sidebar-footer"><Link className="panel-link" to="/"><Coffee size={18}/> Ver cardápio</Link><button className="panel-link danger" onClick={() => dispatch({ type: 'LOGOUT' })}><LogOut size={18}/> Sair</button></div></aside><main className="panel-main"><header className="panel-topbar"><div><p className="panel-eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</header>{children}</main></div>;
}
function StatusPill({ status }) { return <span className={`status-pill status-${status}`}>{statusLabels[status]}</span>; }
function Stats({ orders }) { const revenue = orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0); return <section className="stats-grid"><div className="stat-card"><span>Pedidos hoje</span><strong>{orders.length}</strong></div><div className="stat-card"><span>Em preparo</span><strong>{orders.filter((o) => o.status === 'preparing').length}</strong></div><div className="stat-card"><span>Prontos</span><strong>{orders.filter((o) => o.status === 'ready').length}</strong></div><div className="stat-card"><span>Faturamento</span><strong>{money(revenue)}</strong></div></section>; }

function Dashboard() {
  const { state } = useStore(); const best = useMemo(() => state.orders.flatMap((order) => order.items).reduce((map, item) => map.set(item.name, (map.get(item.name) || 0) + item.quantity), new Map()), [state.orders]);
  return <AdminLayout title="Visão geral" eyebrow="Operação em tempo real"><Stats orders={state.orders}/><section className="panel-grid two-columns"><div className="panel-card"><div className="panel-card-head"><h2>Pedidos recentes</h2><Link to="/painel/pedidos">Ver todos</Link></div>{state.orders.slice(0,5).map((order) => <Link className="compact-row" to="/painel/pedidos" key={order.id}><span><b>#{order.id} · {orderTypeLabel(order)}</b><small>{order.createdAt}</small></span><span><StatusPill status={order.status}/><b>{money(order.total)}</b></span></Link>)}</div><div className="panel-card"><h2>Mais vendidos</h2>{[...best.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, amount], index) => <p className="compact-row" key={name}><span>{index + 1}. {name}</span><strong>{amount} un.</strong></p>)}</div></section></AdminLayout>;
}

function OrdersBoard() {
  const { state, dispatch } = useStore(); const [filter, setFilter] = useState('open'); const statuses = ['pending','confirmed','preparing','ready'];
  const visible = state.orders.filter((order) => filter === 'all' || (filter === 'open' && !['completed','cancelled'].includes(order.status)) || order.type === filter || order.status === filter);
  return <AdminLayout title="Pedidos" action={<div className="filter-actions"><button onClick={() => setFilter('open')}>Abertos</button><button onClick={() => setFilter('eat_in')}>Local</button><button onClick={() => setFilter('takeaway')}>Viagem</button><button onClick={() => setFilter('all')}>Todos</button></div>}><section className="kanban">{statuses.map((status) => <div className="kanban-column" key={status}><h2>{statusLabels[status]} <span>{visible.filter((order) => order.status === status).length}</span></h2>{visible.filter((order) => order.status === status).map((order) => <article className="order-ticket" key={order.id}><div className="order-ticket-main"><span className="ticket-number">#{order.id} · {order.createdAt}</span><strong>{orderTypeLabel(order)}</strong></div><div className="ticket-items">{order.items.map((item, index) => <p key={index}>{item.quantity}× {item.name}<small>{item.options.join(', ')}</small></p>)}</div><div className="order-actions"><b>{money(order.total)}</b>{nextStatus[status] && <button className="small-action" onClick={() => dispatch({ type: 'ORDER_STATUS', id: order.id })}>Avançar</button>}<button className="text-danger" onClick={() => dispatch({ type: 'ORDER_STATUS', id: order.id, status: 'cancelled' })}>Cancelar</button></div></article>)}</div>)}</section></AdminLayout>;
}

function ProductForm({ product, onClose }) {
  const { dispatch } = useStore(); const [form, setForm] = useState(product || { id: '', slug: '', name: '', category: 'lanches', description: '', price: '', kind: 'burger', image: 'smash-classico.png', available: true });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event) => { event.preventDefault(); const id = form.id || form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); dispatch({ type: 'SAVE_PRODUCT', product: { ...form, id, slug: id, price: Number(form.price), promotionalPrice: form.promotionalPrice ? Number(form.promotionalPrice) : null } }); onClose(); };
  return <div className="modal-backdrop"><form className="modal-card panel-form grid-form" onSubmit={save}><button type="button" className="modal-close" onClick={onClose}><X/></button><h2 className="span-2">{product ? 'Editar produto' : 'Novo produto'}</h2><label>Nome<input value={form.name} onChange={(e) => update('name', e.target.value)} required/></label><label>Categoria<select value={form.category} onChange={(e) => update('category', e.target.value)}>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label className="span-2">Descrição<textarea value={form.description} onChange={(e) => update('description', e.target.value)} required/></label><label>Preço<input type="number" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} required/></label><label>Preço promocional<input type="number" step="0.01" value={form.promotionalPrice || ''} onChange={(e) => update('promotionalPrice', e.target.value)}/></label><button className="primary-panel-button span-2">Salvar produto</button></form></div>;
}

function Products() {
  const { state, dispatch } = useStore(); const [query, setQuery] = useState(''); const [editing, setEditing] = useState(undefined); const filtered = state.products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  return <AdminLayout title="Produtos" action={<button className="primary-panel-button" onClick={() => setEditing(null)}><Plus/> Novo produto</button>}><div className="filter-bar"><Search/><input placeholder="Buscar produto" value={query} onChange={(e) => setQuery(e.target.value)}/></div><div className="panel-card table-card"><div className="responsive-table"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><span className="table-product"><img src={imageUrl(product)} alt=""/><b>{product.name}</b></span></td><td>{categories.find((c) => c.id === product.category)?.name}</td><td>{money(currentPrice(product))}</td><td><StatusPill status={product.available ? 'ready' : 'cancelled'}/></td><td className="table-actions"><button className="small-link" onClick={() => setEditing(product)}><Pencil size={16}/> Editar</button><button className="small-link" onClick={() => dispatch({ type: 'TOGGLE_PRODUCT', id: product.id })}>{product.available ? 'Pausar' : 'Ativar'}</button></td></tr>)}</tbody></table></div></div>{editing !== undefined && <ProductForm product={editing} onClose={() => setEditing(undefined)}/>}</AdminLayout>;
}

function Categories() { const { state } = useStore(); return <AdminLayout title="Categorias"><div className="panel-grid two-columns">{categories.map((category, index) => <article className="panel-card" key={category.id}><p className="panel-eyebrow">Ordem {index+1}</p><h2>{category.icon} {category.name}</h2><p>{state.products.filter((product) => product.category === category.id).length} produtos cadastrados</p></article>)}</div></AdminLayout>; }

function Options() {
  const { state, dispatch } = useStore(); const [form, setForm] = useState(null);
  const save = (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); dispatch({ type: 'SAVE_OPTION', option: { id: crypto.randomUUID(), name: data.get('name'), type: data.get('type'), price: Number(data.get('price')), available: true } }); setForm(null); };
  return <AdminLayout title="Opções e adicionais" action={<button className="primary-panel-button" onClick={() => setForm({})}><Plus/> Nova opção</button>}><div className="panel-card table-card"><div className="responsive-table"><table><thead><tr><th>Nome</th><th>Tipo</th><th>Preço</th><th>Status</th><th></th></tr></thead><tbody>{state.options.map((option) => <tr key={option.id}><td><b>{option.name}</b></td><td>{option.type}</td><td>{money(option.price)}</td><td>{option.available ? 'Disponível' : 'Pausado'}</td><td><button className="small-link" onClick={() => dispatch({ type: 'TOGGLE_OPTION', id: option.id })}>{option.available ? 'Pausar' : 'Ativar'}</button></td></tr>)}</tbody></table></div></div>{form && <div className="modal-backdrop"><form className="modal-card panel-form" onSubmit={save}><button type="button" className="modal-close" onClick={() => setForm(null)}><X/></button><h2>Nova opção</h2><label>Nome<input name="name" required/></label><label>Tipo<select name="type"><option value="drink">Bebida</option><option value="side">Acompanhamento</option><option value="extra">Adicional</option><option value="bread">Pão</option><option value="meat">Carne</option><option value="cheese">Queijo</option></select></label><label>Preço<input name="price" type="number" step="0.01" required/></label><button className="primary-panel-button">Salvar</button></form></div>}</AdminLayout>;
}

function Reports() { const { state } = useStore(); const completed = state.orders.filter((order) => order.status !== 'cancelled'); const revenue = completed.reduce((sum,o) => sum+o.total,0); return <AdminLayout title="Relatórios"><Stats orders={state.orders}/><section className="panel-grid two-columns"><div className="panel-card"><h2>Indicadores do mês</h2><p className="compact-row"><span>Ticket médio</span><strong>{money(revenue / (completed.length || 1))}</strong></p><p className="compact-row"><span>Pedidos no salão</span><strong>{completed.filter((o) => o.type === 'eat_in').length}</strong></p><p className="compact-row"><span>Pedidos para viagem</span><strong>{completed.filter((o) => o.type === 'takeaway').length}</strong></p></div><div className="panel-card"><h2>Receita por pedido</h2><div className="bars">{completed.map((order) => <div className="bar-row" key={order.id}><span>#{order.id}</span><i style={{width: `${Math.min(100, order.total)}%`}}/><b>{money(order.total)}</b></div>)}</div></div></section></AdminLayout>; }

function Staff() { const { state, dispatch } = useStore(); const [open, setOpen] = useState(false); const submit = (e) => { e.preventDefault(); const data = new FormData(e.currentTarget); dispatch({ type: 'ADD_STAFF', member: Object.fromEntries(data) }); setOpen(false); }; return <AdminLayout title="Equipe" action={<button className="primary-panel-button" onClick={() => setOpen(true)}><Plus/> Novo usuário</button>}><div className="panel-grid two-columns">{state.staff.map((member) => <article className="panel-card" key={member.id}><p className="panel-eyebrow">{member.role}</p><h2>{member.name}</h2><p>@{member.username}</p></article>)}</div>{open && <div className="modal-backdrop"><form className="modal-card panel-form" onSubmit={submit}><button type="button" className="modal-close" onClick={() => setOpen(false)}><X/></button><h2>Novo usuário</h2><label>Nome<input name="name" required/></label><label>Usuário<input name="username" required/></label><label>Função<select name="role"><option>Funcionário</option><option>Administrador</option></select></label><button className="primary-panel-button">Cadastrar</button></form></div>}</AdminLayout>; }

export default function App() {
  return <Routes><Route path="/" element={<Start/>}/><Route path="/mesa" element={<TableNumber/>}/><Route path="/cardapio" element={<Catalog/>}/><Route path="/produto/:slug" element={<ProductDetail/>}/><Route path="/personalizar" element={<CustomBurger/>}/><Route path="/carrinho" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/confirmado/:id" element={<Confirmed/>}/><Route path="/painel/login" element={<Login/>}/><Route path="/painel" element={<Dashboard/>}/><Route path="/painel/pedidos" element={<OrdersBoard/>}/><Route path="/painel/produtos" element={<Products/>}/><Route path="/painel/categorias" element={<Categories/>}/><Route path="/painel/opcoes" element={<Options/>}/><Route path="/painel/relatorios" element={<Reports/>}/><Route path="/painel/equipe" element={<Staff/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>;
}
