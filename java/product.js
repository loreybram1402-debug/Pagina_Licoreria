(() => {
  const formatPrice = (value) => {
    const n = Number(value) || 0;
    return `$${n.toFixed(2)}`;
  };

  const getProductDetailHref = (id) => {
    const path = String(window.location.pathname || '');
    const inPagesFolder = path.includes('');
    return inPagesFolder ? `product.html?id=${id}` : `product.html?id=${id}`;
  };

  const escapeHtml = (value) => {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const productImageMarkup = (product) => {
    const name = product?.name ? String(product.name) : 'Product';
    const initial = escapeHtml(name.trim().slice(0, 1).toUpperCase() || 'P');
    const src = product?.image ? String(product.image) : '';

    if (!src) {
      return `<div class="img-placeholder" aria-label="${escapeHtml(name)}">${initial}</div>`;
    }

    return `<img class="product-img" src="${escapeHtml(src)}" alt="${escapeHtml(name)}" onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\"img-placeholder\\">${initial}</div>');" />`;
  };

  const productCardMarkup = (product, { showCategory = true, showView = true } = {}) => {
    const id = Number(product.id);
    const name = escapeHtml(product.name);
    const category = escapeHtml(product.category || '');

    return `
      <article class="card">
        <div class="card-media">
          ${productImageMarkup(product)}
        </div>
        <div class="card-body">
          <h3 class="card-title">${name}</h3>
          ${showCategory ? `<div class="muted small">${category}</div>` : ''}
          <div class="card-row">
            <strong>${formatPrice(product.price)}</strong>
            <span class="muted small">Stock: ${Number(product.stock) || 0}</span>
          </div>
          <div class="card-actions">
            <button class="btn primary" data-action="add-to-cart" data-product-id="${id}">Add to cart</button>
            ${showView ? `<a class="btn" href="${getProductDetailHref(id)}">View</a>` : ''}
          </div>
        </div>
      </article>
    `.trim();
  };

  const renderGrid = (products, container, options) => {
    if (!container) return;
    const list = Array.isArray(products) ? products : [];
    if (list.length === 0) {
      container.innerHTML = `<div class="empty">No products found.</div>`;
      return;
    }
    container.innerHTML = list.map((p) => productCardMarkup(p, options)).join('');
  };

  const renderFeatured = (products, container) => {
    const list = Array.isArray(products) ? products.slice(0, 3) : [];
    renderGrid(list, container, { showCategory: true, showView: true });
  };

  const renderCatalog = ({ products, gridEl, categoryEl, searchEl } = {}) => {
    const all = Array.isArray(products) ? products : [];
    const categories = Array.from(new Set(all.map((p) => p.category).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b)));

    if (categoryEl) {
      const options = ['All', ...categories].map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      categoryEl.innerHTML = options;
    }

    const apply = () => {
      const term = searchEl ? String(searchEl.value || '').trim().toLowerCase() : '';
      const selected = categoryEl ? String(categoryEl.value || 'All') : 'All';
      const filtered = all.filter((p) => {
        const okCategory = selected === 'All' ? true : String(p.category) === selected;
        const okTerm = !term
          ? true
          : String(p.name || '').toLowerCase().includes(term) || String(p.description || '').toLowerCase().includes(term);
        return okCategory && okTerm;
      });
      renderGrid(filtered, gridEl, { showCategory: true, showView: true });
    };

    if (categoryEl) categoryEl.addEventListener('change', apply);
    if (searchEl) searchEl.addEventListener('input', apply);
    apply();
  };

  const renderProductDetail = (product, container) => {
    if (!container) return;
    if (!product) {
      container.innerHTML = `<div class="empty">Product not found.</div>`;
      return;
    }
    const id = Number(product.id);
    container.innerHTML = `
      <div class="product-layout">
        <div class="product-media">
          ${productImageMarkup(product)}
        </div>
        <div class="product-info">
          <h1 class="h2">${escapeHtml(product.name)}</h1>
          <div class="muted">${escapeHtml(product.category || '')}</div>
          <p class="mt">${escapeHtml(product.description || '')}</p>
          <div class="product-meta">
            <strong class="price">${formatPrice(product.price)}</strong>
            <span class="muted">Stock: ${Number(product.stock) || 0}</span>
          </div>
          <div class="product-buy">
            <label class="field">
              <span class="muted small">Qty</span>
              <input id="productQty" type="number" min="1" value="1" />
            </label>
            <button class="btn primary" data-action="add-to-cart" data-product-id="${id}" data-qty-input="#productQty">Add to cart</button>
            <a class="btn" href="catalog.html">Back to catalog</a>
          </div>
        </div>
      </div>
    `.trim();
  };

  window.StoreProducts = {
    formatPrice,
    renderFeatured,
    renderCatalog,
    renderProductDetail
  };
})();

window.StoreProducts = {
  // Función para formatear el precio a pesos colombianos (opcional)
  formatPrice: (n) => `$${Number(n).toLocaleString('es-CO')}`,

  renderCatalog: function({ products, gridEl, categoryEl, searchEl }) {
    if (!gridEl) return;

    // 1. OBTENER LOS VALORES DE BÚSQUEDA
    const searchText = searchEl?.value.toLowerCase() || '';
    const categoryValue = categoryEl?.value || '';

    // 2. FILTRAR LOS PRODUCTOS
    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchText);
      const matchCategory = categoryValue === '' || p.category === categoryValue;
      return matchSearch && matchCategory;
    });

    // 3. LIMPIAR EL CONTENEDOR Y DIBUJAR
    gridEl.innerHTML = '';

    if (filtered.length === 0) {
      gridEl.innerHTML = '<p class="muted">No se encontraron licores que coincidan.</p>';
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-media">
          <div class="img-placeholder">
            <img src="${p.image || 'placeholder.jpg'}" alt="${p.name}">
          </div>
          <div class="card-body">
            <h3 class="card-title">${p.name}</h3>
            <div class="muted small">${p.category}</div>
            <div class="card-row">
              <strong>${this.formatPrice(p.price)}</strong>
              <span class="muted small">Stock: ${p.stock}</span>
            </div>
            <div class="card-actions">
              <button class="btn primary" data-action="add-to-cart" data-product-id="${p.id}">Agregar al carrito</button>
              <a class="btn" href="product.html?id=${p.id}">Ver detalles</a>
            </div>
          </div>
        </div>
      `;
      gridEl.appendChild(card);
    });
  }
};
const initProductPage = () => {
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get('id'));
    const container = document.getElementById('productDetail');

    if (!container) return;

 
    const products = window.StoreData.seedProductsIfMissing();
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = '<h2>Producto no encontrado</h2>';
        return;
    }

  
    container.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" style="max-width:300px;">
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="category">${product.category}</p>
                <p class="description">${product.description || 'Sin descripción disponible.'}</p>
                <p class="price"><strong>${product.price.toLocaleString()} COP</strong></p>
                <button class="btn primary" data-action="add-to-cart" data-product-id="${product.id}">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;
};


window.addEventListener('DOMContentLoaded', initProductPage);