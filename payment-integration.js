class PaymentManager {
  constructor() {
    this.paypal = null;
  }

  async initializePayPal(clientId) {
    this.paypal = window.paypal || null;
    return true;
  }

  async processPayPalPayment(gemsAmount, usdPrice) {
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD: usdPrice.toString(), description: `${gemsAmount} Gems Pack` })
      });
      const { id } = await res.json();
      if (!id) throw new Error('No order id');

      // Capture via backend
      const capRes = await fetch(`/api/paypal/capture-order/${id}`, { method: 'POST' });
      if (!capRes.ok) throw new Error('Capture failed');
      const details = await capRes.json();
      return details && details.status === 'COMPLETED';
    } catch (e) {
      console.error('processPayPalPayment failed', e);
      return false;
    }
  }
}

window.PaymentManager = PaymentManager;

