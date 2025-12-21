import React, { useState, useEffect } from 'react';
import { supabase } from './dashboardUtils';

export const PaymentConfirmation = ({ userId }) => {
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    supabase
      .from('payments')
      .select('status')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setStatus(data[0].status);
      });
  }, [userId]);

  return (
    <div className="payment-status">
      <h3>Payment Status: {status}</h3>
    </div>
  );
};
