import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface StripePaymentModalProps {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency?: string;
  orderNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  isDark?: boolean;
}

const PaymentForm: React.FC<{
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onClose: () => void;
}> = ({ amount, currency, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please check your details and try again.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        // In case of 3DS redirect handled by Stripe
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Stripe submission error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred during payment processing.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-[#FAF8F5] dark:bg-[#161616] p-4 border border-[#EAE3D9] dark:border-[#2E2E2E] rounded-none">
        <PaymentElement
          id="payment-element"
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#AAAAAA] pt-1">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#C1A98F]" />
          <span>256-bit SSL Encrypted</span>
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stripe Protected</span>
        </span>
      </div>

      <div className="pt-2 space-y-2.5">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-[#1A1A1A] dark:bg-[#C1A98F] text-white dark:text-[#121212] py-4 px-6 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#D4AF37] dark:hover:bg-[#D4AF37] hover:text-black transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authorising Payment...</span>
            </>
          ) : (
            <span>Pay {currency === 'EUR' ? '€' : currency} {amount.toFixed(2)}</span>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="w-full text-center py-2.5 text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Cancel and return to cart
        </button>
      </div>
    </form>
  );
};

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  clientSecret,
  publishableKey,
  amount,
  currency = 'EUR',
  orderNumber,
  isOpen,
  onClose,
  onSuccess,
  isDark = false,
}) => {
  if (!isOpen || !clientSecret || !publishableKey) return null;

  const stripePromise = React.useMemo(() => loadStripe(publishableKey), [publishableKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1E1E1E] border border-[#EAE3D9] dark:border-[#2E2E2E] shadow-2xl p-4 sm:p-8 transition-colors max-h-[92dvh] overflow-y-auto my-auto rounded-sm">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] text-[#C1A98F] font-bold uppercase tracking-[0.35em] mb-1">
            LUNAR SECURE CHECKOUT
          </p>
          <h3
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            className="text-2xl sm:text-3xl text-[#1A1A1A] dark:text-[#F5F5F5] font-light uppercase tracking-wide"
          >
            Complete Payment
          </h3>
          {orderNumber && (
            <p className="text-xs text-gray-400 dark:text-[#888888] font-mono mt-1">
              Ref: {orderNumber}
            </p>
          )}
        </div>

        {/* Stripe Elements Provider */}
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: isDark ? 'night' : 'stripe',
              variables: {
                colorPrimary: '#C1A98F',
                colorBackground: isDark ? '#1E1E1E' : '#FFFFFF',
                colorText: isDark ? '#F5F5F5' : '#1A1A1A',
                colorDanger: '#EF4444',
                fontFamily: 'Montserrat, sans-serif',
                borderRadius: '0px',
              },
            },
          }}
        >
          <PaymentForm
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>
  );
};
export default StripePaymentModal;
