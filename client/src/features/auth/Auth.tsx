import { AppNavigation } from '@/shared/constants/navigation.constants';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoginForm } from './components/LoginForm';
import { OtpForm } from './components/OtpForm';
import { useAuth } from './context/AuthContext';
import type { AuthStep } from './types';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(AppNavigation.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = useCallback((userEmail: string) => {
    setEmail(userEmail);
    setStep('otp');
  }, []);

  const handleOtpSuccess = useCallback(() => {
    navigate(AppNavigation.DASHBOARD);
  }, [navigate]);

  const handleResend = useCallback(async () => {
    console.info('[Auth] Resend OTP requested');
  }, []);

  // Prevent UI flickering while AuthProvider is resolving the user status
  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* key prop forces a full remount between steps so form state is clean */}
      <LoginForm open={step === 'login'} onSuccess={handleLoginSuccess} />
      <OtpForm
        open={step === 'otp'}
        email={email}
        onSuccess={handleOtpSuccess}
        onResend={handleResend}
      />
    </>
  );
}
