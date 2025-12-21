import React from 'react';

const PaymentPage = () => {
  return (
    <div className="payment-page">
      <h1>Upgrade Your Tier</h1>
      <p>Select your payment tier and proceed to checkout.</p>
      {/* Stripe integration available via storefront/payment API */}
      <button>Checkout with Stripe</button>
    </div>
  );
};

export default PaymentPage;
