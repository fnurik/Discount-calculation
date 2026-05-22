// Каталог: фильтры и сортировка
let currentCategory = "all";
let currentSort = "name-asc";

function renderCatalog() {
  let filtered = [...PRODUCTS];
  if(currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  // сортировка
  if(currentSort === "price-asc") filtered.sort((a,b) => a.price - b.price);
  else if(currentSort === "price-desc") filtered.sort((a,b) => b.price - a.price);
  else if(currentSort === "name-asc") filtered.sort((a,b) => a.name.localeCompare(b.name));
  
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = filtered.map(prod => `
    <div class="product-card">
      <div class="product-img"><i class="fas ${prod.icon}"></i></div>
      <div class="product-category">${prod.catName}</div>
      <div class="product-title">${prod.name}</div>
      <div class="product-price">${prod.price.toLocaleString()} ₽</div>
      <button class="add-to-cart-btn" data-id="${prod.id}"><i class="fas fa-cart-plus"></i> В корзину</button>
    </div>
  `).join('');
  
  // Привязываем события к кнопкам
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const product = PRODUCTS.find(p => p.id === id);
      if(product) {
        addToCartFromCatalog(product);
      }
    });
  });
}

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if(!container) return;
  const categories = [...new Map(PRODUCTS.map(p => [p.category, p.catName])).entries()].map(([key, name]) => ({ key, name }));
  const allBtn = `<button class="cat-btn ${currentCategory === 'all' ? 'active-cat' : ''}" data-cat="all">Все товары</button>`;
  const catButtons = categories.map(cat => `<button class="cat-btn ${currentCategory === cat.key ? 'active-cat' : ''}" data-cat="${cat.key}">${cat.name}</button>`).join('');
  container.innerHTML = allBtn + catButtons;
  
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      renderCatalog();
      renderCategoryFilters();
    });
  });
}

// Инициализация каталога
loadData();
renderCatalog();
renderCategoryFilters();
updateCartBadge();

// Сортировка
const sortSelect = document.getElementById('sortSelect');
if(sortSelect) {
  sortSelect.addEventListener('change', (e) => { 
    currentSort = e.target.value; 
    renderCatalog(); 
  });
}