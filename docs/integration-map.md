# Integration Request/Response Map

This document explains the frontend-backend integration plan for the 960121 e-commerce mini project. It focuses on the Integration Engineer responsibilities: API request/response mapping, `fetch()` usage, session continuity, and the bridge between frontend state and backend validation.

## 1. Integration Engineer Responsibilities

- Map each frontend action to the correct backend endpoint.
- Keep `js/api.js` as the central API client for normal app requests.
- Ensure cart continuity through `localStorage` and `window.cartState`.
- Prepare JWT/session handling once backend authentication is available.
- Coordinate with the Lead Architect for SQL schema, transactions, and server-side validation.
- Coordinate with the UX Engineer for form states, loading states, and error messages.

## 2. Current Implemented Endpoints

| Method | Path | Backend file | Purpose | Status |
| --- | --- | --- | --- | --- |
| `GET` | `/api/products` | `server.js` | Load active products from the Railway MySQL `Products` table. | implemented |
| `POST` | `/api/register` | `server.js` | Create a user account in the `User_account` table. | implemented |
| `POST` | `/api/login` | `server.js` | Validate user email/password and return session data. | implemented |
| `POST` | `/api/payments/promptpay` | `server.js` | Create a PromptPay QR payment response for demo checkout. | implemented |
| `GET` | `/api/payments/promptpay/:id` | `server.js` | Return demo payment status for a PromptPay charge. | implemented |

## 3. Planned Endpoints

| Method | Path | Frontend caller | Purpose | Status |
| --- | --- | --- | --- | --- |
| `POST` | `/api/checkout` | `window.api.checkout()` in `js/api.js` and `window.checkoutService.checkout()` in `js/checkout.js` | Place an order after backend validation. | frontend-only |
| `GET` | `/api/products?keyword=&category=&minPrice=&maxPrice=` | planned advanced catalog filters | Load filtered products for `products.html`. | planned |

## 4. Request/Response Map

### `GET /api/products`

- Frontend caller: `window.api.getProducts()` in `js/api.js`; used by `window.productService.loadProducts()` in `js/products.js` and `loadProductsFromApi()` in `js/catalog.js`.
- Current UI usage: `index.html` loads `js/api.js`, `js/products.js`, `js/cart.js`, and `js/app.js`, so the home page can replace static product cards with database products. `products.html` now loads `js/api.js` before `js/catalog.js`, allowing the catalog page to fetch database products from the same endpoint.
- Request payload: none.
- Response payload:

```json
[
  {
    "id": 1,
    "name": "Product name",
    "description": "Product description",
    "price": 49.99,
    "compare_price": 69.99,
    "stock": 10,
    "rating": 4.5,
    "review_count": 12,
    "is_active": 1,
    "image_url": "https://example.com/image.jpg",
    "category": "shirts"
  }
]
```

- localStorage effect: none directly. If the user clicks "Add to bag", `cartService.addItem()` saves the selected product to `shopping_cart`.
- Current status: implemented.
- Integration note: `server.js` reads `products_id` and `products_name` from `Products`, then aliases them to `id` and `name` for the frontend. `js/catalog.js` normalizes database fields such as `id`, `name`, `description`, `price`, `compare_price`, `image_url`, `category`, `rating`, `review_count`, and `stock` into the existing catalog card format. Static catalog data is still kept as a fallback if the API fails or returns no products.

### `POST /api/payments/promptpay`

- Frontend caller: direct `fetch("/api/payments/promptpay")` in `js/checkout-page.js`.
- Request payload:

```json
{
  "amount": 4425,
  "currency": "THB"
}
```

- Response payload:

```json
{
  "id": "promptpay_1710000000000",
  "status": "pending",
  "amount": 4425,
  "currency": "THB",
  "expires_at": "2026-06-03T00:00:00.000Z",
  "qr_image": "https://promptpay.io/0931498129/44.25.png",
  "demo": false,
  "poll": false
}
```

- localStorage effect: none when the QR is created. After the demo completion countdown, `checkout-page.js` clears `shopping_cart`.
- Current status: implemented.
- Integration note: this bypasses a real payment provider, matching the mini project instruction to bypass payment processing.

### `GET /api/payments/promptpay/:id`

- Frontend caller: direct `fetch()` in `refreshPromptPayStatus()` in `js/checkout-page.js`.
- Request payload: none.
- Response payload:

```json
{
  "id": "promptpay_1710000000000",
  "status": "pending",
  "demo": true
}
```

- localStorage effect: none directly.
- Current status: implemented.
- Integration note: current PromptPay charges use `poll: false`, so the countdown completion path is used more than the polling path.

### `POST /api/register`

- Frontend caller: `window.api.register()` in `js/api.js`; wrapped by `window.authService.register()` in `js/auth.js`.
- Current UI usage: `index.html` account Sign up form submits through `js/app.js`, which calls `window.authService.register()` with `firstName`, `lastName`, `email`, and `password`.
- Request payload:

```json
{
  "firstName": "User",
  "lastName": "Name",
  "email": "user@example.com",
  "password": "plain text from form before backend hashing"
}
```

- Expected response payload:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "User",
    "lastName": "Name"
  },
  "token": "jwt-token"
}
```

- localStorage effect: successful responses are passed through `js/auth.js` and saved by `js/api.js` into `auth_token` and `auth_user`.
- Current status: implemented.
- Integration note: `server.js` inserts the account into the `User_account` table and returns `{ success, user, token }`. Passwords are currently plain text for classroom CRUD testing; bcrypt hashing is still recommended before production use.

### `POST /api/login`

- Frontend caller: `window.api.login()` in `js/api.js`; wrapped by `window.authService.login()` in `js/auth.js`.
- Current UI usage: `index.html` account Sign in form submits through `js/app.js`, which calls `window.authService.login()` with `email` and `password`.
- Request payload:

```json
{
  "email": "user@example.com",
  "password": "user password"
}
```

- Expected response payload:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "User"
  },
  "token": "jwt-token"
}
```

- localStorage effect: successful responses are passed through `js/auth.js` and saved by `js/api.js` into `auth_token` and `auth_user`.
- Current status: implemented.
- Integration note: `server.js` validates the user against the `User_account` table and returns `{ success, user, token }`. `js/api.js` attaches `Authorization: Bearer <token>` to future API requests when a token exists.

### `POST /api/checkout`

- Frontend caller: `window.api.checkout()` in `js/api.js`; wrapped by `window.checkoutService.checkout()` in `js/checkout.js`.
- Current UI usage: `checkout.html` uses `js/checkout-page.js`, which currently validates the form and uses PromptPay demo flow. It does not yet call `window.checkoutService.checkout()`.
- Request payload:

```json
{
  "customer": {
    "email": "user@example.com",
    "phone": "+66123456789",
    "firstName": "User",
    "lastName": "Name",
    "address1": "Address line 1",
    "city": "Chiang Mai",
    "state": "Chiang Mai",
    "postalCode": "50000",
    "country": "Thailand"
  },
  "cart": {
    "items": [
      {
        "id": "1",
        "quantity": 2
      }
    ]
  }
}
```

- Expected response payload:

```json
{
  "success": true,
  "orderId": 1001,
  "status": "placed",
  "total": 99.98
}
```

- localStorage effect: planned. On `success: true`, `checkoutService.checkout()` already clears the cart through `window.cartService.clearCart()`.
- Current status: frontend-only.
- Integration note: backend must re-query product prices and stock from MySQL. The server should not trust item prices sent from the browser.

## 5. localStorage and Session Continuity

| Key | Current owner | Purpose | Current status |
| --- | --- | --- | --- |
| `shopping_cart` | `js/cart.js` | Saves cart items and quantities across refreshes. | implemented |
| `auth_token` | `js/api.js` / `js/auth.js` | Store the auth token after login/register. | implemented |
| `auth_user` | `js/api.js` / `js/auth.js` | Store non-sensitive user summary for UI continuity. | implemented |

Current cart continuity flow:

1. `window.cartState = loadCart()` runs when `js/cart.js` loads.
2. `loadCart()` reads `shopping_cart` from `localStorage`.
3. `addItem()`, `updateItemQuantity()`, `removeItem()`, and `clearCart()` update `window.cartState`.
4. `saveCart()` serializes the state back into `localStorage`.
5. `checkout-page.js` reads `window.cartState` and can clear the cart after demo payment completion.

Current auth continuity flow:

1. User submits signup/login form.
2. Frontend calls `/api/register` or `/api/login`.
3. Backend returns a token and safe user profile.
4. Frontend saves the token and user summary.
5. `js/api.js` attaches the token to protected requests.
6. Logout clears the saved token and user summary.

## 6. Integration Risks / Missing Work

- Advanced catalog filters are still future work; `products.html` can load `/api/products`, but keyword, category, and price query filters are not connected to the database yet.
- `/api/checkout` is declared in `js/api.js` but is not implemented in `server.js`.
- Checkout UI validates form data, but order creation is not connected to the backend checkout endpoint.
- User address persistence is future work unless a concrete `User_address` schema or address endpoint is added.
- Backend checkout still needs the Gatekeeper Pattern: re-check product IDs, prices, stock, and totals on the server.
- Backend checkout should use SQL transactions so failed checkout steps do not leave partial order data.
- Database-backed keyword, category, and price filtering is planned for a future commit.
- Some payment calls in `js/checkout-page.js` use direct `fetch()` instead of the central `window.api` client.

## 7. Suggested Next Commits

1. `docs: add integration request response map`
2. `feat: add api token handling`
3. `feat: add auth session persistence`
4. `feat: connect catalog page to products api`
5. `feat: add debounced catalog filters`
6. `feat: integrate checkout api flow`
7. `docs: update integration work log`
