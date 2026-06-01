module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  try {
    const id = String(req.query.id || '').trim();

    if (!id) {
      res.status(400).json({ message: 'PromptPay payment id is required.' });
      return;
    }

    res.status(200).json({
      id,
      status: 'pending',
      demo: false,
      poll: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load PromptPay payment.' });
  }
};