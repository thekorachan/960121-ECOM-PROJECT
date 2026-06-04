(function (window, document) {
  "use strict";

  const pageSize = 12;
  const images = [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1506629905607-d7e0881763f4?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=85",
  ];
  const productSource = [
    ["Varsity Logo Graphic Relaxed Sweater", "White / Cream", 68, 98, "Best Seller", 42],
    ["90s Denim Shorts", "Light wash", 84, 108, "Best Seller", 88],
    ["Classic Trucker Jacket", "Medium wash", 98, 140, "Best Seller", 120],
    ["Monogram Relaxed Tee", "White", 52, 68, "New Arrival", 31],
    ["Baggy Cotton Stretch Pants", "Stone", 74, 99, "", 18],
    ["Linen Cotton Button-Down Shirt", "Natural", 88, 120, "Best Seller", 51],
    ["90s Straight Chino Pants", "Charcoal", 78, 108, "New Arrival", 26],
    ["Cotton Blend Relaxed T-Shirt", "Black", 40, 54, "", 64],
    ["Printed Tech Short", "Navy", 58, 79, "", 29],
    ["Linen Cotton Button-Down Shirt", "Sky blue", 88, 120, "New Arrival", 43],
    ["90s Baggy Chino Shorts", "Khaki", 64, 88, "", 36],
    ["Classic Harrington Jacket", "Black", 118, 158, "Best Seller", 72],
    ["Straight Bright Jeans", "Indigo", 108, 148, "Best Seller", 103],
    ["Premium Terry Relaxed Sweatshirt", "Heather grey", 86, 118, "", 56],
    ["Chambray Pull-On Shirt", "Washed blue", 72, 98, "New Arrival", 22],
    ["Linen Blend Polo Sweater", "Ivory", 94, 130, "", 39],
    ["Relaxed Oxford Shirt", "White", 76, 98, "", 81],
    ["Utility Overshirt", "Olive", 112, 148, "New Arrival", 24],
    ["Core Rib Tank", "White", 34, 48, "", 18],
    ["Straight Twill Trouser", "Black", 92, 128, "Best Seller", 47],
    ["Washed Denim Shirt", "Vintage wash", 86, 118, "", 52],
    ["Lightweight Bomber Jacket", "Sand", 128, 168, "New Arrival", 28],
    ["Cotton Crew Socks Pack", "White / Black", 22, 32, "", 12],
    ["Logo Canvas Tote", "Natural", 48, 68, "", 35],
    ["Relaxed Workwear Shirt", "Graphite", 82, 108, "Best Seller", 65],
    ["Summer Camp Collar Shirt", "White", 78, 104, "New Arrival", 21],
    ["Soft Drawstring Shorts", "Oat", 58, 78, "", 45],
    ["Tapered Utility Pants", "Olive", 98, 128, "", 33],
  ];

  const categoryRules = [
    ["accessories", /tote|bag|sock|eyewear|cap|belt|accessor/i],
    ["underwear", /underwear|brief|boxer|tank/i],
    ["outerwear", /jacket|bomber|harrington|overshirt|trucker/i],
    ["denim", /denim|jean|chambray/i],
    ["bottoms", /pant|trouser|short|chino/i],
    ["tops", /shirt|tee|t-shirt|sweater|sweatshirt|polo|knit/i],
  ];
  const audienceRules = [
    ["women", /\bwomen\b|\bwoman\b|\blady\b|\bladies\b|\bfemale\b/i],
    ["men", /\bmen\b|\bman\b|\bmens\b|\bmale\b/i],
  ];
  const colorRules = [
    ["white", /white|ivory/i],
    ["black", /black|charcoal|graphite/i],
    ["blue", /blue|navy|indigo|wash|denim/i],
    ["gray", /grey|gray|heather/i],
    ["green", /olive|green/i],
    ["neutral", /cream|stone|natural|sand|khaki|oat|beige|brown/i],
  ];
  const sizesByIndex = [
    ["S", "M", "L"],
    ["XS", "S", "M", "L"],
    ["M", "L", "XL"],
    ["S", "M", "L", "XL"],
  ];
  const defaultSizes = ["XS", "S", "M", "L", "XL"];
  const swatchOptions = ["white", "gray", "stone", "denim", "black"];
  const colorLabels = {
    white: "White",
    black: "Black",
    blue: "Blue",
    denim: "Blue",
    gray: "Gray",
    green: "Green",
    neutral: "Neutral",
    stone: "Neutral",
  };

  const slugify = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const firstMatchingRule = (value, rules, fallback) => {
    const match = rules.find(([, pattern]) => pattern.test(value));
    return match ? match[0] : fallback;
  };

  const matchingRules = (value, rules, fallback = []) => {
    const matches = rules
      .filter(([, pattern]) => pattern.test(value))
      .map(([key]) => key);

    return matches.length ? matches : fallback;
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

  const getProductMeta = (product, index) => {
    const text = [product.name, product.variant, product.category, product.description, product.badge].join(" ");
    const category = slugify(product.category);
    const normalizedCategory = categoryRules.some(([key]) => key === category)
      ? category
      : firstMatchingRule(text, categoryRules, "tops");
    const audience = firstMatchingRule(text, audienceRules, "");
    const colorKeys = matchingRules(text, colorRules, ["neutral"]);
    const color = colorKeys[0];
    const sizes = normalizeList(product.sizes || product.size, product.id ? defaultSizes : sizesByIndex[index % sizesByIndex.length]);
    const badge = slugify(product.badge);
    const collection = badge.includes("new")
      ? "new-arrival"
      : badge.includes("best")
        ? "best-seller"
        : Number(product.comparePrice) > Number(product.price)
          ? "sale"
          : "core";

    return {
      categoryKey: normalizedCategory,
      audienceKey: audience,
      colorKey: color,
      colorKeys,
      sizeKeys: sizes.map((size) => size.toUpperCase()),
      collectionKey: collection || "core",
    };
  };

  const fallbackProducts = productSource.map(([name, variant, price, comparePrice, badge, reviews], index) => ({
    id: `catalog-${index + 1}`,
    name,
    variant,
    price,
    comparePrice,
    priceText: `$${price}`,
    badge,
    reviews: 0,
    rating: 0,
    image: images[index % images.length],
    colorCount: 1 + (index % 6),
    category: "",
    description: variant,
    index,
    quantity: 1,
  })).map((product, index) => ({ ...product, ...getProductMeta(product, index) }));

  let products = [...fallbackProducts];
  let visibleProducts = [...products];
  let renderedCount = 0;
  let isLoading = false;
  let currentSort = "featured";
  let debounceTimer;
  const filters = {
    keyword: "",
    category: "",
    priceRange: "",
    color: "",
    size: "",
    collection: "",
    audience: "",
    minPrice: "",
    maxPrice: "",
  };

  const filterLabels = {
    "gender:men": "Men's Clothing + Accessories",
    "gender:women": "Women's Clothing + Accessories",
    "category:denim": "Denim",
    "category:accessories": "Accessories",
    "collection:new-arrival": "New Arrivals",
    "collection:core": "Essentials",
  };

  const setCatalogHeading = (label) => {
    if (!label) {
      return;
    }

    const title = document.querySelector("#catalog-title");

    if (title) {
      title.textContent = label;
    }

    document.title = `${label} | MONOFORM`;
  };

  const getInitialUrlFilters = () => {
    const params = new URLSearchParams(window.location.search);
    const hashValue = slugify(window.location.hash.replace(/^#/, ""));
    const gender = slugify(params.get("gender") || params.get("audience") || "");
    const category = slugify(params.get("category") || "");
    const collection = slugify(params.get("collection") || "");
    const sort = slugify(params.get("sort") || "");
    const keyword = String(params.get("keyword") || "").trim();
    const initial = {};

    if (["men", "women"].includes(gender)) {
      initial.audience = gender;
      initial.label = filterLabels[`gender:${gender}`];
    }

    if (["men", "women"].includes(category)) {
      initial.audience = category;
      initial.label = filterLabels[`gender:${category}`];
    } else if (["tops", "bottoms", "underwear", "outerwear", "denim", "accessories"].includes(category)) {
      initial.category = category;
      initial.label = filterLabels[`category:${category}`] || `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
    }

    if (["new-arrival", "best-seller", "sale", "core"].includes(collection)) {
      initial.collection = collection;
      initial.label = filterLabels[`collection:${collection}`] || initial.label;
    }

    if (!initial.category && ["denim", "accessories"].includes(hashValue)) {
      initial.category = hashValue;
      initial.label = filterLabels[`category:${hashValue}`];
    }

    if (!initial.collection && ["new", "new-arrivals"].includes(hashValue)) {
      initial.collection = "new-arrival";
      initial.label = filterLabels["collection:new-arrival"];
    }

    if (!initial.collection && hashValue === "essentials") {
      initial.collection = "core";
      initial.label = filterLabels["collection:core"];
    }

    if (["featured", "newest", "price-low", "price-high", "top-rated"].includes(sort)) {
      initial.sort = sort;
    }

    if (keyword) {
      initial.keyword = keyword;
    }

    return initial;
  };

  const applyInitialUrlFilters = () => {
    const initial = getInitialUrlFilters();

    Object.keys(filters).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(initial, key)) {
        filters[key] = initial[key];
      }
    });

    if (initial.sort) {
      currentSort = initial.sort;
    }

    document.querySelectorAll("[data-catalog-filter]").forEach((field) => {
      const value = filters[field.dataset.catalogFilter];

      if (typeof value === "string") {
        field.value = value;
      }
    });

    const sortField = document.querySelector("[data-product-sort]");

    if (sortField) {
      sortField.value = currentSort;
    }

    setCatalogHeading(initial.label);
  };

  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const formatPrice = (value) => `$${Math.round(Number(value) || 0).toLocaleString("en-US")}`;
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

  const getProductImage = (product, index) => {
    const image = product.image_url || product.image || "";

    if (!image || image === "xxx") {
      return images[index % images.length];
    }

    return image;
  };

  const normalizeApiProduct = (product, index) => {
    const price = Number(product.price) || 0;
    const comparePrice = Number(product.compare_price || product.comparePrice) || price;

    const normalized = {
      id: String(product.id || `api-product-${index + 1}`),
      name: product.name || `Product ${index + 1}`,
      variant: product.category || product.description || "Core / Regular",
      price,
      comparePrice: Math.max(comparePrice, price),
      priceText: `$${price}`,
      badge: Number(product.stock) > 0 ? product.badge || "In Stock" : "Sold Out",
      reviews: Number(product.review_count || product.reviews) || 0,
      rating: Number(product.rating) || 0,
      image: getProductImage(product, index),
      colorCount: 1 + (index % 6),
      category: product.category || "",
      description: product.description || "",
      stock: Number(product.stock) || 0,
      index,
      quantity: 1,
    };

    return { ...normalized, ...getProductMeta(product, index) };
  };

  const loadProductsFromApi = async () => {
    if (!window.api || !window.api.getProducts) {
      return fallbackProducts;
    }

    try {
      const apiProducts = await window.api.getProducts();

      if (Array.isArray(apiProducts) && apiProducts.length) {
        return apiProducts.map(normalizeApiProduct);
      }
    } catch (error) {
      return fallbackProducts;
    }

    return fallbackProducts;
  };

  const updateCount = () => {
    const label = `${visibleProducts.length.toLocaleString("en-US")} Items`;
    document.querySelector("#products-count").textContent = label;
    document.querySelector("[data-filter-count]").textContent = label;
  };

  const matchesKeyword = (product, keyword) => {
    if (!keyword) {
      return true;
    }

    return [
      product.name,
      product.variant,
      product.category,
      product.description,
      product.categoryKey,
      product.colorKey,
      product.collectionKey,
      ...(product.sizeKeys || []),
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
  };

  const matchesPriceRange = (price, range) => {
    if (!range) return true;
    if (range === "under-50") return price < 50;
    if (range === "50-75") return price >= 50 && price <= 75;
    if (range === "75-100") return price >= 75 && price <= 100;
    if (range === "100-plus") return price >= 100;
    return true;
  };

  const applyFilters = () => {
    const keyword = filters.keyword.trim().toLowerCase();
    const category = filters.category.trim().toLowerCase();
    const audience = filters.audience.trim().toLowerCase();
    const color = filters.color.trim().toLowerCase();
    const size = filters.size.trim().toUpperCase();
    const collection = filters.collection.trim().toLowerCase();
    const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);

    visibleProducts = products.filter((product) => {
      const price = Number(product.price) || 0;

      return matchesKeyword(product, keyword)
        && (!audience || product.audienceKey === audience)
        && (!category || product.categoryKey === category)
        && matchesPriceRange(price, filters.priceRange)
        && (!color || (product.colorKeys || [product.colorKey]).includes(color))
        && (!size || product.sizeKeys.includes(size))
        && (!collection || product.collectionKey === collection)
        && (minPrice === null || price >= minPrice)
        && (maxPrice === null || price <= maxPrice);
    });
  };

  const applySort = () => {
    if (currentSort === "newest") visibleProducts.sort((a, b) => b.index - a.index);
    if (currentSort === "price-low") visibleProducts.sort((a, b) => a.price - b.price);
    if (currentSort === "price-high") visibleProducts.sort((a, b) => b.price - a.price);
    if (currentSort === "top-rated") visibleProducts.sort((a, b) => b.rating - a.rating);
  };

  const updateCatalog = () => {
    applyFilters();
    applySort();
    render();
    updateFilterLabels();
  };

  const updateFilterLabels = () => {
    document.querySelectorAll(".filter-pills label").forEach((label) => {
      const field = label.querySelector("[data-catalog-filter]");
      label.classList.toggle("has-value", Boolean(field && field.value));
    });
  };

  const debounce = (callback, delay = 300) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, delay);
  };

  const getProductColors = (product, index) => {
    const detectedColors = (product.colorKeys || [product.colorKey]).map((color) => color === "blue"
      ? "denim"
      : color === "neutral"
        ? "stone"
        : color);
    const primary = detectedColors[0];
    const maxColors = Math.min(5, Math.max(Number(product.colorCount) || 2 + (index % 4), detectedColors.length));
    return [primary, ...detectedColors, ...swatchOptions]
      .filter(Boolean)
      .filter((name, swatchIndex, list) => list.indexOf(name) === swatchIndex)
      .slice(0, maxColors);
  };

  const createSwatches = (product, index, withLabels = false) => getProductColors(product, index).map((name) => {
    const label = colorLabels[name] || name;
    return withLabels
      ? `<button class="detail-swatch-option" type="button" data-detail-option="color" data-option-value="${escapeHtml(label)}" aria-pressed="false"><span class="swatch ${name}" aria-hidden="true"></span>${escapeHtml(label)}</button>`
      : `<span class="swatch ${name}" title="${escapeHtml(label)}"></span>`;
  }).join("");

  const createPriceMarkup = (product) => {
    const hasDiscount = product.comparePrice > product.price;
    const discount = hasDiscount
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;

    return {
      hasDiscount,
      markup: hasDiscount
        ? `<span>${formatPrice(product.comparePrice)}</span><strong>${formatPrice(product.price)}</strong><em>${discount}% off</em>`
        : `<strong>${formatPrice(product.price)}</strong>`,
    };
  };

  const createCard = (product, index) => {
    const price = createPriceMarkup(product);

    return `
      <article class="product-card catalog-card" data-product-id="${escapeHtml(product.id)}" data-product-index="${index}" role="button" tabindex="0" aria-label="View details for ${escapeHtml(product.name)}">
        <div class="product-media">
          ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
        </div>
        <div class="product-info">
          <h3>${escapeHtml(product.name)}</h3>
          <div class="product-price-line${price.hasDiscount ? " is-sale" : ""}">${price.markup}</div>
          <p>Extra 20% off $100+</p>
          <div class="swatches" aria-label="Available colors">${createSwatches(product, index)}</div>
          <small>+ ${product.colorCount} colors</small>
          ${createRatingMarkup(product)}
          <button class="add-button" type="button">Add to bag</button>
        </div>
      </article>
    `;
  };

  const createPromoTile = () => `
    <article class="catalog-promo-card">
      <img src="https://images.unsplash.com/photo-1506629905607-d7e0881763f4?auto=format&fit=crop&w=900&q=85" alt="Summer menswear editorial">
      <div><h2>New Arrivals</h2><p>Lightweight knits, shorts, and layers for summer heat.</p><a href="products.html">Shop New</a></div>
    </article>
  `;

  const setLoader = (visible) => {
    document.querySelector("[data-catalog-loader]").hidden = !visible;
  };

  const appendNextProducts = () => {
    const grid = document.querySelector("#products-grid");
    if (!grid || renderedCount >= visibleProducts.length || isLoading) {
      setLoader(false);
      return;
    }
    isLoading = true;
    setLoader(true);
    window.setTimeout(() => {
      const nextProducts = visibleProducts.slice(renderedCount, renderedCount + pageSize);
      const cards = nextProducts.map((product, offset) => createCard(product, renderedCount + offset));
      if (renderedCount === pageSize && visibleProducts.length > pageSize + 3) {
        cards.splice(3, 0, createPromoTile());
      }
      grid.insertAdjacentHTML("beforeend", cards.join(""));
      renderedCount += nextProducts.length;
      isLoading = false;
      setLoader(renderedCount < visibleProducts.length);
    }, 180);
  };

  const render = () => {
    document.querySelector("#products-grid").innerHTML = "";
    renderedCount = 0;
    updateCount();
    document.querySelector("[data-catalog-empty]").hidden = visibleProducts.length > 0;
    appendNextProducts();
  };

  const sortProducts = (type) => {
    currentSort = type;
    updateCatalog();
  };

  const updateFilter = (field, value) => {
    filters[field] = value;
    document.querySelectorAll(`[data-catalog-filter="${field}"]`).forEach((input) => {
      if (input.value !== value) {
        input.value = value;
      }
    });
    updateCatalog();
  };

  const clearFilters = () => {
    Object.keys(filters).forEach((key) => {
      filters[key] = "";
    });

    document.querySelectorAll("[data-catalog-filter]").forEach((field) => {
      field.value = "";
    });

    updateCatalog();
  };

  const openFilter = () => {
    document.body.classList.add("filter-drawer-open");
    document.querySelector("#filter-drawer").setAttribute("aria-hidden", "false");
  };

  const closeFilter = () => {
    document.body.classList.remove("filter-drawer-open");
    document.querySelector("#filter-drawer").setAttribute("aria-hidden", "true");
  };

  const openProductDetail = (product) => {
    const drawer = document.querySelector("#product-detail-drawer");
    const content = document.querySelector("#product-detail-content");

    if (!drawer || !content || !product) {
      return;
    }

    const price = createPriceMarkup(product);
    const index = Number(product.index) || 0;
    const category = product.category || product.categoryKey || "Core";
    const sizes = (product.sizeKeys || []).map((size) => `<button type="button" data-detail-option="size" data-option-value="${escapeHtml(size)}" aria-pressed="false">${escapeHtml(size)}</button>`).join("");
    const stockText = Number(product.stock) > 0 ? `${Number(product.stock)} in stock` : product.badge || "Available";
    const reviewCount = Number(product.reviews) || 0;

    content.innerHTML = `
      <div class="product-detail-media">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      </div>
      <div class="product-detail-content">
        <div class="product-detail-header">
          <div>
            <p>${escapeHtml(category)}</p>
            <h2 id="product-detail-title">${escapeHtml(product.name)}</h2>
          </div>
          <button class="product-detail-close" type="button" data-detail-close aria-label="Close product details">x</button>
        </div>
        <div class="product-price-line${price.hasDiscount ? " is-sale" : ""}">${price.markup}</div>
        <p class="product-detail-description">${escapeHtml(product.description || product.variant || "Clean everyday shape with an easy MONOFORM fit.")}</p>
        <div class="product-detail-rating" data-review-summary aria-label="${reviewCount ? `Rating ${formatRating(product.rating)} out of 5` : "No reviews yet"}">
          ${reviewCount ? `<span aria-hidden="true">${createStars(product.rating)}</span><strong>${formatRating(product.rating)} / 5</strong><small>${reviewCount} reviews</small>` : "<strong>No reviews yet</strong><small>Be the first verified buyer to review this item.</small>"}
        </div>
        <section class="product-detail-section" aria-label="Available colors">
          <h3>Color</h3>
          <div class="detail-swatches">${createSwatches(product, index, true)}</div>
        </section>
        <section class="product-detail-section" aria-label="Available sizes">
          <h3>Size</h3>
          <div class="detail-size-list">${sizes || "<button type=\"button\" data-detail-option=\"size\" data-option-value=\"One Size\" aria-pressed=\"false\">One Size</button>"}</div>
        </section>
        <p class="product-detail-choice-message" data-detail-choice-message>Please choose color and size before adding.</p>
        <div class="product-detail-meta">
          <p><span>Availability</span>${escapeHtml(stockText)}</p>
          <p><span>Collection</span>${escapeHtml(product.collectionKey || "core")}</p>
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
          <button class="product-detail-save" type="button" data-detail-save>Save as favorite item</button>
        </div>
      </div>
    `;

    drawer.dataset.productId = product.id;
    document.body.classList.add("product-detail-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.focus();
    loadProductReviews(product, 0);
  };

  const closeProductDetail = () => {
    const drawer = document.querySelector("#product-detail-drawer");
    document.body.classList.remove("product-detail-open");

    if (drawer) {
      drawer.setAttribute("aria-hidden", "true");
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

  const getSelectedDetailOptions = () => {
    const color = document.querySelector('[data-detail-option="color"].is-selected')?.dataset.optionValue || "";
    const size = document.querySelector('[data-detail-option="size"].is-selected')?.dataset.optionValue || "";

    return { color, size };
  };

  const getCurrentUser = () => window.api?.getAuthUser ? window.api.getAuthUser() : null;

  const saveFavoriteProduct = async (product) => {
    if (!window.cartService?.isSignedIn?.()) {
      window.cartService?.showToast?.("Please sign in or create an account before saving favorites.", "!");
      return false;
    }

    const user = getCurrentUser();

    if (!user?.id || !window.api?.saveUserItem) {
      window.cartService?.showToast?.("Please sign in or create an account before saving favorites.", "!");
      return false;
    }

    const selected = getSelectedDetailOptions();
    const variantParts = [selected.color, selected.size].filter(Boolean);
    const savedItem = {
      productId: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      variant: variantParts.length ? variantParts.join(" / ") : product.variant || product.category || "Favorite item",
    };

    try {
      await window.api.saveUserItem(user.id, savedItem);
      window.cartService?.showToast?.(`${product.name} saved to favorites.`, "♡");
      return true;
    } catch (error) {
      window.cartService?.showToast?.(error.message || "Could not save favorite item.", "!");
      return false;
    }
  };

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

    if (purchasedMarker) {
      purchasedMarker.hidden = !payload?.purchased;
    }

    if (form) {
      form.hidden = true;
    }

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
      if (list && !offset) {
        list.innerHTML = '<p class="product-review-empty">Could not load reviews.</p>';
      }
      return null;
    }
  };

  const updateProductReviewSummary = (product, payload) => {
    const productId = String(getProductId(product));
    const rating = Number(payload?.summary?.rating) || 0;
    const reviews = Number(payload?.summary?.review_count) || 0;

    products = products.map((item) => String(getProductId(item)) === productId ? { ...item, rating, reviews } : item);
    updateCatalog();
  };

  const submitProductReview = async (form) => {
    const drawer = document.querySelector("#product-detail-drawer");
    const product = products.find((item) => item.id === drawer?.dataset.productId);
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

  const updateDetailAddState = () => {
    const selected = getSelectedDetailOptions();
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

  const createSelectedProduct = (product) => {
    const selected = getSelectedDetailOptions();
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

  const addProductToBag = (button) => {
    const card = button.closest(".product-card");
    const product = visibleProducts[Number(card.dataset.productIndex)];
    if (!window.cartService.addItem(product)) {
      return;
    }

    window.cartService.openBagDrawer();
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add to bag";
    }, 900);
  };

  const init = async () => {
    products = await loadProductsFromApi();
    applyInitialUrlFilters();
    visibleProducts = [...products];
    updateCatalog();
    const loadMoreIfNearBottom = () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 900) {
        appendNextProducts();
      }
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) appendNextProducts();
    }, { rootMargin: "700px" });
    observer.observe(document.querySelector("[data-catalog-loader]"));
    window.addEventListener("scroll", loadMoreIfNearBottom, { passive: true });
    window.addEventListener("wheel", loadMoreIfNearBottom, { passive: true });
    window.setInterval(loadMoreIfNearBottom, 600);
    document.querySelector("[data-product-sort]").addEventListener("change", (event) => sortProducts(event.target.value));
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-filter-open]")) openFilter();
      if (event.target.closest("[data-filter-clear]")) clearFilters();
      if (event.target.closest("[data-filter-close]")) closeFilter();
      if (event.target.closest("[data-detail-close]")) closeProductDetail();
      const detailOption = event.target.closest("[data-detail-option]");
      if (detailOption) {
        selectDetailOption(detailOption);
        return;
      }
      if (event.target.closest("[data-detail-add]")) {
        const detailDrawer = document.querySelector("#product-detail-drawer");
        const product = products.find((item) => item.id === detailDrawer?.dataset.productId);
        if (product) {
          if (!window.cartService.addItem(createSelectedProduct(product))) {
            return;
          }

          closeProductDetail();
          window.cartService.openBagDrawer();
        }
        return;
      }
      if (event.target.closest("[data-detail-save]")) {
        const detailDrawer = document.querySelector("#product-detail-drawer");
        const product = products.find((item) => item.id === detailDrawer?.dataset.productId);

        if (product) {
          saveFavoriteProduct(product);
        }

        return;
      }
      if (event.target.closest("[data-review-more]")) {
        const detailDrawer = document.querySelector("#product-detail-drawer");
        const product = products.find((item) => item.id === detailDrawer?.dataset.productId);
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
      const addButton = event.target.closest(".add-button");
      if (addButton) {
        if (!window.cartService.requireAccountBeforeAdd()) {
          return;
        }

        const card = addButton.closest(".product-card");
        openProductDetail(visibleProducts[Number(card.dataset.productIndex)]);
        return;
      }
      const productCard = event.target.closest(".product-card");
      if (productCard) {
        openProductDetail(visibleProducts[Number(productCard.dataset.productIndex)]);
      }
    });
    document.addEventListener("keydown", (event) => {
      const productCard = event.target.closest(".product-card");
      if (!productCard || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

      event.preventDefault();
      openProductDetail(visibleProducts[Number(productCard.dataset.productIndex)]);
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
    document.addEventListener("input", (event) => {
      const field = event.target.closest("[data-catalog-filter]");

      if (!field) {
        return;
      }

      if (field.dataset.catalogFilter === "keyword") {
        debounce(() => updateFilter(field.dataset.catalogFilter, field.value));
        return;
      }

      updateFilter(field.dataset.catalogFilter, field.value);
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
        closeFilter();
        closeProductDetail();
      }
    });
    window.cartService.updateBagCount();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
