(function (window) {
  "use strict";

  const API_BASE_URL = "";

  const request = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data && data.message ? data.message : "API request failed";
      throw new Error(message);
    }

    return data;
  };

  window.api = {
    getProducts() {
      return request("/api/products");
    },

    register(userDetails) {
      return request("/api/register", {
        method: "POST",
        body: JSON.stringify(userDetails),
      });
    },

    login(credentials) {
      return request("/api/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },

    checkout(payload) {
      return request("/api/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  };
})(window);
