# Ball-survivor

## Backend (PayPal) setup

1) Copy `.env.example` to `.env` and set your credentials:

```
cp .env.example .env
```

Edit `.env`:

- PAYPAL_CLIENT_ID: your live/sandbox client ID
- PAYPAL_CLIENT_SECRET: your secret (server-side only)
- PAYPAL_ENV: `sandbox` or `live`
- PORT: default `3000`

## Run the app

```
cd server
npm install
npm run start
```

Then open `http://localhost:3000`.

The frontend’s PayPal Buttons now use backend endpoints:
- POST `/api/paypal/create-order`
- POST `/api/paypal/capture-order/:orderId`
