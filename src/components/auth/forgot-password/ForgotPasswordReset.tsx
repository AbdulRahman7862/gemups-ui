"use client";

import React, { useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { EyeIcon, EyeCloseIcon } from '@/icons';

interface Props {
  email: string;
  otp: string;
  onSuccess: (user: any, token: string) => void;
}

const ForgotPasswordReset: React.FC<Props> = ({ email, otp, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const isValid = newPassword.length >= 6 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!isValid) {
      setMessage('Passwords must match and be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/auth/reset-password-otp', { email, otp, newPassword });
      if (res.data.success) {
        setMessage(res.data.message);
        onSuccess(res.data.user, res.data.token);
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
        <label htmlFor="newPassword" className="block mb-1 text-gray-700 dark:text-gray-300">New Password</label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 pr-10"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
          >
            {showPassword ? (
              <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
            ) : (
              <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
            )}
          </span>
        </div>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block mb-1 text-gray-700 dark:text-gray-300">Confirm Password</label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 pr-10"
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
          >
            {showConfirmPassword ? (
              <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
            ) : (
              <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
            )}
          </span>
        </div>
      </div>
      {!passwordsMatch && confirmPassword.length > 0 && (
        <div className="text-red-500 text-xs text-center">Passwords do not match.</div>
      )}
      <button
        type="submit"
        disabled={loading || !isValid}
        className="w-full bg-[#13F195] text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <div className="mt-2 text-center text-sm">{message}</div>}
    </form>
  );
};

export default ForgotPasswordReset; 