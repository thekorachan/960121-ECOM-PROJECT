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
      quantity: 1,
    };
  };

  const getProductsFromDom = () =>
    Array.from(document.querySelectorAll(".product-card")).map((card, index) =>
      getProductFromCard(card, index)
    );

  const findCardProduct = (button) => {
    const card = button.closest(".product-card");

    if (!card) {
      return null;
    }

    const cards = Array.from(document.querySelectorAll(".product-card"));
    return getProductFromCard(card, cards.indexOf(card));
  };

  const loadProducts = async () => {
    if (!window.api || !window.api.getProducts) {
      return getProductsFromDom();
    }

    try {
      const products = await window.api.getProducts();
      return Array.isArray(products) && products.length ? products : getProductsFromDom();
    } catch (error) {
      return getProductsFromDom();
    }
  };

  window.productService = {
    findCardProduct,
    getProductsFromDom,
    loadProducts,
  };
})(window, document);
