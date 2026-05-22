let selectedStatus = "new";
let autoStatusInfo = null;

// Функция для отображения автоматически определённого статуса
function displayAutoStatus() {
  const autoStatus = getAutoStatusFromHistory();
  autoStatusInfo = autoStatus;
  const autoDisplay = document.getElementById('autoStatusDisplay');
  const vipCheckInfo = document.getElementById('vipCheckInfo');
  
  if(!autoDisplay) return;
  
  let statusIcon = '';
  let statusText = '';
  let statusColor = '';
  
  if(autoStatus.status === 'vip') {
    statusIcon = '💎';
    statusText = 'VIP-клиент';
    statusColor = '#ff9800';
    autoDisplay.innerHTML = `<span style="color: ${statusColor};">${statusIcon} ${statusText} — скидка 10%</span>
    <div style="font-size: 12px; margin-top: 5px;">✅ Достигнута сумма заказов ${autoStatus.totalSpent.toLocaleString()} ₽ (≥ 50 000 ₽)</div>`;
  } else if(autoStatus.status === 'regular') {
    statusIcon = '⭐';
    statusText = 'Постоянный клиент';
    statusColor = '#4caf50';
    autoDisplay.innerHTML = `<span style="color: ${statusColor};">${statusIcon} ${statusText} — скидка 5%</span>
    <div style="font-size: 12px; margin-top: 5px;">📦 Количество заказов: ${autoStatus.totalOrdersCount} (3+)</div>`;
  } else {
    statusIcon = '🆕';
    statusText = 'Новый клиент';
    statusColor = '#666';
    autoDisplay.innerHTML = `<span style="color: ${statusColor};">${statusIcon} ${statusText} — скидка 0%</span>
    <div style="font-size: 12px; margin-top: 5px;">📦 Заказов: ${autoStatus.totalOrdersCount} | 💰 Сумма: ${autoStatus.totalSpent.toLocaleString()} ₽</div>`;
  }
  
  // Проверка VIP статуса
  const vipCheck = checkVIPStatus();
  if(vipCheckInfo) {
    if(!vipCheck.isVIP && vipCheck.neededForVIP > 0) {
      vipCheckInfo.innerHTML = `<i class="fas fa-chart-line"></i> До VIP-статуса осталось: ${vipCheck.neededForVIP.toLocaleString()} ₽ (нужно накопить 50 000 ₽)`;
      vipCheckInfo.style.color = '#ff9800';
    } else if(vipCheck.isVIP) {
      vipCheckInfo.innerHTML = `<i class="fas fa-crown"></i> Поздравляем! Вы VIP-клиент! Скидка 10% на все заказы.`;
      vipCheckInfo.style.color = '#d4af37';
      vipCheckInfo.style.fontWeight = '600';
    } else {
      vipCheckInfo.innerHTML = `<i class="fas fa-info-circle"></i> Совершайте покупки, чтобы получить VIP-статус (50 000 ₽)`;
      vipCheckInfo.style.color = '#666';
    }
  }
  
  return autoStatus;
}

function renderCartPage() {
  loadData(); // Перезагружаем данные перед отображением
  const container = document.getElementById('cartItemsList');
  if(!container) return;
  
  if(cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><i class="fas fa-basket-shopping"></i> <br>Корзина пуста, добавьте товары из каталога</div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
        </div>
        <div class="cart-controls">
          <button class="qty-btn dec" data-id="${item.id}">−</button>
          <span style="min-width: 32px; text-align:center;">${item.quantity}</span>
          <button class="qty-btn inc" data-id="${item.id}">+</button>
          <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-can"></i></button>
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.dec').forEach(btn => btn.addEventListener('click', (e) => changeQuantity(parseInt(btn.dataset.id), -1)));
    document.querySelectorAll('.inc').forEach(btn => btn.addEventListener('click', (e) => changeQuantity(parseInt(btn.dataset.id), 1)));
    document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', (e) => removeCartItem(parseInt(btn.dataset.id))));
  }
  updateDiscountUI();
  updateCartBadge();
}

function changeQuantity(id, delta) {
  loadData();
  const idx = cart.findIndex(i => i.id === id);
  if(idx !== -1) {
    const newQty = cart[idx].quantity + delta;
    if(newQty <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = newQty;
    }
    saveData();
    renderCartPage();
  }
}

function removeCartItem(id) {
  loadData();
  cart = cart.filter(i => i.id !== id);
  saveData();
  renderCartPage();
}

function updateDiscountUI() {
  loadData();
  const subtotal = getCartSubtotal();
  const discountPercent = getDiscountPercentByStatus(selectedStatus);
  const discountAmount = subtotal * discountPercent / 100;
  const finalPrice = subtotal - discountAmount;
  
  const subtotalSpan = document.getElementById('cartSubtotal');
  const discountPercentSpan = document.getElementById('discountPercentText');
  const discountAmountSpan = document.getElementById('discountAmountText');
  const finalTotalSpan = document.getElementById('finalTotal');
  
  if(subtotalSpan) subtotalSpan.innerText = subtotal.toLocaleString() + ' ₽';
  if(discountPercentSpan) discountPercentSpan.innerText = discountPercent + '%';
  if(discountAmountSpan) discountAmountSpan.innerText = discountAmount.toLocaleString() + ' ₽';
  if(finalTotalSpan) finalTotalSpan.innerText = finalPrice.toLocaleString() + ' ₽';
}

function recalcDiscountFromSelect() {
  const select = document.getElementById('customerStatusSelect');
  if(select) {
    selectedStatus = select.value;
  }
  updateDiscountUI();
}

function checkoutOrder() {
  loadData();
  if(cart.length === 0) {
    alert("Корзина пуста! Добавьте товары в каталоге.");
    return;
  }
  
  const subtotal = getCartSubtotal();
  const discountPercent = getDiscountPercentByStatus(selectedStatus);
  const discountAmount = subtotal * discountPercent / 100;
  const finalAmount = subtotal - discountAmount;
  
  const newOrder = {
    date: new Date().toLocaleString(),
    items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
    subtotal: subtotal,
    discountPercent: discountPercent,
    discountAmount: discountAmount,
    finalAmount: finalAmount,
    statusUsed: selectedStatus
  };
  
  ordersHistory.unshift(newOrder);
  cart = [];
  saveData();
  renderCartPage();
  updateCartBadge();
  displayAutoStatus();
  alert(`✅ Заказ оформлен!\nСумма со скидкой: ${finalAmount.toLocaleString()} ₽\nСпасибо за покупку!`);
}

// Инициализация страницы корзины
loadData();
renderCartPage();
updateCartBadge();
displayAutoStatus();

// Привязываем обработчики событий
const statusSelect = document.getElementById('customerStatusSelect');
if(statusSelect) {
  statusSelect.addEventListener('change', () => { 
    selectedStatus = statusSelect.value; 
    updateDiscountUI(); 
  });
}

const recalcBtn = document.getElementById('recalcDiscountBtn');
if(recalcBtn) {
  recalcBtn.addEventListener('click', recalcDiscountFromSelect);
}

const checkoutBtn = document.getElementById('checkoutBtn');
if(checkoutBtn) {
  checkoutBtn.addEventListener('click', checkoutOrder);
}

const clearCartBtn = document.getElementById('clearCartBtn');
if(clearCartBtn) {
  clearCartBtn.addEventListener('click', () => { 
    cart = []; 
    saveData(); 
    renderCartPage(); 
    updateCartBadge(); 
    showToast("Корзина очищена"); 
  });
}