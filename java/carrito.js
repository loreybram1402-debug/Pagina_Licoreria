(() => {
  const cartStorageKey = 'cart';

  const safeParseJSON = (value, fallback) => {
    if (window.StoreData && typeof window.StoreData.safeParseJSON === 'function') {
      return window.StoreData.safeParseJSON(value, fallback);
    }
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getCart = () => {
    const stored = safeParseJSON(localStorage.getItem(cartStorageKey), []);
    return Array.isArray(stored) ? stored : [];
  };

  const saveCart = (cart) => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    updateNavCartCount();
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getTotalItems = () => {
    return getCart().reduce((sum, line) => sum + (Number(line.qty) || 0), 0);
  };

  const updateNavCartCount = () => {
    const el = document.getElementById('navCartCount');
    if (!el) return;
    el.textContent = String(getTotalItems());
  };

  const findLineIndex = (cart, productId) => {
    return cart.findIndex((line) => Number(line.productId) === Number(productId));
  };

  const addToCart = (productId, qty = 1) => {
    const cart = getCart();
    const index = findLineIndex(cart, productId);
    if (index === -1) {
      cart.push({ productId: Number(productId), qty: Number(qty) || 1 });
    } else {
      cart[index].qty = (Number(cart[index].qty) || 0) + (Number(qty) || 1);
    }
    saveCart(cart);
    return cart;
  };

  const removeFromCart = (productId) => {
    const cart = getCart().filter((line) => Number(line.productId) !== Number(productId));
    saveCart(cart);
    return cart;
  };

  const setItemQty = (productId, qty) => {
    const cart = getCart();
    const index = findLineIndex(cart, productId);
    const safeQty = Number(qty) || 0;

    if (index === -1) {
      if (safeQty > 0) {
        cart.push({ productId: Number(productId), qty: safeQty });
      }
      saveCart(cart);
      return cart;
    }

    if (safeQty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].qty = safeQty;
    }
    saveCart(cart);
    return cart;
  };

  const getProducts = () => {
    if (window.StoreData && typeof window.StoreData.seedProductsIfMissing === 'function') {
      return window.StoreData.seedProductsIfMissing();
    }
    const stored = safeParseJSON(localStorage.getItem('products'), []);
    return Array.isArray(stored) ? stored : [];
  };

  const getCartDetailed = () => {
    const products = getProducts();
    const byId = new Map(products.map((p) => [Number(p.id), p]));
    return getCart().map((line) => {
      const product = byId.get(Number(line.productId));
      return {
        productId: Number(line.productId),
        qty: Number(line.qty) || 0,
        product
      };
    });
  };

  const getSubtotal = () => {
    const lines = getCartDetailed();
    return lines.reduce((sum, line) => {
      if (!line.product) return sum;
      return sum + (Number(line.product.price) || 0) * (Number(line.qty) || 0);
    }, 0);
  };

  window.StoreCart = {
    cartStorageKey,
    getCart,
    saveCart,
    clearCart,
    getTotalItems,
    addToCart,
    removeFromCart,
    setItemQty,
    getCartDetailed,
    getSubtotal,
    updateNavCartCount
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavCartCount);
  } else {
    updateNavCartCount();
  }
})();