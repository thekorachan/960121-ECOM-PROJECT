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
| `GET` | `/api/user-addresses?user_id=<userId>` | `server.js` | Load saved addresses from `User_address`. | implemented |
| `POST` | `/api/user-addresses` | `server.js` | Save an address to `User_address`. | implemented |
| `POST` | `/api/user-carts` | `server.js` | Create a `User_cart` row for checkout. | implemented |
| `POST` | `/api/user-cart-items` | `server.js` | Create `User_cart_item` rows for cart products. | implemented |
| `POST` | `/api/user-checkouts` | `server.js` | Create a `User_checkout` order record. | implemented |
| `POST` | `/api/payments/promptpay` | `server.js` | Create a PromptPay QR payment response for demo checkout. | implemented |
| `GET` | `/api/payments/promptpay/:id` | `server.js` | Return demo payment status for a PromptPay charge. | implemented |

## 3. Planned Endpoints

| Method | Path | Frontend caller | Purpose | Status |
| --- | --- | --- | --- | --- |
| `POST` | `/api/checkout` | legacy `window.api.checkout()` helper in `js/api.js` | Original checkout contract. Replaced in the current app by `/api/user-checkouts`. | legacy / frontend helper only |
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

### `GET /api/user-addresses?user_id=<userId>`

- Frontend caller: `window.api.getUserAddresses(user.id)` in `js/api.js`; used by the account drawer in `js/app.js` and checkout flow in `js/checkout-page.js`.
- Current UI usage: after login, the account drawer loads saved addresses and displays them in the "Saved addresses" section. Checkout loads the newest saved address and uses its `address_id`.
- Request payload: none. The `user_id` is passed in the query string.
- Response payload:

```json
[
  {
    "address_id": 1,
    "user_id": 1,
    "address_line": "61/1",
    "city": "Wiang Chai",
    "province": "Chiang Rai",
    "postal_code": "57210",
    "phone": "0654204918"
  }
]
```

- localStorage effect: none directly. The user id comes from `auth_user`.
- Current status: implemented.

### `POST /api/user-addresses`

- Frontend caller: `window.api.createUserAddress()` in `js/api.js`; used by the account drawer address form in `js/app.js`.
- Current UI usage: logged-in users can save an address from the account drawer. After success, the address list reloads from `User_address`.
- Request payload:

```json
{
  "user_id": 1,
  "address_line": "61/1",
  "city": "Wiang Chai",
  "province": "Chiang Rai",
  "postal_code": "57210",
  "phone": "0654204918"
}
```

- Frontend field mapping:
  - `userId` -> `user_id`
  - `addressLine` -> `address_line`
  - `postalCode` -> `postal_code`
- Response payload: the created address row, including `address_id`.
- localStorage effect: none directly.
- Current status: implemented.

### `POST /api/user-carts`

- Frontend caller: `window.api.createUserCart()` in `js/api.js`; used by `continueCheckout()` in `js/checkout-page.js`.
- Current UI usage: when Place Order is clicked, checkout creates a `User_cart` row before saving cart items.
- Request payload:

```json
{
  "user_id": 1,
  "status": "active"
}
```

- Response payload:

```json
{
  "cart_id": 10,
  "user_id": 1,
  "status": "active",
  "created_at": "2026-06-04"
}
```

- localStorage effect: none directly.
- Current status: implemented.

### `POST /api/user-cart-items`

- Frontend caller: `window.api.createUserCartItem()` in `js/api.js`; used by `continueCheckout()` in `js/checkout-page.js`.
- Current UI usage: checkout reads `window.cartState.items` from the local cart and creates one `User_cart_item` row per item.
- Request payload:

```json
{
  "cart_id": 10,
  "product_id": 1,
  "quantity": 2,
  "unit_price": 68
}
```

- Response payload: the created cart item row, including `cart_item_id`.
- localStorage effect: none directly.
- Current status: implemented.

### `POST /api/user-checkouts`

- Frontend caller: `window.api.createUserCheckout()` in `js/api.js`; used by `continueCheckout()` in `js/checkout-page.js`.
- Current UI usage: checkout uses the newest saved address as `address_id`, persists the current local cart through `User_cart` and `User_cart_item`, then creates a `User_checkout` row. This replaces the original `/api/checkout` flow for the current project.
- Request payload:

```json
{
  "user_id": 1,
  "cart_id": 10,
  "address_id": 1,
  "total_price": 136,
  "payment_type": "card",
  "status": "pending"
}
```

- Response payload:

```json
{
  "checkout_id": 1001,
  "user_id": 1,
  "cart_id": 10,
  "address_id": 1,
  "total_price": 136,
  "payment_type": "card",
  "status": "pending",
  "created_at": "2026-06-04"
}
```

- localStorage effect: on success, `checkout-page.js` clears `shopping_cart` through `window.cartService.clearCart()`.
- Current status: implemented.

### Legacy `POST /api/checkout`

- Frontend caller: `window.api.checkout()` in `js/api.js`; wrapped by `window.checkoutService.checkout()` in `js/checkout.js`.
- Current UI usage: not used by the current checkout page. `checkout.html` now uses `js/checkout-page.js` to create `User_cart`, `User_cart_item`, and `User_checkout` through the backend endpoints from `README.md`.
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
- Current status: legacy / frontend helper only.
- Integration note: kept as the original contract reference. The current mini project implementation uses `/api/user-checkouts`, not `/api/checkout`.

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
- `/api/checkout` is still declared in `js/api.js` as a legacy helper, but the active checkout flow uses `/api/user-checkouts`.
- Backend checkout still needs the full Gatekeeper Pattern: re-check product IDs, prices, stock, and totals on the server.
- Backend checkout should add SQL transactions so failed checkout steps do not leave partial order data.
- Database-backed keyword, category, and price filtering is planned for a future commit.
- Some payment calls in `js/checkout-page.js` use direct `fetch()` instead of the central `window.api` client.
- `User_address` persistence is implemented through the account drawer, but checkout currently uses the newest saved address automatically. A future UX improvement could add address selection in checkout.
- Checkout now persists to `User_cart`, `User_cart_item`, and `User_checkout`, but the backend still should add stronger Gatekeeper validation such as product stock checks, price recalculation, and SQL transactions.

## 7. Suggested Next Commits

1. `docs: add integration request response map`
2. `feat: add api token handling`
3. `feat: add auth session persistence`
4. `feat: connect catalog page to products api`
5. `feat: add debounced catalog filters`
6. `feat: connect account address form`
7. `feat: connect checkout to user checkout api`
8. `docs: update integration map for address and checkout api`
