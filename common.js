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
    }
  }
});