/**
 * Payment Integration Documentation
 * 
 * This file provides a quick reference for the mock payment integration.
 */

// ============================================================================
// PAYMENT METHODS AVAILABLE
// ============================================================================

export const PAYMENT_METHODS = {
  CREDIT_CARD: {
    id: 'credit_card',
    name: 'Credit Card',
    emoji: '💳',
    description: 'Visa, Mastercard, American Express',
    testCard: '4532 1488 0343 6467',
    requirements: ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'],
  },
  DEBIT_CARD: {
    id: 'debit_card',
    name: 'Debit Card',
    emoji: '🏦',
    description: 'Debit cards from any bank',
    testCard: '5425 2334 3010 9903',
    requirements: ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'],
  },
  UPI: {
    id: 'upi',
    name: 'UPI',
    emoji: '📱',
    description: 'Google Pay, PhonePe, PayTM, WhatsApp Pay, etc.',
    testId: 'testuser@upi',
    requirements: ['upiId'],
  },
  NET_BANKING: {
    id: 'net_banking',
    name: 'Net Banking',
    emoji: '🏛️',
    description: 'Direct bank transfer',
    banks: [
      'HDFC Bank',
      'ICICI Bank',
      'State Bank of India',
      'Axis Bank',
      'Kotak Mahindra Bank',
      'Punjab National Bank',
    ],
    requirements: ['bankName'],
  },
  WALLET: {
    id: 'wallet',
    name: 'Digital Wallet',
    emoji: '💰',
    description: 'Google Pay, PhonePe, Paytm, Amazon Pay, WhatsApp Pay',
    wallets: [
      'Google Pay',
      'PhonePe',
      'Paytm',
      'Amazon Pay',
      'WhatsApp Pay',
    ],
    requirements: ['walletProvider'],
  },
};

// ============================================================================
// TEST CREDENTIALS
// ============================================================================

export const TEST_CREDENTIALS = {
  credit_card: {
    cardNumber: '4532 1488 0343 6467',
    cardHolder: 'John Doe',
    expiryDate: '12/25',
    cvv: '123',
  },
  debit_card: {
    cardNumber: '5425 2334 3010 9903',
    cardHolder: 'Jane Smith',
    expiryDate: '11/26',
    cvv: '456',
  },
  upi: {
    upiId: 'testuser@upi',
  },
  net_banking: {
    bankName: 'HDFC Bank',
  },
  wallet: {
    walletProvider: 'Google Pay',
  },
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  cardNumber: {
    format: '16 digits',
    pattern: /^\d{16}$/,
    example: '4532148803436467',
  },
  cardHolder: {
    format: 'Any valid name',
    pattern: /^[a-zA-Z\s]{3,}$/,
    example: 'John Doe',
  },
  expiryDate: {
    format: 'MM/YY',
    pattern: /^\d{2}\/\d{2}$/,
    example: '12/25',
  },
  cvv: {
    format: '3-4 digits',
    pattern: /^\d{3,4}$/,
    example: '123',
  },
  upiId: {
    format: 'username@upi',
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/,
    example: 'testuser@upi',
  },
};

// ============================================================================
// PAYMENT RESPONSE FORMAT
// ============================================================================

/*
Success Response:
{
  success: true,
  transactionId: "TXN-3Z8K7L9Q0M",
  message: "Payment of ₹1,050.00 processed successfully via Credit Card",
  timestamp: "2026-03-10T10:30:00.000Z"
}

Error Response:
{
  success: false,
  transactionId: "",
  message: "Card declined" | "Invalid UPI ID format" | etc.
  timestamp: "2026-03-10T10:30:00.000Z"
}
*/

// ============================================================================
// INTEGRATION GUIDE
// ============================================================================

/*
1. IMPORTS:
   import { usePayment } from '@/contexts/PaymentContext';
   import PaymentModal from '@/components/PaymentModal';
   import { PaymentDetails } from '@/types';

2. USAGE IN COMPONENT:
   const { processPayment } = usePayment();
   const [paymentModalOpen, setPaymentModalOpen] = useState(false);

3. PROCESS PAYMENT:
   const handlePayment = async (paymentDetails: PaymentDetails) => {
     const response = await processPayment(paymentDetails, amount);
     if (response.success) {
       // Create order with transaction ID
       // response.transactionId available here
     }
   };

4. RENDER MODAL:
   <PaymentModal
     isOpen={paymentModalOpen}
     amount={totalAmount}
     onClose={() => setPaymentModalOpen(false)}
     onSubmit={handlePayment}
     isProcessing={isProcessing}
     error={errorMessage}
     success={isSuccess}
     transactionId={txnId}
   />
*/

// ============================================================================
// MOCK BEHAVIOR
// ============================================================================

/*
- All card validations are performed client-side
- Network delay is simulated (1.5 seconds)
- 90% payment success rate (10% random failures)
- Transactions generate realistic IDs (TXN-XXXXXXXXXX)
- All payment methods are fully functional
- No actual payment processing occurs
*/

export const PAYMENT_INFO = {
  description: 'Complete mock payment system with 5 payment methods',
  features: [
    'Credit Card / Debit Card support',
    'UPI payment integration',
    'Net Banking option',
    'Digital Wallet support',
    'Client-side validation',
    'Realistic transaction IDs',
    'Simulated network delays',
    'Comprehensive error handling',
    'Payment receipt with transaction ID',
    'Order status updates after payment',
  ],
};
