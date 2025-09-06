import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_ENV === 'live' ? 'https://api.paypal.com' : 'https://api-m.sandbox.paypal.com';

if (!PAYPAL_CLIENT_ID) {
  console.warn('[warn] PAYPAL_CLIENT_ID not set. Set it in .env');
}
if (!PAYPAL_CLIENT_SECRET) {
  console.warn('[warn] PAYPAL_CLIENT_SECRET not set. Payments will fail. Set it in .env');
}

async function generateAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  const { data } = await axios.post(`${PAYPAL_BASE}/v1/oauth2/token`, params, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return data.access_token;
}

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { amountUSD, description } = req.body || {};
    if (!amountUSD) {
      return res.status(400).json({ error: 'amountUSD is required' });
    }
    const accessToken = await generateAccessToken();
    const order = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amountUSD
          },
          description: description || 'Gems Pack'
        }
      ]
    };
    const { data } = await axios.post(`${PAYPAL_BASE}/v2/checkout/orders`, order, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.json({ id: data.id });
  } catch (err) {
    console.error('create-order error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/paypal/capture-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const accessToken = await generateAccessToken();
    const { data } = await axios.post(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.json(data);
  } catch (err) {
    console.error('capture-order error', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

// Serve static frontend from project root
const rootPublic = path.resolve(__dirname, '..');
app.use(express.static(rootPublic));
app.get('*', (req, res) => {
  res.sendFile(path.join(rootPublic, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

