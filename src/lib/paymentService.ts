import { PaymentDetails, PaymentResponse } from '../types';

/**
 * Mock Payment Service
 * Simulates payment processing for multiple payment methods
 */

// Simulate network delay
const simulateDelay = (ms: number = 1500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock validation for payment details
const validatePaymentDetails = (details: PaymentDetails): { valid: boolean; error?: string } => {
  switch (details.method) {
    case 'credit_card':
    case 'debit_card':
      if (!details.cardNumber || details.cardNumber.replace(/\s/g, '').length !== 16) {
        return { valid: false, error: 'Card number must be 16 digits' };
      }
      if (!details.cardHolder || details.cardHolder.trim().length < 3) {
        return { valid: false, error: 'Invalid cardholder name' };
      }
      if (!details.expiryDate || !/^\d{2}\/\d{2}$/.test(details.expiryDate)) {
        return { valid: false, error: 'Expiry date must be MM/YY' };
      }
      if (!details.cvv || details.cvv.length < 3 || details.cvv.length > 4) {
        return { valid: false, error: 'CVV must be 3-4 digits' };
      }
      // Mock decline certain card numbers (test cards)
      if (details.cardNumber.includes('4111111111111111')) {
        return { valid: false, error: 'Card declined' };
      }
      break;

    case 'upi':
      if (!details.upiId || !/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(details.upiId)) {
        return { valid: false, error: 'Invalid UPI ID format' };
      }
      break;

    case 'net_banking':
      if (!details.bankName || details.bankName.trim().length === 0) {
        return { valid: false, error: 'Please select a bank' };
      }
      break;

    case 'wallet':
      if (!details.walletProvider || details.walletProvider.trim().length === 0) {
        return { valid: false, error: 'Please select a wallet' };
      }
      break;

    case 'cash_on_delivery':
      // Cash on delivery requires no additional validation
      break;
  }

  return { valid: true };
};

// Generate mock transaction ID
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}${random}`;
};

// Mock payment processing
export const processPayment = async (details: PaymentDetails, amount: number): Promise<PaymentResponse> => {
  // Validate payment details
  const validation = validatePaymentDetails(details);
  if (!validation.valid) {
    return {
      success: false,
      transactionId: '',
      message: validation.error || 'Payment validation failed',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Simulate payment processing delay
    await simulateDelay(1500);

    // Mock occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        transactionId: '',
        message: 'Payment failed due to network error. Please try again.',
        timestamp: new Date().toISOString(),
      };
    }

    const transactionId = generateTransactionId();

    return {
      success: true,
      transactionId,
      message: `Payment of ₹${amount.toFixed(2)} processed successfully via ${getPaymentMethodName(details.method)}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      message: 'An unexpected error occurred during payment processing',
      timestamp: new Date().toISOString(),
    };
  }
};

// Get friendly payment method name
export const getPaymentMethodName = (method: PaymentDetails['method']): string => {
  const names: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    upi: 'UPI',
    net_banking: 'Net Banking',
    wallet: 'Digital Wallet',
    cash_on_delivery: 'Cash on Delivery',
  };
  return names[method] || method;
};

// Format card number (add spaces every 4 digits)
export const formatCardNumber = (value: string): string => {
  return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
};

// Format expiry date (MM/YY)
export const formatExpiryDate = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  return numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
};

// Format CVV (numbers only)
export const formatCVV = (value: string): string => {
  return value.replace(/\D/g, '').substring(0, 4);
};

// Mask card number for display
export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const lastFour = cleaned.slice(-4);
  return `**** **** **** ${lastFour}`;
};
