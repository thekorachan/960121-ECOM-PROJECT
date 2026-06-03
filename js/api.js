(function (window) {
  "use strict";

  const API_BASE_URL = "";
  const LOCAL_API_BASE_URL = "http://localhost:3000";
  const AUTH_TOKEN_KEY = "auth_token";
  const AUTH_USER_KEY = "auth_user";

  const getApiBaseUrls = () => {
    const baseUrls = [API_BASE_URL];
    const origin = window.location.origin;
    const isLocalApi = origin === LOCAL_API_BASE_URL;
    const isLocalStaticServer = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    if (!isLocalApi && (isLocalStaticServer || origin === "null")) {
      baseUrls.push(LOCAL_API_BASE_URL);
    }

    return baseUrls;
  };

  const getAuthToken = () => window.localStorage.getItem(AUTH_TOKEN_KEY);

  const getAuthUser = () => {
    try {
      const savedUser = window.localStorage.getItem(AUTH_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  };

  const setAuthSession = (session = {}) => {
    if (session.token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    }

    if (session.user) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    }
  };

  const clearAuthSession = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  };

  const request = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    let lastError;

    for (const baseUrl of getApiBaseUrls()) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
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
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("API request failed");
  };

  window.api = {
    getAuthToken,
    getAuthUser,
    setAuthSession,
    clearAuthSession,

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
