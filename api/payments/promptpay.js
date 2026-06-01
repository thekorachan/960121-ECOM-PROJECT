const parseBody = (body) => (typeof body === 'string' ? JSON.parse(body || '{}') : body || {});

const promptPayPhone = '0931498129';

const getPromptPayAmountPath = (amount) => {
  const baht = amount / 100;
  return Number.isInteger(baht) ? String(baht) : baht.toFixed(2);
};

const createPromptPayPayment = ({ amount, currency }) => {
  const chargeId = `promptpay_${Date.now()}`;
  const amountPath = getPromptPayAmountPath(amount);

  return {
    id: chargeId,
    status: 'pending',
    amount,
    currency,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    qr_image: `https://promptpay.io/${promptPayPhone}/${amountPath}.png`,
    demo: false,
    poll: false,
  };
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  try {
    const body = parseBody(req.body);
    const amount = Number(body.amount);
    const currency = String(body.currency || 'THB').toUpperCase();

    if (!Number.isInteger(amount) || amount < 2000 || amount > 15000000) {
      res.status(400).json({ message: 'PromptPay amount must be between THB20.00 and THB150,000.00.' });
      return;
    }

    if (currency !== 'THB') {
      res.status(400).json({ message: 'PromptPay only supports THB.' });
      return;
    }

    const charge = createPromptPayPayment({ amount, currency });
    res.status(200).json(charge);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create PromptPay payment.' });
  }
};