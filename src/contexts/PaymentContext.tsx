import { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentDetails, PaymentResponse } from '../types';
import { processPayment } from '../lib/paymentService';

interface PaymentContextType {
  isProcessing: boolean;
  paymentDetails: PaymentDetails | null;
  lastResponse: PaymentResponse | null;
  processPayment: (details: PaymentDetails, amount: number) => Promise<PaymentResponse>;
  clearPaymentState: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [lastResponse, setLastResponse] = useState<PaymentResponse | null>(null);

  const handlePayment = async (details: PaymentDetails, amount: number): Promise<PaymentResponse> => {
    setIsProcessing(true);
    setPaymentDetails(details);

    try {
      const response = await processPayment(details, amount);
      setLastResponse(response);
      return response;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearPaymentState = () => {
    setPaymentDetails(null);
    setLastResponse(null);
    setIsProcessing(false);
  };

  return (
    <PaymentContext.Provider
      value={{
        isProcessing,
        paymentDetails,
        lastResponse,
        processPayment: handlePayment,
        clearPaymentState,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
}
