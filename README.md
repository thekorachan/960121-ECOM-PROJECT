# 960121 E-commerce Project

Minimal fashion e-commerce website with product cards loaded from a Railway MySQL database through a Node.js / Express backend.

## Requirements

Install these before running the website:

- Node.js
- npm
- Railway MySQL database

## Setup Before Running

1. Install project dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root.

The file must contain:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
PORT=3000
```

Example format only:

```env
DATABASE_URL=mysql://root:your-password@your-railway-host.rlwy.net:3306/railway
PORT=3000
```

Do not upload the real `.env` file to GitHub because it contains the database password.

3. Make sure the Railway MySQL database has a `Products` table.

Required columns used by the website:

```txt
products_id
products_name
description
price
compare_price
stock
rating
review_count
is_active
image_url
category
```

4. Add product rows in Railway.

The `image_url` value should be a real image URL. If it is empty or set to a placeholder such as `xxx`, the product image will not show correctly.

## Run The Website

Start the local server:

```bash
npm start
```

Open the website:

```txt
http://localhost:3000
```

Product cards are loaded from:

```txt
http://localhost:3000/api/products
```

If you open the HTML with the VS Code Live Server extension, keep this Node server running too. Live Server only serves static files, so the browser falls back to `http://localhost:3000/api/products` for database products.

For Vercel deployment, add the same `DATABASE_URL` environment variable in the Vercel project settings. The deployed website loads products from `/api/products`.

## Work Log

### 01/06/2026

What was done:

- Connected the website to Railway MySQL through a backend API.
- Added `server.js` using Node.js and Express.
- Used `mysql2` to connect to the Railway MySQL database.
- Used `dotenv` to load the database connection string from `.env`.
- Added `/api/products` endpoint to read product data from the `Products` table.
- Updated `products.js` so product cards can be rendered from API data.
- Updated `app.js` to render products when the page loads.
- Fixed script paths in `index.html` from `client/js/...` to `js/...`.
- Added `.gitignore` to ignore `.env` and `node_modules/`.
- Installed npm dependencies and generated `package-lock.json`.

Tools / technologies used:

- HTML
- CSS
- JavaScript
- Node.js
- Express
- mysql2
- dotenv
- Railway MySQL

Current note:

- The API connection works.
- The database currently has product data.
- Product images need real `image_url` values in Railway to display correctly.

### 02/06/2026

What was done:

- Added backend API routes for the Login and Sign up system.
- Added `POST /api/register` for creating a new user account.
- Added `POST /api/login` for checking user email and password.
- Connected the Sign up form input from the UI to the backend API.
- Inserted new account data into the Railway MySQL `User_account` table.
- Checked for duplicate email before creating a new account.
- Returned user data and a simple login token after successful register/login.
- Updated the frontend form submit logic in `js/app.js` to call the real API instead of showing only demo success text.
- Added loading, success, and error messages for the account form.

Database table used:

```txt
User_account
```

Columns used:

```txt
user_id
first_name
last_name
email
password
```

API endpoints added:

```txt
POST /api/register
POST /api/login
```

Current note:

- The Login and Sign up system now uses backend SQL CRUD operations.
- Passwords are currently stored as plain text for simple classroom CRUD testing.
- For real production use, passwords should be changed to password hashes with bcrypt.

### 04/06/2026

What was planned / updated:

1. Changed the product database table from `products` to `Products`.

- The new `Products` table works the same as the old `products` table.
- It still stores product data such as product name, description, price, stock, image URL, and category.
- The backend `/api/products` endpoint now reads from `Products`.
- The backend maps `products_id` to `id` and `products_name` to `name` so the frontend can still use the same product card code.

2. Changed the checkout address plan.

- The old plan was to let users type an address every time before checkout.
- The new plan is to save user addresses in the `User_address` table.
- During checkout, the system will use `user_id` to find the logged-in user and `address_id` to select the saved address.
- This makes checkout faster because users can reuse saved addresses.

3. Planned three new tables for cart and checkout.

New tables:

```txt
User_cart
User_cart_item
User_checkout
```

Table relationship:

```txt
User_account
  -> User_address
  -> User_cart
      -> User_cart_item
          -> Products
  -> User_checkout
      -> User_address
      -> User_cart
```

How each table works:

- `User_account` stores user login/account data.
- `User_address` stores saved addresses for each user.
- `User_cart` stores the active cart that belongs to a user.
- `User_cart_item` stores each product inside a cart.
- `Products` stores product information.
- `User_checkout` stores the final checkout/order record.

Example flow:

```txt
User_account.user_id = 5
```

The same `user_id` can be used in other tables:

```txt
User_address.user_id = 5
User_cart.user_id = 5
User_checkout.user_id = 5
```

Example cart data:

```txt
User_cart
cart_id | user_id | status
10      | 5       | active
```

The cart can contain many products through `User_cart_item`:

```txt
User_cart_item
cart_item_id | cart_id | product_id | quantity | unit_price
1            | 10      | 3          | 2        | 590
2            | 10      | 7          | 1        | 1200
```

This means user `5` has cart `10`, and cart `10` contains product `3` and product `7`.

Example checkout data:

```txt
User_checkout
checkout_id | user_id | cart_id | address_id | total_price | payment_type | status
1           | 5       | 10      | 2          | 2380        | PromptPay    | pending
```

This means user `5` checked out cart `10` using saved address `2`.

Current note:

- Railway may not provide a simple Foreign Key button in the UI.
- The project can still connect tables by storing related IDs such as `user_id`, `cart_id`, `product_id`, and `address_id`.
- The backend should check these IDs before inserting checkout data.
