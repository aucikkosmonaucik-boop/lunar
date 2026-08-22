import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Direct the browser to the backend verification handler
      window.location.href = `/api/auth/verify-email?token=${encodeURIComponent(token)}`;
    } else {
      navigate('/login?error=missing_token', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <Loader2 className="w-8 h-8 text-[#8C6D4F] animate-spin mb-4" />
      <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} className="text-2xl tracking-[0.15em] text-[#1a1a1a] uppercase font-light">
        Verifying Account
      </h2>
      <p className="text-sm text-gray-500 mt-2 font-light">
        Please wait while we confirm your email address and activate your Lunar profile...
      </p>
    </div>
  );
};

export default VerifyEmailPage;
