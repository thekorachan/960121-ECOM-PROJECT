(function (window) {
  "use strict";

  window.authService = {
    register(details) {
      return window.api.register(details || {});
    },

    login(credentials) {
      return window.api.login(credentials || {});
    },
  };
})(window);
