"use client";

import React, { useState } from 'react';
import ForgotPasswordRequest from './ForgotPasswordRequest';
import ForgotPasswordOTP from './ForgotPasswordOTP';
import ForgotPasswordReset from './ForgotPasswordReset';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'otp' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOTPSent = (sentEmail: string) => {
    setEmail(sentEmail);
    setStep('otp');
    setResendTimer(60);
  };

  const handleOTPVerified = (enteredOTP: string) => {
    setOTP(enteredOTP);
    setStep('reset');
  };

  const handleResend = () => {
    setResendTimer(60);
  };

  const handleResetSuccess = (user: any, token: string) => {
    setSuccessMsg('Password has been reset successfully. You may now log in.');
    setStep('success');
    setTimeout(() => {
      router.push('/signin');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full backdrop-blur-sm bg-black/40">
      <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-[#090E15] rounded-[16px] relative text-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#13F195]">Forgot Password</h2>
        {step === 'request' && (
          <ForgotPasswordRequest onOTPSent={handleOTPSent} />
        )}
        {step === 'otp' && (
          <ForgotPasswordOTP
            email={email}
            onVerified={otp => handleOTPVerified(otp)}
            onResend={handleResend}
            resendTimer={resendTimer}
          />
        )}
        {step === 'reset' && (
          <ForgotPasswordReset
            email={email}
            otp={otp}
            onSuccess={handleResetSuccess}
          />
        )}
        {step === 'success' && (
          <div className="text-center text-green-600 font-semibold">{successMsg}</div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 