import React, { useState } from 'react';

import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onLogin: (email: string, password?: string) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onLogin(emailInput, passwordInput);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f111a] z-50 flex items-center justify-center p-4 select-none overflow-hidden">
      {/* Background Decorative Blurred Spheres for Glassmorphism Context */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-[#db2777]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="bg-white/85 backdrop-blur-xl rounded-[32px] max-w-5xl w-full h-[620px] shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-white/20 overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between h-full relative z-20">
          {/* Brand Header */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <div className="grid grid-cols-2 gap-1 w-3.5 h-3.5">
                <div className="bg-white rounded-xs"></div>
                <div className="bg-purple-400 rounded-xs"></div>
                <div className="bg-purple-400 rounded-xs"></div>
                <div className="bg-white rounded-xs"></div>
              </div>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none block">
                Insight Scope
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Enterprise Operations</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6 my-auto pt-8">
            <div>
              <h2 className="text-3.5xl font-black text-slate-950 tracking-tight leading-none">
                Hello,
              </h2>
              <h2 className="text-3.5xl font-black text-slate-950 tracking-tight leading-none mt-1">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-2">
                Hey, welcome back to your special place
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50/80 border border-red-200/60 text-red-700 rounded-2xl text-[11px] font-bold backdrop-blur-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-white/70 border border-slate-200/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500/80 transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-12 py-3.5 bg-white/70 border border-slate-200/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500/80 transition-all text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact system administrator to reset password.')}
                  className="text-[#7c3aed] hover:text-[#6d28d9] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center space-x-2 text-xs"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] text-slate-400 font-semibold text-center border-t border-slate-200/40 pt-4 mt-auto">
            JWT-secured identity validation enabled
          </div>
        </div>

        {/* Right Side: Mockup Illustration */}
        <div className="hidden md:block w-1/2 relative bg-[#8b5cf6]/10">
          <div
            className="absolute inset-0 bg-cover bg-center rounded-r-[30px]"
            style={{
              backgroundImage: 'url(/login_illustration.png)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
