# MarketWeave Backend (Vibhav) — README

## Setup
1. Copy `.env.example` to `.env` and fill values (DB credentials, JWT secret).
2. Install:
   npm install
3. Start server:
   node index.js
   or during development:
   npx nodemon index.js

## Endpoints (MVP)
- POST /api/auth/register { email, password, name, phone, is_seller }
- POST /api/auth/login { email, password }
- GET  /api/products
- GET  /api/products/:id
- GET  /api/cart (auth)
- POST /api/cart { product_id, quantity } (auth)
- PUT  /api/cart/:id { quantity } (auth)
- DELETE /api/cart/:id (auth)
- POST /api/checkout { shipping_address_id } (auth)

## Checkout notes
The checkout endpoint calls MySQL stored procedure `checkout_cart(in_buyer, in_shipping_address, OUT out_order_id)`.
Return codes from DB are:
- positive order_id -> success
- -2 -> empty cart (400)
- -3 -> insufficient stock (409)
- -1 -> internal error (500)

## Testing flow
1. Ensure `marketweave` DB has sample data (naturalyn's file).
2. Register / login -> get JWT token.
3. Add items to cart (POST /api/cart).
4. POST /api/checkout with token and shipping_address_id.
5. Verify orders table and product.quantity decreased.

## Notes
- All DB queries are parameterized.
- Passwords hashed with bcrypt.
- Use Postman to save token and test protected endpoints.
