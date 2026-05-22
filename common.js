// Общий скрипт для всех страниц
loadData();
updateCartBadge();

// Слушаем событие storage для синхронизации между вкладками
window.addEventListener('storage', function(e) {
  if(e.key === 'multiPageCart' || e.key === 'multiPageHistory') {
    loadData();
    updateCartBadge();
    // Если мы на странице корзины, обновляем её
    if(window.location.pathname.includes('cart.html')) {
      if(typeof renderCartPage === 'function') {
        renderCartPage();
      }
      if(typeof displayAutoStatus === 'function') {
        displayAutoStatus();
      }
    }
    if(window.location.pathname.includes('rules.html')) {
      if(typeof updateRulesHistoryInfo === 'function') {
        updateRulesHistoryInfo();
      }
    }
  }
});

// Функция для страницы правил
function updateRulesHistoryInfo() {
  const historyListDiv = document.getElementById('historyOrdersList');
  const totalSpentSpan = document.getElementById('rulesTotalSpent');
  const ordersCountSpan = document.getElementById('rulesOrdersCount');
  const statusSpan = document.getElementById('rulesCurrentStatus');
  
  if(historyListDiv) {
    if(ordersHistory.length === 0) {
      historyListDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">📭 История заказов пуста. Оформите первый заказ!</div>';
    } else {
      historyListDiv.innerHTML = ordersHistory.map((order, index) => `
        <div style="border-bottom: 1px solid #eee; padding: 12px 0;">
          <div style="font-weight: bold; color: #2e7d32;">${order.date}</div>
          <div> Товары: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
          <div> Сумма: ${order.subtotal.toLocaleString()} ₽ → Скидка ${order.discountPercent}% → Итого: ${order.finalAmount.toLocaleString()} ₽</div>
        </div>
      `).join('');
    }
  }
  
  const totalSpent = getTotalSpent();
  const ordersCount = getOrdersCount();
  const autoStatus = getAutoStatusFromHistory();
  
  if(totalSpentSpan) totalSpentSpan.innerText = totalSpent.toLocaleString() + ' ₽';
  if(ordersCountSpan) ordersCountSpan.innerText = ordersCount;
  if(statusSpan) {
    let statusText = '';
    if(autoStatus.status === 'vip') statusText = ' VIP-клиент (10% скидка)';
    else if(autoStatus.status === 'regular') statusText = ' Постоянный клиент (5% скидка)';
    else statusText = '🆕 Новый клиент (0% скидка)';
    statusSpan.innerHTML = statusText;
  }
}