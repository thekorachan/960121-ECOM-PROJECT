(function (window, document) {
  "use strict";

  const normalizePrice = (priceText) => {
    const amount = Number(String(priceText).replace(/[^0-9.]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
  };

  const slugify = (value) =>
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getImageUrl = (product) => {
    const image = product.image_url || product.image || "";

    if (!image || image === "xxx") {
      return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85";
    }

    return image;
  };

  const formatPrice = (product) => {
    const price = Number(product.price);

    if (!Number.isFinite(price)) {
      return "";
    }

    return `$${price.toLocaleString("en-US")}`;
  };

  const formatRating = (value) => (Number(value) || 0).toFixed(1).replace(/\.0$/, "");
  const createStars = (rating) => {
    const rounded = Math.round((Number(rating) || 0) * 2) / 2;

    return Array.from({ length: 5 }, (_, index) => index + 1 <= rounded ? "★" : "☆").join("");
  };

  const createRatingMarkup = (product) => {
    const reviewCount = Number(product.reviews) || 0;

    if (!reviewCount) {
      return "";
    }

    return `<div class="product-rating" aria-label="Rating ${formatRating(product.rating)} out of 5 from ${reviewCount} reviews"><span>${createStars(product.rating)}</span><small>(${reviewCount})</small></div>`;
  };

  const getProductSearchText = (product) => [
    product.name,
    product.variant,
    product.category,
    product.description,
  ].join(" ").toLowerCase();

  const isDenimProduct = (product) => /denim|jean|chambray|indigo|wash/.test(getProductSearchText(product));
  const colorRules = [
    ["white", /white|ivory/i],
    ["black", /black|charcoal|graphite/i],
    ["blue", /blue|navy|indigo|wash|denim/i],
    ["gray", /grey|gray|heather/i],
    ["green", /olive|green/i],
    ["neutral", /cream|stone|natural|sand|khaki|oat|beige|brown/i],
  ];
  const colorLabels = {
    white: "White",
    black: "Black",
    blue: "Blue",
    gray: "Gray",
    green: "Green",
    neutral: "Neutral",
  };
  const defaultSizes = ["XS", "S", "M", "L", "XL"];
  let loadedProducts = [];

  const getColorKey = (product) => {
    const text = getProductSearchText(product);
    const match = colorRules.find(([, pattern]) => pattern.test(text));

    return match ? match[0] : "neutral";
  };

  const getColorKeys = (product) => {
    const text = getProductSearchText(product);
    const matches = colorRules
      .filter(([, pattern]) => pattern.test(text))
      .map(([key]) => key);

    return matches.length ? matches : ["neutral"];
  };

  const normalizeList = (value, fallback = []) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value.split(/[,/|]+/).map((item) => item.trim()).filter(Boolean);
    }

    return fallback;
  };

  const normalizeProduct = (product, index) => {
    const name = product.name || `Product ${index + 1}`;
    const id = product.id || product.slug || slugify(name) || `product-${index + 1}`;
    const variant = product.variant || product.category || product.description || "";
    const priceText = product.priceText || formatPrice(product);

    return {
      id: String(id),
      name,
      variant,
      price: Number(product.price) || normalizePrice(priceText),
      priceText,
      image: getImageUrl(product),
      category: product.category || "",
      description: product.description || "",
      badge: product.badge || (Number(product.stock) > 0 ? "In Stock" : ""),
      reviews: Number(product.review_count || product.reviews) || 0,
      rating: Number(product.rating) || 0,
      stock: Number(product.stock) || 0,
      colorKey: getColorKey(product),
      colorKeys: getColorKeys(product),
      sizeKeys: normalizeList(product.sizes || product.size, defaultSizes).map((size) => size.toUpperCase()),
      quantity: 1,
    };
  };

  const createProductCard = (product, index) => {
    const normalizedProduct = normalizeProduct(product, index);

    return `
      <article class="product-card" data-product-id="${escapeHtml(normalizedProduct.id)}">
        <div class="product-media">
          <img src="${escapeHtml(normalizedProduct.image)}" alt="${escapeHtml(normalizedProduct.name)}">
        </div>
        <div class="product-info">
          <h3>${escapeHtml(normalizedProduct.name)}</h3>
          <div class="product-meta">
            <span>${escapeHtml(normalizedProduct.variant)}</span>
            <span>${escapeHtml(normalizedProduct.priceText)}</span>
          </div>
          <div class="swatches" aria-label="Available colors">
            <span class="swatch white"></span>
            <span class="swatch"></span>
          </div>
          ${createRatingMarkup(normalizedProduct)}
          <button class="add-button" type="button">Add to bag</button>
        </div>
      </article>
    `;
  };

  const getProductFromCard = (card, index) => {
    const title = card.querySelector("h3")?.textContent.trim() || `Product ${index + 1}`;
    const metaItems = Array.from(card.querySelectorAll(".product-meta span")).map((item) =>
      item.textContent.trim()
    );
    const image = card.querySelector("img");
    const id = card.dataset.productId || slugify(title) || `product-${index + 1}`;

    if (!card.dataset.productId) {
      card.dataset.productId = id;
    }

    return {
      id,
      name: title,
      variant: metaItems[0] || "",
      price: normalizePrice(metaItems[1] || ""),
      priceText: metaItems[1] || "",
      image: image ? image.currentSrc || image.src : "",
      colorKey: "white",
      colorKeys: ["white"],
      sizeKeys: defaultSizes,
      reviews: 0,
      rating: 0,
      quantity: 1,
    };
  };

  const getProductsFromDom = () =>
    Array.from(document.querySelectorAll(".product-card")).map((card, index) =>
      getProductFromCard(card, index)
    );

  const updateProductCount = (products) => {
    const count = document.querySelector("#products-count");

    if (count) {
      count.textContent = `${products.length} items`;
    }
  };

  const findCardProduct = (button) => {
    const card = button.closest(".product-card");

    if (!card) {
      return null;
    }

    const cards = Array.from(document.querySelectorAll(".product-card"));
    const product = getProductFromCard(card, cards.indexOf(card));

    return loadedProducts.find((item) => item.id === product.id) || product;
  };

  const renderProductGrid = (grid, products, emptyMessage) => {
    if (!grid) {
      return false;
    }

    if (!Array.isArray(products) || !products.length) {
      grid.innerHTML = `<p class="home-products-status">${escapeHtml(emptyMessage)}</p>`;
      return false;
    }

    grid.innerHTML = products.map(createProductCard).join("");
    return true;
  };

  const renderProducts = (products) => {
    const grid = document.querySelector("#products-grid");
    const denimGrid = document.querySelector("#denim-products-grid");
    const normalizedProducts = Array.isArray(products)
      ? products.map(normalizeProduct)
      : [];
    const denimProducts = normalizedProducts.filter(isDenimProduct);
    loadedProducts = normalizedProducts;

    if (!grid || !normalizedProducts.length) {
      renderProductGrid(grid, [], "No database products are available right now.");
      renderProductGrid(denimGrid, [], "No denim products are available in the database yet.");
      updateProductCount([]);
      return false;
    }

    renderProductGrid(grid, normalizedProducts, "No database products are available right now.");
    renderProductGrid(denimGrid, denimProducts, "No denim products are available in the database yet.");
    updateProductCount(normalizedProducts);

    return true;
  };

  const loadProducts = async () => {
    if (!window.api || !window.api.getProducts) {
      const domProducts = getProductsFromDom();
      loadedProducts = domProducts;
      updateProductCount(domProducts);
      return domProducts;
    }

    try {
      const products = await window.api.getProducts();

      if (Array.isArray(products) && products.length) {
        renderProducts(products);
        return loadedProducts;
      }
    } catch (error) {
      renderProducts([]);
      return [];
    }

    renderProducts([]);
    return [];
  };

  const createPriceMarkup = (product) => {
    const priceText = product.priceText || `$${Number(product.price || 0).toLocaleString("en-US")}`;
    return `<strong>${escapeHtml(priceText)}</strong>`;
  };

  const createSwatchOptions = (product) => {
    const colors = (product.colorKeys || [product.colorKey || getColorKey(product)])
      .filter(Boolean)
      .filter((name, index, list) => list.indexOf(name) === index)
      .slice(0, 4);

    return colors.map((name) => {
      const label = colorLabels[name] || name;
      return `<button class="detail-swatch-option" type="button" data-detail-option="color" data-option-value="${escapeHtml(label)}" aria-pressed="false"><span class="swatch ${escapeHtml(name)}" aria-hidden="true"></span>${escapeHtml(label)}</button>`;
    }).join("");
  };

  const getSelectedOptions = () => ({
    color: document.querySelector('[data-detail-option="color"].is-selected')?.dataset.optionValue || "",
    size: document.querySelector('[data-detail-option="size"].is-selected')?.dataset.optionValue || "",
  });

  const getCurrentUser = () => window.api?.getAuthUser ? window.api.getAuthUser() : null;
  const getProductId = (product) => Number(product.baseId || product.productId || product.product_id || product.id);

  const renderReviewList = (payload, append = false) => {
    const list = document.querySelector("[data-review-list]");
    const moreButton = document.querySelector("[data-review-more]");
    const summary = document.querySelector("[data-review-summary]");
    const purchasedMarker = document.querySelector("[data-purchased-marker]");
    const writeButton = document.querySelector("[data-review-write]");
    const eligibility = document.querySelector("[data-review-eligibility]");
    const form = document.querySelector("[data-review-form]");
    const reviews = Array.isArray(payload?.reviews) ? payload.reviews : [];
    const total = Number(payload?.total) || 0;
    const renderedCount = (append ? list?.querySelectorAll(".product-review-item").length || 0 : 0) + reviews.length;

    if (summary) {
      const rating = Number(payload?.summary?.rating) || 0;
      const reviewCount = Number(payload?.summary?.review_count) || 0;
      summary.innerHTML = reviewCount
        ? `<span aria-hidden="true">${createStars(rating)}</span><strong>${formatRating(rating)} / 5</strong><small>${reviewCount} reviews</small>`
        : "<strong>No reviews yet</strong><small>Be the first verified buyer to review this item.</small>";
    }

    if (purchasedMarker) purchasedMarker.hidden = !payload?.purchased;
    if (form) form.hidden = true;
    if (writeButton) {
      writeButton.hidden = !payload?.canReview;
      writeButton.textContent = payload?.hasReviewed ? "Edit review" : "Write a review";
    }
    if (eligibility) {
      eligibility.hidden = Boolean(payload?.canReview);
      const user = getCurrentUser();
      eligibility.textContent = payload?.purchased
        ? ""
        : user?.email
          ? `You are signed in as ${user.email}. We could not verify a purchase for this account yet.`
          : "Sign in with the account used for purchase to review this item.";
    }

    const markup = reviews.map((review) => `
      <article class="product-review-item">
        <div><strong>${escapeHtml(review.author || "Verified buyer")}</strong><span aria-label="${escapeHtml(String(review.rating))} out of 5 stars">${createStars(review.rating)}</span></div>
        ${review.text ? `<p>${escapeHtml(review.text)}</p>` : ""}
        <small>${escapeHtml(String(review.updatedAt || review.createdAt || "").slice(0, 10))}</small>
      </article>
    `).join("");

    if (list) {
      if (!append) {
        list.innerHTML = markup || '<p class="product-review-empty">No reviews yet.</p>';
      } else if (markup) {
        list.insertAdjacentHTML("beforeend", markup);
      }
    }

    if (moreButton) {
      moreButton.hidden = renderedCount >= total;
      moreButton.dataset.reviewOffset = String(renderedCount);
    }
  };

  const loadProductReviews = async (product, offset = 0) => {
    const productId = getProductId(product);
    const user = getCurrentUser();
    const list = document.querySelector("[data-review-list]");

    if (!productId || !window.api?.getProductReviews) {
      if (list) list.innerHTML = '<p class="product-review-empty">Reviews are unavailable.</p>';
      return null;
    }

    if (list && !offset) {
      list.textContent = "Loading reviews...";
    }

    try {
      const payload = await window.api.getProductReviews(productId, {
        userId: user?.id,
        userEmail: user?.email,
        limit: 3,
        offset,
      });

      renderReviewList(payload, offset > 0);
      return payload;
    } catch (error) {
      if (list && !offset) list.innerHTML = '<p class="product-review-empty">Could not load reviews.</p>';
      return null;
    }
  };

  const updateProductReviewSummary = (product, payload) => {
    const productId = String(getProductId(product));
    const rating = Number(payload?.summary?.rating) || 0;
    const reviews = Number(payload?.summary?.review_count) || 0;
    const updatedProducts = loadedProducts.map((item) => String(getProductId(item)) === productId ? { ...item, rating, reviews } : item);

    renderProducts(updatedProducts);
  };

  const updateDetailAddState = () => {
    const selected = getSelectedOptions();
    const addButton = document.querySelector("[data-detail-add]");
    const message = document.querySelector("[data-detail-choice-message]");
    const isReady = Boolean(selected.color && selected.size);

    if (addButton) {
      addButton.disabled = !isReady;
    }

    if (message) {
      message.textContent = isReady ? `Selected: ${selected.color} / ${selected.size}` : "Please choose color and size before adding.";
      message.classList.toggle("is-ready", isReady);
    }
  };

  const selectDetailOption = (button) => {
    const optionType = button.dataset.detailOption;
    const group = button.closest(optionType === "color" ? ".detail-swatches" : ".detail-size-list");

    if (!group) {
      return;
    }

    group.querySelectorAll("[data-detail-option]").forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });

    updateDetailAddState();
  };

  const createSelectedProduct = (product) => {
    const selected = getSelectedOptions();
    const variantParts = [selected.color, selected.size].filter(Boolean);
    const optionId = variantParts.map(slugify).filter(Boolean).join("-");

    return {
      ...product,
      id: optionId ? `${product.id}-${optionId}` : product.id,
      baseId: product.id,
      selectedColor: selected.color,
      selectedSize: selected.size,
      variant: variantParts.length ? variantParts.join(" / ") : product.variant,
    };
  };

  const closeProductSelection = () => {
    const drawer = document.querySelector("#product-detail-drawer");
    document.body.classList.remove("product-detail-open");

    if (drawer) {
      drawer.setAttribute("aria-hidden", "true");
    }
  };

  const openProductSelection = (product) => {
    const drawer = document.querySelector("#product-detail-drawer");
    const content = document.querySelector("#product-detail-content");
    const normalizedProduct = normalizeProduct(product || {}, 0);

    if (!drawer || !content || !normalizedProduct.id) {
      return false;
    }

    const sizes = (normalizedProduct.sizeKeys || defaultSizes).map((size) => `<button type="button" data-detail-option="size" data-option-value="${escapeHtml(size)}" aria-pressed="false">${escapeHtml(size)}</button>`).join("");
    const stockText = Number(normalizedProduct.stock) > 0 ? `${Number(normalizedProduct.stock)} in stock` : normalizedProduct.badge || "Available";
    const reviewCount = Number(normalizedProduct.reviews) || 0;

    content.innerHTML = `
      <div class="product-detail-media">
        <img src="${escapeHtml(normalizedProduct.image)}" alt="${escapeHtml(normalizedProduct.name)}">
      </div>
      <div class="product-detail-content">
        <div class="product-detail-header">
          <div>
            <p>${escapeHtml(normalizedProduct.category || "Core")}</p>
            <h2 id="product-detail-title">${escapeHtml(normalizedProduct.name)}</h2>
          </div>
          <button class="product-detail-close" type="button" data-detail-close aria-label="Close product details">x</button>
        </div>
        <div class="product-price-line">${createPriceMarkup(normalizedProduct)}</div>
        <p class="product-detail-description">${escapeHtml(normalizedProduct.description || normalizedProduct.variant || "Clean everyday shape with an easy MONOFORM fit.")}</p>
        <div class="product-detail-rating" data-review-summary aria-label="${reviewCount ? `Rating ${formatRating(normalizedProduct.rating)} out of 5` : "No reviews yet"}">
          ${reviewCount ? `<span aria-hidden="true">${createStars(normalizedProduct.rating)}</span><strong>${formatRating(normalizedProduct.rating)} / 5</strong><small>${reviewCount} reviews</small>` : "<strong>No reviews yet</strong><small>Be the first verified buyer to review this item.</small>"}
        </div>
        <section class="product-detail-section" aria-label="Available colors">
          <h3>Color</h3>
          <div class="detail-swatches">${createSwatchOptions(normalizedProduct)}</div>
        </section>
        <section class="product-detail-section" aria-label="Available sizes">
          <h3>Size</h3>
          <div class="detail-size-list">${sizes}</div>
        </section>
        <p class="product-detail-choice-message" data-detail-choice-message>Please choose color and size before adding.</p>
        <div class="product-detail-meta">
          <p><span>Availability</span>${escapeHtml(stockText)}</p>
        </div>
        <section class="product-detail-section product-review-section" aria-label="Customer reviews">
          <div class="product-review-heading">
            <h3>Reviews</h3>
            <span data-purchased-marker hidden>Purchased</span>
          </div>
          <button class="product-review-write" type="button" data-review-write hidden>Write a review</button>
          <div class="product-review-list" data-review-list>Loading reviews...</div>
          <button class="product-review-more" type="button" data-review-more hidden>View more</button>
          <p class="product-review-empty" data-review-eligibility hidden></p>
          <form class="product-review-form" data-review-form hidden>
            <fieldset class="product-review-rating">
              <legend>Rating</legend>
              <div class="product-review-rating-options">
                <label><input type="radio" name="rating" value="5" checked required aria-label="5 out of 5 stars"><span aria-hidden="true">★</span></label>
                <label><input type="radio" name="rating" value="4" aria-label="4 out of 5 stars"><span aria-hidden="true">★</span></label>
                <label><input type="radio" name="rating" value="3" aria-label="3 out of 5 stars"><span aria-hidden="true">★</span></label>
                <label><input type="radio" name="rating" value="2" aria-label="2 out of 5 stars"><span aria-hidden="true">★</span></label>
                <label><input type="radio" name="rating" value="1" aria-label="1 out of 5 stars"><span aria-hidden="true">★</span></label>
              </div>
            </fieldset>
            <label class="product-review-text">
              <span>Review</span>
              <textarea name="text" rows="3" maxlength="2000" placeholder="Share your thoughts"></textarea>
            </label>
            <div class="product-review-submit-row">
              <button type="submit">Post review</button>
              <p data-review-form-status aria-live="polite"></p>
            </div>
          </form>
        </section>
        <div class="product-detail-actions">
          <button class="product-detail-add" type="button" data-detail-add disabled>Add to bag</button>
        </div>
      </div>
    `;

    drawer.dataset.product = JSON.stringify(normalizedProduct);
    document.body.classList.add("product-detail-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.focus();
    loadProductReviews(normalizedProduct, 0);
    return true;
  };

  const submitProductReview = async (form) => {
    const drawer = document.querySelector("#product-detail-drawer");
    const product = drawer?.dataset.product ? JSON.parse(drawer.dataset.product) : null;
    const user = getCurrentUser();
    const status = form.querySelector("[data-review-form-status]");
    const productId = product ? getProductId(product) : null;

    if (!user?.id || !productId || !window.api?.saveProductReview) {
      if (status) status.textContent = "Sign in and purchase this item before reviewing.";
      return;
    }

    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) submitButton.disabled = true;
    if (status) status.textContent = "Saving review...";

    try {
      await window.api.saveProductReview(productId, {
        userId: user.id,
        userEmail: user.email,
        rating: Number(formData.get("rating")),
        text: String(formData.get("text") || ""),
      });
      form.reset();
      if (status) status.textContent = "Review saved.";
      const payload = await loadProductReviews(product, 0);
      if (payload) {
        updateProductReviewSummary(product, payload);
      }
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save review.";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };

  const paintReviewStars = (container, rating, className) => {
    if (!container) return;

    container.querySelectorAll("label").forEach((label) => {
      const value = Number(label.querySelector('input[name="rating"]')?.value) || 0;
      const isActive = value <= rating;
      const star = label.querySelector("span");
      label.classList.toggle(className, isActive);
      label.style.setProperty("transform", isActive ? `scale(${className === "is-preview" ? "1.14" : "1.04"})` : "scale(1)", "important");
      label.style.setProperty("width", isActive ? `${className === "is-preview" ? "38" : "34"}px` : "32px", "important");
      label.style.setProperty("height", isActive ? `${className === "is-preview" ? "40" : "36"}px` : "34px", "important");

      if (!star) return;

      star.style.setProperty("color", isActive ? "#9c6b10" : "#c8c8c8", "important");
      star.style.setProperty("-webkit-text-fill-color", isActive ? "#9c6b10" : "#c8c8c8", "important");
      star.style.setProperty("text-shadow", isActive ? "0 3px 8px rgba(156, 107, 16, 0.24)" : "none", "important");
      star.style.setProperty("transform", isActive ? `scale(${className === "is-preview" ? "1.18" : "1.06"})` : "scale(1)", "important");
      star.style.setProperty("font-size", isActive ? `${className === "is-preview" ? "30" : "27"}px` : "25px", "important");
    });
  };

  const clearReviewStarPreview = (container) => {
    if (!container) return;

    container.classList.remove("is-previewing");
    container.querySelectorAll("label").forEach((label) => label.classList.remove("is-preview"));
    updateReviewStarSelection(container);
  };

  const updateReviewStarSelection = (container) => {
    if (!container) return;

    const rating = Number(container.querySelector('input[name="rating"]:checked')?.value) || 0;
    container.querySelectorAll("label").forEach((label) => label.classList.remove("is-selected"));
    paintReviewStars(container, rating, "is-selected");
  };

  document.addEventListener("click", (event) => {
    const detailOption = event.target.closest("[data-detail-option]");

    if (detailOption) {
      selectDetailOption(detailOption);
      return;
    }

    if (event.target.closest("[data-detail-close]")) {
      closeProductSelection();
      return;
    }

    if (event.target.closest("[data-review-more]")) {
      const drawer = document.querySelector("#product-detail-drawer");
      const product = drawer?.dataset.product ? JSON.parse(drawer.dataset.product) : null;
      const offset = Number(event.target.closest("[data-review-more]").dataset.reviewOffset) || 0;

      if (product) {
        loadProductReviews(product, offset);
      }

      return;
    }

    if (event.target.closest("[data-review-write]")) {
      const form = document.querySelector("[data-review-form]");
      form.hidden = false;
      updateReviewStarSelection(form.querySelector(".product-review-rating-options"));
      form.querySelector("textarea")?.focus();
      return;
    }

    if (event.target.closest("[data-detail-add]")) {
      const drawer = document.querySelector("#product-detail-drawer");
      const savedProduct = drawer?.dataset.product ? JSON.parse(drawer.dataset.product) : null;

      if (savedProduct && window.cartService.addItem(createSelectedProduct(savedProduct))) {
        closeProductSelection();
        window.cartService.openBagDrawer();
      }
    }
  });

  document.addEventListener("mouseover", (event) => {
    const label = event.target.closest(".product-review-rating-options label");

    if (!label) return;

    const container = label.closest(".product-review-rating-options");
    const rating = Number(label.querySelector('input[name="rating"]')?.value) || 0;
    container.classList.add("is-previewing");
    container.querySelectorAll("label").forEach((item) => item.classList.remove("is-preview"));
    paintReviewStars(container, rating, "is-preview");
  });

  document.addEventListener("mouseout", (event) => {
    const container = event.target.closest(".product-review-rating-options");

    if (!container || container.contains(event.relatedTarget)) return;

    clearReviewStarPreview(container);
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest('.product-review-rating-options input[name="rating"]');

    if (!input) return;

    updateReviewStarSelection(input.closest(".product-review-rating-options"));
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-review-form]");

    if (!form) {
      return;
    }

    event.preventDefault();
    submitProductReview(form);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProductSelection();
    }
  });

  window.productService = {
    findCardProduct,
    getProductsFromDom,
    loadProducts,
    openProductSelection,
    renderProducts,
  };
})(window, document);
