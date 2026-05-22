

function displayAutoStatus() {
  const autoStatus = getAutoStatusFromHistory();
  const autoDisplay = document.getElementById('autoStatusDisplay');
  const vipCheckInfo = document.getElementById('vipCheckInfo');
  const ordersCountSpan = document.getElementById('ordersCountValue');
  const totalSpentSpan = document.getElementById('totalSpentValue');
  
  if(ordersCountSpan) ordersCountSpan.innerText = autoStatus.totalOrdersCount;
  if(totalSpentSpan) totalSpentSpan.innerText = autoStatus.totalSpent.toLocaleString() + ' ₽';
  
  if(!autoDisplay) return;
  
  autoDisplay.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
      <span style="font-size: 32px;">${autoStatus.icon}</span>
      <div>
        <div style="font-size: 18px; font-weight: bold; color: ${autoStatus.color};">${autoStatus.statusName}</div>
        <div style="font-size: 24px; font-weight: 800; color: ${autoStatus.color};">скидка ${autoStatus.discount}%</div>
      </div>
    </div>
    <div style="font-size: 13px; margin-top: 10px; color: #555;">${autoStatus.reason}</div>
  `;
  
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
      const needOrders = 3 - vipCheck.ordersCount;
      if(needOrders > 0) {
        vipCheckInfo.innerHTML = `<i class="fas fa-info-circle"></i> До статуса "Постоянный клиент" осталось ${needOrders} заказа(ов). До VIP: ${vipCheck.neededForVIP.toLocaleString()} ₽`;
      } else {
        vipCheckInfo.innerHTML = `<i class="fas fa-info-circle"></i> Совершайте покупки, чтобы получить VIP-статус (50 000 ₽)`;
      }
      vipCheckInfo.style.color = '#666';
    }
  }
  
  return autoStatus;
}

function renderCartPage() {
  loadData();
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
  const discountPercent = getAutoDiscountPercent();
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

// ФУНКЦИЯ ОФОРМЛЕНИЯ ЗАКАЗА (ИСПРАВЛЕНА)
function checkoutOrder() {
  console.log("checkoutOrder вызвана"); // Для отладки
  loadData();
  
  if(cart.length === 0) {
    alert(" Корзина пуста! Добавьте товары в каталоге.");
    return;
  }
  
  const subtotal = getCartSubtotal();
  const discountPercent = getAutoDiscountPercent();
  const discountAmount = subtotal * discountPercent / 100;
  const finalAmount = subtotal - discountAmount;
  const autoStatus = getAutoStatusFromHistory();
  
  const newOrder = {
    date: new Date().toLocaleString(),
    items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
    subtotal: subtotal,
    discountPercent: discountPercent,
    discountAmount: discountAmount,
    finalAmount: finalAmount,
    statusUsed: autoStatus.status,
    statusName: autoStatus.statusName
  };
  
  ordersHistory.unshift(newOrder);
  cart = [];
  saveData();
  renderCartPage();
  updateCartBadge();
  displayAutoStatus();
  
  alert(` ЗАКАЗ ОФОРМЛЕН!\n\nСтатус: ${autoStatus.statusName} (скидка ${discountPercent}%)\nСумма заказа: ${subtotal.toLocaleString()} ₽\nСкидка: ${discountAmount.toLocaleString()} ₽\nИТОГО К ОПЛАТЕ: ${finalAmount.toLocaleString()} ₽\n\nСпасибо за покупку!`);
  
  // Обновляем страницу правил, если она открыта (для синхронизации)
  if(typeof updateRulesHistoryInfo === 'function') {
    updateRulesHistoryInfo();
  }
}

// Инициализация страницы корзины
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM загружен, инициализация корзины");
  loadData();
  renderCartPage();
  updateCartBadge();
  displayAutoStatus();
  
  // КНОПКА ОФОРМЛЕНИЯ ЗАКАЗА
  const checkoutBtn = document.getElementById('checkoutBtn');
  if(checkoutBtn) {
    console.log("Кнопка оформления найдена, добавляем обработчик");
    checkoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Клик по кнопке Оформить заказ");
      checkoutOrder();
    });
  } else {
    console.error("Кнопка с id='checkoutBtn' не найдена!");
  }
  
  // Кнопка очистки корзины
  const clearCartBtn = document.getElementById('clearCartBtn');
  if(clearCartBtn) {
    clearCartBtn.addEventListener('click', function() { 
      cart = []; 
      saveData(); 
      renderCartPage(); 
      updateCartBadge(); 
      showToast(" Корзина очищена"); 
    });
  }
  
  // Кнопка очистки истории
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if(clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function() {
      clearOrderHistory();
      displayAutoStatus();
      updateDiscountUI();
    });
  }
  
  // Кнопка тестового заказа
  const addTestOrderBtn = document.getElementById('addTestOrderBtn');
  if(addTestOrderBtn) {
    addTestOrderBtn.addEventListener('click', function() {
      addTestOrder();
      displayAutoStatus();
      updateDiscountUI();
      if(typeof updateRulesHistoryInfo === 'function') {
        updateRulesHistoryInfo();
      }
    });
  }
});

// Дублируем на случай, если DOMContentLoaded уже произошёл
if(document.readyState === 'loading') {
  // Ждём событие
} else {
  // DOM уже загружен, вызываем вручную
  setTimeout(function() {
    if(document.getElementById('checkoutBtn')) {
      const btn = document.getElementById('checkoutBtn');
      if(btn && !btn.hasListener) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          checkoutOrder();
        });
        btn.hasListener = true;
      }
    }
  }, 100);
}