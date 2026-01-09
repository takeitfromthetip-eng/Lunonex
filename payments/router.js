module.exports = {
  routePayment: (contentType, amount) => {
    return contentType === 'adult' ? 'coinbase' : 'stripe';
  }
};
