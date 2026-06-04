# Go-Live Audit Checklist

## 1. Purpose

This checklist summarizes the current go-live readiness of the e-commerce mini project before final submission. It focuses on environment setup, frontend/backend integration, database persistence, security awareness, checkout flow, and remaining risks.

## 2. Current Implemented Strengths

- [x] Product catalog loads products from `GET /api/products`.
- [x] Register and login forms are connected to backend auth endpoints.
- [x] Auth session continuity uses `localStorage` keys `auth_token` and `auth_user`.
- [x] Cart state is stored in `localStorage` using `shopping_cart`.
- [x] Account drawer can save and load `User_address` records.
- [x] Checkout creates records in `User_cart`, `User_cart_item`, and `User_checkout`.
- [x] `docs/integration-map.md` documents request/response flow for the main integrations.

## 3. Environment and Dependency Audit

- [x] `.env` is used for `DATABASE_URL`.
- [x] `.gitignore` ignores `.env` and `node_modules/`.
- [x] `npm start` runs `server.js`.
- [x] `package.json` defines required Node dependencies.
- [ ] Final reviewer should confirm `.env` is present locally before running the app.

## 4. Frontend Integration Audit

- [x] `js/api.js` centralizes main API calls.
- [x] Product catalog uses `/api/products` with static product fallback.
- [x] Login and register forms save successful sessions through auth helpers.
- [x] Account UI shows logged-in user state and saved addresses.
- [x] Cart add, quantity update, remove, and count updates use shared cart state.
- [x] Checkout page reads cart state and submits checkout data to backend table endpoints.

## 5. Backend API Audit

- [x] `GET /api/products` returns product data for catalog display.
- [x] `POST /api/register` creates user accounts.
- [x] `POST /api/login` validates login and returns session data.
- [x] `GET /api/user-addresses?user_id=<userId>` loads saved addresses.
- [x] `POST /api/user-addresses` saves an address.
- [x] `POST /api/user-carts` creates a cart record.
- [x] `POST /api/user-cart-items` creates cart item records.
- [x] `POST /api/user-checkouts` creates checkout records.
- [x] `/api/checkout` is legacy; active checkout uses `/api/user-checkouts`.

## 6. Database Persistence Audit

- [x] Product data is read from the database.
- [x] User accounts are persisted through backend register flow.
- [x] Saved addresses are persisted in `User_address`.
- [x] Checkout writes to `User_cart`, `User_cart_item`, and `User_checkout`.
- [ ] Backend should verify final product price, stock, discount, and total before saving checkout.

## 7. Security and Auth Audit

- [x] Frontend attaches `Authorization: Bearer <token>` when `auth_token` exists.
- [x] Frontend can clear auth session on logout.
- [ ] Passwords are currently plain text for classroom CRUD testing.
- [ ] Token is simple and not a production JWT.
- [ ] Production auth would need password hashing, token validation middleware, and protected user routes.

## 8. Checkout and Transaction Audit

- [x] Checkout requires a logged-in user.
- [x] Checkout uses the newest saved address automatically.
- [x] Checkout persists local cart items into backend cart and cart item tables.
- [x] Checkout creates a `User_checkout` record with payment type and total price.
- [x] Success UI can show order id, status, total, and message.
- [ ] Backend checkout should re-query product price and stock.
- [ ] Backend checkout should add SQL transaction handling.
- [ ] Some payment calls still use direct `fetch` for the PromptPay demo.

## 9. Known Risks / Future Improvements

- Passwords are plain text because this is a classroom CRUD/testing implementation.
- Token handling is not production-grade JWT authentication.
- Backend checkout should not trust frontend product prices or totals.
- Backend should add stock checks, price checks, and transaction rollback.
- Checkout currently uses the newest saved address automatically instead of letting the user select an address.
- PromptPay is still a demo integration path.
- `/api/checkout` should be removed or replaced after the active `/api/user-checkouts` flow is finalized.

## 10. Final Submission Checklist

- [ ] Run `npm install` if dependencies are missing.
- [ ] Confirm `.env` has a valid `DATABASE_URL`.
- [ ] Run `npm start`.
- [ ] Open the website and confirm products load from the database.
- [ ] Test register and login.
- [ ] Test account saved address save/load.
- [ ] Add a product to cart and confirm `shopping_cart` updates.
- [ ] Complete checkout and confirm database rows are created.
- [ ] Review `docs/integration-map.md` and this checklist before presenting.
