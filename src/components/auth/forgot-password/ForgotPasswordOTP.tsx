"use client";

import React, { useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

interface Props {
  email: string;
  onVerified: (otp: string) => void;
  onResend: () => void;
  resendTimer: number;
}

const ForgotPasswordOTP: React.FC<Props> = ({ email, onVerified, onResend, resendTimer }) => {
  const [otp, setOTP] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axiosInstance.post('/api/auth/verify-reset-otp', { email, otp });
      if (res.data.success) {
        setMessage(res.data.message);
        onVerified(otp);
      } else {
        setMessage(res.data.message);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block mb-1 text-gray-700 dark:text-gray-300">Enter OTP</label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={e => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          maxLength={6}
          className="w-full border rounded px-3 py-2 tracking-widest text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
        />
      </div>
      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-[#13F195] text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      <div className="text-center">
        {resendTimer > 0 ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Resend OTP in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="text-sm text-[#13F195] hover:text-[#10D286] transition-colors disabled:opacity-50"
          >
            Resend OTP
          </button>
        )}
      </div>
      {message && <div className="mt-2 text-center text-sm">{message}</div>}
    </form>
  );
};

export default ForgotPasswordOTP; 