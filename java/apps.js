(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getPage = () => {
    const byAttr = document.body?.dataset?.page;
    if (byAttr) return String(byAttr);
    const path = String(window.location.pathname || '');
    if (path.endsWith('catalog.html') || path.endsWith('catalogo.html')) return 'catalog';
    if (path.endsWith('product.html') || path.endsWith('product.html')) return 'product';
    if (path.endsWith('carrito.html') || path.endsWith('carrito.html')) return 'cart';
    if (path.endsWith('checkout.html') || path.endsWith('verificar.html')) return 'checkout';
    if (path.endsWith('admin.html') || path.endsWith('administracion.html')) return 'admin';
    return 'home';
  };

  const getProducts = () => {
    if (window.StoreData && typeof window.StoreData.seedProductsIfMissing === 'function') {
      return window.StoreData.seedProductsIfMissing();
    }
    return [];
  };

  const setProducts = (products) => {
    const key = window.StoreData?.storageKey || 'products';
    localStorage.setItem(key, JSON.stringify(products));
  };

  const getProductById = (id) => {
    const pid = Number(id);
    return getProducts().find((p) => Number(p.id) === pid);
  };

  const getQueryParam = (key) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  const showToast = (message) => {
    const host = document.getElementById('toastHost');
    if (!host) return;
    host.textContent = message;
    host.classList.add('show');
    window.setTimeout(() => host.classList.remove('show'), 1700);
  };

  const bindGlobalActions = () => {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const actionEl = target.closest('[data-action]');
      if (!(actionEl instanceof HTMLElement)) return;

      const action = actionEl.dataset.action;
      if (!action) return;

      if (action === 'add-to-cart') {
        const productId = Number(actionEl.dataset.productId);
        const qtyInputSelector = actionEl.dataset.qtyInput;
        let qty = 1;
        if (qtyInputSelector) {
          const input = document.querySelector(qtyInputSelector);
          if (input instanceof HTMLInputElement) qty = Number(input.value) || 1;
        }
        if (window.StoreCart) {
          window.StoreCart.addToCart(productId, qty);
          showToast('Added to cart');
        }
      }

      if (action === 'remove-from-cart') {
        const productId = Number(actionEl.dataset.productId);
        window.StoreCart?.removeFromCart(productId);
        initCartPage();
      }
    });

    document.addEventListener('input', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.dataset.action !== 'cart-qty') return;

      const productId = Number(target.dataset.productId);
      const qty = Number(target.value) || 0;
      window.StoreCart?.setItemQty(productId, qty);
      updateCartSummary();
    });
  };

  const initHomePage = () => {
    const products = getProducts();
    const grid = document.getElementById('featuredGrid');
    window.StoreProducts?.renderFeatured(products, grid);
  };

 const initCatalogPage = () => {
    const products = getProducts();
    const gridEl = document.getElementById('catalogGrid');
    const categoryEl = document.getElementById('categoryFilter');
    const searchEl = document.getElementById('catalogSearch');

    const render = () => {
        window.StoreProducts?.renderCatalog({ products, gridEl, categoryEl, searchEl });
    };

    searchEl?.addEventListener('input', render);
    
    
    categoryEl?.addEventListener('change', render);

    render(); 
};
  const initProductPage = () => {
    const id = getQueryParam('id');
    const product = id ? getProductById(id) : null;
    const container = document.getElementById('productDetail');
    window.StoreProducts?.renderProductDetail(product, container);
  };

  const cartRowMarkup = (line) => {
    const product = line.product;
    const id = Number(line.productId);
    const name = product ? String(product.name) : 'Unknown product';
    const price = product ? Number(product.price) || 0 : 0;
    const lineTotal = price * (Number(line.qty) || 0);
    const formatPrice = window.StoreProducts?.formatPrice || ((n) => `$${(Number(n) || 0).toFixed(2)}`);

    return `
      <div class="cart-row">
        <div class="cart-main">
          <div class="cart-title">${name}</div>
          <div class="muted small">${formatPrice(price)} each</div>
        </div>
        <div class="cart-controls">
          <input class="input" type="number" min="0" value="${Number(line.qty) || 0}" data-action="cart-qty" data-product-id="${id}" />
          <div class="cart-line-total">${formatPrice(lineTotal)}</div>
          <button class="btn danger" data-action="remove-from-cart" data-product-id="${id}">Eliminar</button>
        </div>
      </div>
    `.trim();
  };

  const updateCartSummary = () => {
    const summary = document.getElementById('cartSummary');
    if (!summary) return;
    const subtotal = window.StoreCart?.getSubtotal ? window.StoreCart.getSubtotal() : 0;
    const items = window.StoreCart?.getTotalItems ? window.StoreCart.getTotalItems() : 0;
    const formatPrice = window.StoreProducts?.formatPrice || ((n) => `$${(Number(n) || 0).toFixed(2)}`);
    summary.innerHTML = `
      <div class="summary">
        <div class="summary-row"><span class="muted">Elementos</span><strong>${items}</strong></div>
        <div class="summary-row"><span class="muted">Total</span><strong>${formatPrice(subtotal)}</strong></div>
      </div>
    `.trim();
  };

  const initCartPage = () => {
    const container = document.getElementById('cartContainer');
    if (!container) return;
    const lines = window.StoreCart?.getCartDetailed ? window.StoreCart.getCartDetailed() : [];

    if (!lines || lines.length === 0) {
      container.innerHTML = `<div class="empty">Tu carro esta vacio.</div>`;
      updateCartSummary();
      return;
    }

    container.innerHTML = lines.map(cartRowMarkup).join('');
    updateCartSummary();
  };

  const initCheckoutPage = () => {
    const summary = document.getElementById('checkoutSummary');
    const message = document.getElementById('checkoutMessage');
    const form = document.getElementById('checkoutForm');
    if (!summary || !form) return;

    const subtotal = window.StoreCart?.getSubtotal ? window.StoreCart.getSubtotal() : 0;
    const items = window.StoreCart?.getTotalItems ? window.StoreCart.getTotalItems() : 0;
    const formatPrice = window.StoreProducts?.formatPrice || ((n) => `$${(Number(n) || 0).toFixed(2)}`);
    summary.innerHTML = `
      <div class="summary">
        <div class="summary-row"><span class="muted">Elementos</span><strong>${items}</strong></div>
        <div class="summary-row"><span class="muted">Total</span><strong>${formatPrice(subtotal)}</strong></div>
      </div>
    `.trim();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (items <= 0) {
        if (message) message.textContent = 'Tu carro esta vacio.';
        return;
      }
      window.StoreCart?.clearCart();
      if (message) {
        message.textContent = 'Pedido realizado con éxito.';
        message.classList.add('success');
      }
      summary.innerHTML = '';
      form.reset();
    });
  };

  const renderAdminTable = (products) => {
    const table = document.getElementById('adminTable');
    if (!table) return;
    const formatPrice = window.StoreProducts?.formatPrice || ((n) => `$${(Number(n) || 0).toFixed(2)}`);

    if (!products || products.length === 0) {
      table.innerHTML = `<div class="empty">Aun no hay productos.</div>`;
      return;
    }

    table.innerHTML = `
      <div class="table">
        <div class="table-head">
          <div>ID</div>
          <div>Name</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div></div>
        </div>
        ${products
          .map(
            (p) => `
            <div class="table-row" data-id="${Number(p.id)}">
              <div>${Number(p.id)}</div>
              <div>${String(p.name)}</div>
              <div class="muted">${String(p.category || '')}</div>
              <div>${formatPrice(p.price)}</div>
              <div>${Number(p.stock) || 0}</div>
              <div class="table-actions">
                <button class="btn" data-action="admin-edit" data-product-id="${Number(p.id)}">Editar</button>
                <button class="btn danger" data-action="admin-delete" data-product-id="${Number(p.id)}">Borrar</button>
              </div>
            </div>
          `.trim()
          )
          .join('')}
      </div>
    `.trim();
  };

  const initAdminPage = () => {
    const form = document.getElementById('adminForm');
    const resetBtn = document.getElementById('adminReset');
    if (!form) return;

    const readForm = () => {
      const id = Number((qs('#adminId')?.value || '').toString()) || 0;
      const name = (qs('#adminName')?.value || '').toString().trim();
      const category = (qs('#adminCategory')?.value || '').toString().trim();
      const price = Number((qs('#adminPrice')?.value || '').toString()) || 0;
      const stock = Number((qs('#adminStock')?.value || '').toString()) || 0;
      const description = (qs('#adminDescription')?.value || '').toString().trim();
      const image = (qs('#adminImage')?.value || '').toString().trim();
      return { id, name, category, price, stock, description, image };
    };

    const fillForm = (product) => {
      (qs('#adminId')).value = String(product?.id || '');
      (qs('#adminName')).value = String(product?.name || '');
      (qs('#adminCategory')).value = String(product?.category || '');
      (qs('#adminPrice')).value = String(product?.price ?? '');
      (qs('#adminStock')).value = String(product?.stock ?? '');
      (qs('#adminDescription')).value = String(product?.description || '');
      (qs('#adminImage')).value = String(product?.image || '');
    };

    const clearForm = () => {
      fillForm({});
    };

    const refresh = () => {
      renderAdminTable(getProducts());
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = readForm();
      if (!current.name) return;

      const list = getProducts();
      if (current.id) {
        const idx = list.findIndex((p) => Number(p.id) === Number(current.id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...current, id: Number(current.id) };
        }
      } else {
        const nextId = list.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
        list.push({ ...current, id: nextId });
      }
      setProducts(list);
      clearForm();
      refresh();
    });

    resetBtn?.addEventListener('click', () => {
      clearForm();
    });

    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const actionEl = target.closest('[data-action]');
      if (!(actionEl instanceof HTMLElement)) return;
      const action = actionEl.dataset.action;
      if (!action) return;
      if (action === 'admin-edit') {
        const id = Number(actionEl.dataset.productId);
        const p = getProductById(id);
        if (p) fillForm(p);
      }
      if (action === 'admin-delete') {
        const id = Number(actionEl.dataset.productId);
        const next = getProducts().filter((p) => Number(p.id) !== id);
        setProducts(next);
        refresh();
      }
    });

    refresh();
  };

  const init = () => {
    getProducts();
    window.StoreCart?.updateNavCartCount?.();
    bindGlobalActions();

    const page = getPage();
    if (page === 'home') initHomePage();
    if (page === 'catalog') initCatalogPage();
    if (page === 'product') initProductPage();
    if (page === 'cart') initCartPage();
    if (page === 'checkout') initCheckoutPage();
    if (page === 'admin') initAdminPage();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();