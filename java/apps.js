(() => {
  // --- UTILIDADES ---
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Detectar en qué página estamos para activar las funciones correctas
  const getPage = () => {
    const byAttr = document.body?.dataset?.page;
    if (byAttr) return String(byAttr);
    const path = String(window.location.pathname || '').toLowerCase();
    if (path.includes('catalog.html') || path.includes('catalogo.html')) return 'catalog';
    if (path.includes('product.html')) return 'product';
    if (path.includes('carrito.html')) return 'cart';
    if (path.includes('checkout.html') || path.includes('verificar.html')) return 'checkout';
    if (path.includes('admin.html') || path.includes('administracion.html')) return 'admin';
    return 'home';
  };

  // --- LÓGICA DE PRODUCTOS ---
  const getProducts = () => {
    if (window.StoreData && typeof window.StoreData.seedProductsIfMissing === 'function') {
      return window.StoreData.seedProductsIfMissing();
    }
    const key = window.StoreData?.storageKey || 'products';
    return JSON.parse(localStorage.getItem(key)) || [];
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

  // --- ACCIONES GLOBALES (Botones de compra) ---
  const bindGlobalActions = () => {
    document.addEventListener('click', (e) => {
      const target = e.target;
      const actionEl = target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.dataset.action;
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
          showToast('Agregado al carrito');
        }
      }

      if (action === 'remove-from-cart') {
        const productId = Number(actionEl.dataset.productId);
        window.StoreCart?.removeFromCart(productId);
        if (getPage() === 'cart') initCartPage();
      }
    });

    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target instanceof HTMLInputElement && target.dataset.action === 'cart-qty') {
        const productId = Number(target.dataset.productId);
        const qty = Number(target.value) || 0;
        window.StoreCart?.setItemQty(productId, qty);
        updateCartSummary();
      }
    });
  };

  // --- RENDERIZADO DE PÁGINAS ---
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

  const updateCartSummary = () => {
    const summary = document.getElementById('cartSummary');
    if (!summary) return;
    const subtotal = window.StoreCart?.getSubtotal ? window.StoreCart.getSubtotal() : 0;
    const items = window.StoreCart?.getTotalItems ? window.StoreCart.getTotalItems() : 0;
    summary.innerHTML = `
      <div class="summary">
        <div class="summary-row"><span class="muted">Elementos</span><strong>${items}</strong></div>
        <div class="summary-row"><span class="muted">Total</span><strong>${subtotal.toLocaleString()} COP</strong></div>
      </div>`.trim();
  };

  const initCartPage = () => {
    const container = document.getElementById('cartContainer');
    if (!container) return;
    const lines = window.StoreCart?.getCartDetailed ? window.StoreCart.getCartDetailed() : [];
    if (!lines || lines.length === 0) {
      container.innerHTML = `<div class="empty">Tu carro está vacío.</div>`;
      updateCartSummary();
      return;
    }
    container.innerHTML = lines.map(line => `
      <div class="cart-row">
        <div class="cart-main">
          <div class="cart-title">${line.product?.name || 'Producto'}</div>
          <div class="muted small">${(line.product?.price || 0).toLocaleString()} COP c/u</div>
        </div>
        <div class="cart-controls">
          <input class="input" type="number" min="1" value="${line.qty}" data-action="cart-qty" data-product-id="${line.productId}" />
          <div class="cart-line-total">${((line.product?.price || 0) * line.qty).toLocaleString()} COP</div>
          <button class="btn danger" data-action="remove-from-cart" data-product-id="${line.productId}">Eliminar</button>
        </div>
      </div>`).join('');
    updateCartSummary();
  };

  // --- PÁGINA DE CHECKOUT (ENVÍO REAL A LA BASE DE DATOS) ---
  const initCheckoutPage = () => {
    const summary = document.getElementById('checkoutSummary');
    const form = document.getElementById('checkoutForm');
    if (!summary || !form) return;

    const subtotal = window.StoreCart?.getSubtotal ? window.StoreCart.getSubtotal() : 0;
    const items = window.StoreCart?.getTotalItems ? window.StoreCart.getTotalItems() : 0;
    
    summary.innerHTML = `
      <div class="summary">
        <div class="summary-row"><span class="muted">Elementos</span><strong>${items}</strong></div>
        <div class="summary-row"><span class="muted">Total</span><strong>${subtotal.toLocaleString()} COP</strong></div>
      </div>
    `.trim();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (items <= 0) return alert('Agregue productos antes de comprar.');

      // 1. Extraer datos del formulario
      const formData = new FormData(form);
      const nombreCliente = formData.get('name');
      
      // 2. Extraer productos del carrito oficial de la app
      const detallesCarrito = window.StoreCart.getCartDetailed();
      const listaTexto = detallesCarrito.map(item => `${item.product.name} (x${item.qty})`).join(', ');

      // 3. Crear el paquete para enviar a Node.js
      const datosParaDB = {
        cliente: nombreCliente,
        productos: listaTexto,
        total: subtotal
      };

      try {
        const respuesta = await fetch('http://localhost:3000/api/nuevo-pedido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosParaDB)
        });

        if (respuesta.ok) {
          alert('¡Pedido enviado con éxito a Licorería El Baúl!');
          window.StoreCart?.clearCart();
          window.location.href = 'index.html';
        } else {
          alert('Error al guardar el pedido en el servidor.');
        }
      } catch (err) {
        console.error("Error de conexión:", err);
        alert("No se pudo conectar con el servidor de Node.js. ¿Está encendido?");
      }
    });
  };

  // --- PÁGINA DE ADMINISTRACIÓN (LECTURA DE BASE DE DATOS) ---
  const initAdminPage = () => {
    const container = document.getElementById('pedidosList');
    
    const cargarPedidosDB = async () => {
        if (!container) return;
        try {
            const res = await fetch('http://localhost:3000/api/pedidos');
            const lista = await res.json();
            
            if (lista.length === 0) {
                container.innerHTML = '<div class="empty">No hay pedidos registrados en la base de datos.</div>';
                return;
            }

            container.innerHTML = lista.map(p => `
                <div class="table-row">
                    <span>#${p.id}</span>
                    <span>${p.cliente}</span>
                    <span class="small">${p.productos}</span>
                    <strong>${Number(p.total).toLocaleString()} COP</strong>
                    <span class="success">${p.estado}</span>
                </div>
            `).join('');
        } catch (err) {
            console.error("Error al cargar pedidos:", err);
        }
    };

    if (container) cargarPedidosDB();
  };

  // --- INICIO ---
  const init = () => {
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

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();