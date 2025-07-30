"use client";

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

interface Props {
  onOTPSent: (email: string) => void;
}

const ForgotPasswordRequest: React.FC<Props> = ({ onOTPSent }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axiosInstance.post('/api/auth/forgot-password-otp', { email });
      setMessage(res.data.message);
      setResendTimer(60);
      setOtpSent(true);
      onOTPSent(email);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await axiosInstance.post('/api/auth/forgot-password-otp', { email });
      setMessage(res.data.message);
      setResendTimer(60);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-[#13F195] text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
      {otpSent && (
        <div className="text-center">
          {resendTimer > 0 ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Resend OTP in {resendTimer}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-[#13F195] hover:text-[#10D286] transition-colors disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>
      )}
      {message && <div className="mt-2 text-center text-sm">{message}</div>}
    </form>
  );
};

export default ForgotPasswordRequest; 