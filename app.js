// Utils
const formatIDR = n => 'Rp' + n.toLocaleString('id-ID');

// Demo menu items (you can replace with real images/price)
const MENU = [
  {id:'SLD1', name:'Green Goddess Salad', price:28000, img:'assets/img/salad.svg', desc:'Sayur segar, edamame, alpukat.'},
  {id:'BWL1', name:'Protein Power Bowl', price:35000, img:'assets/img/bowl.svg', desc:'Quinoa, tofu, sayur panggang.'},
  {id:'SMO1', name:'Detox Green Smoothie', price:24000, img:'assets/img/smoothie.svg', desc:'Bayam, apel, lemon, chia.'},
  {id:'WRP1', name:'Avocado Chickpea Wrap', price:32000, img:'assets/img/hero.svg', desc:'Krim alpukat & buncis panggang.'},
  {id:'SLD2', name:'Kale Citrus Salad', price:30000, img:'assets/img/salad.svg', desc:'Kale, jeruk, walnut.'},
  {id:'BWL2', name:'Mediterranean Bowl', price:36000, img:'assets/img/bowl.svg', desc:'Hummus, tomat, olive, couscous.'}
];

// Cart state
const CART_KEY = 'freshbite_cart_v1';
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const setCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c));

function addToCart(itemId){
  const cart = getCart();
  const found = cart.find(i => i.id === itemId);
  if(found){ found.qty += 1; }
  else{
    const item = MENU.find(i => i.id === itemId);
    if(!item) return;
    cart.push({id:item.id, name:item.name, price:item.price, img:item.img, qty:1});
  }
  setCart(cart);
  updateCartCount();
  openCart();
  renderCart();
}

function removeFromCart(itemId){
  let cart = getCart().filter(i => i.id !== itemId);
  setCart(cart);
  updateCartCount();
  renderCart();
}

function changeQty(itemId, delta){
  const cart = getCart();
  const it = cart.find(i => i.id === itemId);
  if(!it) return;
  it.qty = Math.max(1, it.qty + delta);
  setCart(cart);
  updateCartCount();
  renderCart();
}

function cartTotal(){
  return getCart().reduce((s,i)=> s + i.price * i.qty, 0);
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=> s+i.qty, 0);
  const el = document.getElementById('cartCount');
  if(el) el.textContent = count;
}

function renderMenu(){
  const grid = document.getElementById('menuGrid');
  if(!grid) return;
  grid.innerHTML = '';
  MENU.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card menu-card';
    card.innerHTML = `
      <img src="${m.img}" alt="${m.name}"/>
      <h5>${m.name}</h5>
      <p>${m.desc}</p>
      <div class="actions">
        <span class="price">${formatIDR(m.price)}</span>
        <button class="btn primary" data-add="${m.id}">Tambah</button>
      </div>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('button[data-add]').forEach(btn => {
    btn.addEventListener('click', e => addToCart(e.currentTarget.dataset.add));
  });
}

function renderCart(){
  const box = document.getElementById('cartItems');
  if(!box) return;
  const cart = getCart();
  box.innerHTML = '';
  if(cart.length === 0){
    box.innerHTML = '<p>Keranjang kosong. Yuk pilih menu dulu! 🥗</p>';
  }else{
    cart.forEach(i => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${i.img}" alt="${i.name}"/>
        <div>
          <strong>${i.name}</strong><br/>
          <span>${formatIDR(i.price)}</span>
          <div class="qty">
            <button data-q="${i.id}" data-d="-1">−</button>
            <span>${i.qty}</span>
            <button data-q="${i.id}" data-d="1">+</button>
          </div>
        </div>
        <button class="btn ghost" data-remove="${i.id}">Hapus</button>
      `;
      box.appendChild(row);
    });
  }
  const total = document.getElementById('cartTotal');
  if(total) total.textContent = formatIDR(cartTotal());

  // bind qty/remove
  box.querySelectorAll('button[data-q]').forEach(b => {
    b.addEventListener('click', e => changeQty(e.currentTarget.dataset.q, parseInt(e.currentTarget.dataset.d,10)));
  });
  box.querySelectorAll('button[data-remove]').forEach(b => {
    b.addEventListener('click', e => removeFromCart(e.currentTarget.dataset.remove));
  });
}

// Drawer
function openCart(){
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('overlay')?.classList.add('show');
}
function closeCart(){
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('show');
}

function bindCartUI(){
  const cartBtn = document.getElementById('cartButton');
  const closeBtn = document.getElementById('closeCart');
  const clearBtn = document.getElementById('clearCart');
  cartBtn?.addEventListener('click', openCart);
  closeBtn?.addEventListener('click', closeCart);
  document.getElementById('overlay')?.addEventListener('click', closeCart);
  clearBtn?.addEventListener('click', ()=>{
    setCart([]); updateCartCount(); renderCart();
  });
}

// Slider
function initSlider(){
  const slider = document.getElementById('slider');
  if(!slider) return;
  const track = slider.querySelector('.slides');
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  const dots = slider.querySelector('#dots');
  const slides = Array.from(track.children);
  let idx = 0;

  function go(i){
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx*100}%)`;
    dots.querySelectorAll('button').forEach((d,di)=>d.classList.toggle('active', di===idx));
  }

  slides.forEach((_, i)=>{
    const d = document.createElement('button');
    d.addEventListener('click', ()=>go(i));
    if(i===0) d.classList.add('active');
    dots.appendChild(d);
  });
  prev.addEventListener('click', ()=>go(idx-1));
  next.addEventListener('click', ()=>go(idx+1));

  // auto-play
  setInterval(()=>go(idx+1), 4000);
}

// Checkout page summary
function renderCheckout(){
  const box = document.getElementById('summaryItems');
  if(!box) return;
  const cart = getCart();
  if(cart.length===0) box.innerHTML = '<p>Belum ada item. Kembali ke <a href="index.html">menu</a>.</p>';
  else{
    cart.forEach(i=>{
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${i.img}" alt="${i.name}"/>
        <div><strong>${i.name}</strong><br><span>${i.qty} × ${formatIDR(i.price)}</span></div>
        <div><strong>${formatIDR(i.qty*i.price)}</strong></div>
      `;
      box.appendChild(row);
    });
  }
  const total = document.getElementById('summaryTotal');
  if(total) total.textContent = formatIDR(cartTotal());
}

// Simple animation on scroll
function animateOnScroll(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.transform = 'translateY(0)';
        e.target.style.opacity = '1';
      }
    });
  }, {threshold:.2});
  document.querySelectorAll('.card, .menu-card, .hero-copy').forEach(el=>{
    el.style.transform = 'translateY(14px)';
    el.style.opacity = '0';
    el.style.transition = 'all .6s cubic-bezier(.2,.7,.1,1)';
    io.observe(el);
  });
}

// BGM toggle
function initAudio(){
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('audioToggle');
  if(!audio || !btn) return;
  let playing = false;
  btn.addEventListener('click', async ()=>{
    try{
      if(!playing){ await audio.play(); playing = true; btn.textContent = '🔊'; }
      else{ audio.pause(); playing = false; btn.textContent = '🔈'; }
    }catch(e){ console.log(e); }
  });
}

function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  renderMenu();
  bindCartUI();
  renderCart();
  initSlider();
  animateOnScroll();
  initAudio();
  renderCheckout();

  // Checkout form submit
  const form = document.getElementById('checkoutForm');
  if(form){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      setTimeout(()=>{
        document.getElementById('orderSuccess').hidden = false;
        form.hidden = true;
        setCart([]);
      }, 400);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
