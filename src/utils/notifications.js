// Sovereign notification handler
export function showMessages(message, type = 'info') {
  const container = document.getElementById('notification-container') || createContainer();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function createContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
  document.body.appendChild(container);
  return container;
}

// Add global access
if (typeof window !== 'undefined') {
  window.showMessages = showMessages;
}
