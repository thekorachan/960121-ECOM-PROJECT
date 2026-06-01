(function (window) {
  "use strict";

  window.checkoutService = {
    async checkout(customerDetails = {}) {
      const payload = {
        customer: customerDetails,
        cart: window.cartState,
      };

      const result = await window.api.checkout(payload);

      if (result && result.success === true) {
        window.cartService.clearCart();
      }

      return result;
    },
  };
})(window);
