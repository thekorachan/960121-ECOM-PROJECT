# Checkout Payload Contract

## 1. Purpose

This document defines the agreed frontend-to-backend payload for `POST /api/checkout`. It gives the Backend, UX, and Integration roles the same field names before checkout and `User_address` work continues.

## 2. Endpoint

- Method: `POST`
- Path: `/api/checkout`
- Frontend caller: `window.api.checkout(payload)` through `js/api.js`
- Planned service wrapper: `window.checkoutService.checkout()` in `js/checkout.js`
- Status: planned / not implemented in `server.js` yet

## 3. Request Payload

```json
{
  "customer": {
    "email": "user@example.com",
    "phone": "+66123456789",
    "firstName": "User",
    "lastName": "Name"
  },
  "address": {
    "address1": "Address line 1",
    "address2": "Address line 2",
    "city": "Chiang Mai",
    "state": "Chiang Mai",
    "postalCode": "50000",
    "country": "Thailand",
    "saveAddress": true,
    "addressLabel": "Home"
  },
  "cart": {
    "items": [
      {
        "id": "1",
        "quantity": 2
      }
    ]
  },
  "payment": {
    "method": "promptpay",
    "providerReference": "promptpay_1710000000000"
  }
}
```

Important cart rule: frontend must send only product `id` and `quantity` as trusted checkout inputs. Product name, price, discount, stock, and final total must be reloaded and recalculated by the backend.

## 4. Response Payload

```json
{
  "success": true,
  "orderId": 1001,
  "status": "placed",
  "total": 136.0,
  "message": "Order placed successfully.",
  "errors": []
}
```

- `success`: boolean result of checkout.
- `orderId`: generated order id from the backend.
- `status`: expected values may include `placed`, `pending_payment`, `failed`, or `out_of_stock`.
- `total`: backend-calculated final total.
- `message`: optional user-facing summary.
- `errors`: optional array of validation or stock errors.

## 5. Field Ownership

| Field group | Owner | Notes |
| --- | --- | --- |
| `customer` | UX / Integration | Values come from checkout contact and name fields. |
| `address` | UX / Integration | `checkout.html` already has `address1`, `address2`, `city`, `state`, `postalCode`, and `country`. |
| `saveAddress` / `addressLabel` | UX / Backend | UX may need to add these fields after Backend confirms `User_address` behavior. |
| `cart.items[].id` | Integration | Comes from `window.cartState.items`. |
| `cart.items[].quantity` | Integration | Comes from cart quantity state. |
| `payment.method` | UX / Integration | Should use stable values such as `card`, `promptpay`, or `bypass`. |
| `payment.providerReference` | Integration / Backend | Optional payment reference, such as a PromptPay charge id. |

## 6. User_address Future Integration

`User_address` is future work until Backend confirms the table schema and endpoint. The current contract reserves:

- `address.saveAddress`
- `address.addressLabel`

Possible backend options:

- Save address during `POST /api/checkout`.
- Save address through a separate endpoint such as `POST /api/user-addresses`.

The team should confirm whether checkout requires login before saving an address.

## 7. Backend Validation Requirements

Backend must:

- Validate required customer and address fields.
- Re-query product records from MySQL by product id.
- Recalculate product prices, discounts, shipping, and final total.
- Check stock before creating the order.
- Reject invalid product ids or quantities.
- Use parameterized SQL queries.
- Use an atomic transaction for order and order item creation.
- Return clear errors for out of stock, price changed, invalid address, login required, or checkout failed.

## 8. Frontend Integration Notes

- `checkout.html` already contains many required fields: `email`, `phone`, `firstName`, `lastName`, `address1`, `address2`, `city`, `state`, `postalCode`, and `country`.
- UX may still need to add `saveAddress` and `addressLabel`.
- `js/checkout-page.js` currently validates form fields and handles PromptPay demo flow.
- `js/checkout.js` already has a wrapper for `window.api.checkout(payload)`, but the checkout page does not fully use it yet.
- Frontend may display subtotal and total for user feedback, but those values are not trusted by the backend.
- On successful checkout, frontend should clear `shopping_cart` using `window.cartService.clearCart()`.

## 9. Open Questions for Backend / UX

- Should checkout require a logged-in user, or should guest checkout be allowed?
- Will `User_address` be saved inside checkout or through a separate address endpoint?
- What are the exact `orders` and `order_items` table names and columns?
- What stable payment method values should the frontend send?
- What checkout statuses should the frontend display?
- Should the backend return item-level errors for stock and price changes?
