(function (window, document) {
  "use strict";

  const STORAGE_KEY = "shopping_cart";

  const createInitialState = () => ({
    items: [],
  });

  const normalizeCart = (value) => {
    if (!value || !Array.isArray(value.items)) {
      return createInitialState();
    }

    return {
      items: value.items
        .filter((item) => item && item.id)
        .map((item) => ({
          ...item,
          quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1,
        })),
    };
  };

  const loadCart = () => {
    try {
      const savedCart = window.localStorage.getItem(STORAGE_KEY);
      return savedCart ? normalizeCart(JSON.parse(savedCart)) : createInitialState();
    } catch (error) {
      return createInitialState();
    }
  };

  const saveCart = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cartState));
  };

  const getItemCount = () =>
    window.cartState.items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  const updateBagCount = () => {
    const bagCount = document.querySelector("#bag-count");

    if (bagCount) {
      bagCount.textContent = String(getItemCount());
    }
  };

  const addItem = (product) => {
    if (!product || !product.id) {
      return;
    }

    const existingItem = window.cartState.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      window.cartState.items.push({
        ...product,
        quantity: 1,
      });
    }

    saveCart();
    updateBagCount();
  };

  const clearCart = () => {
    window.cartState.items = [];
    saveCart();
    updateBagCount();
  };

  window.cartState = loadCart();

  window.cartService = {
    addItem,
    clearCart,
    getItemCount,
    loadCart,
    saveCart,
    updateBagCount,
  };
})(window, document);
