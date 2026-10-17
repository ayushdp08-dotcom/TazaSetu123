import React, { useState, useEffect } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Store,
  Coffee,
  UtensilsCrossed,
  Cake,
  Sparkles,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_CONFIGS } from '../data/initialData';

export const LoginPage: React.FC = () => {
  const {
    selectedBusinessType,
    loginWithPhone,
    verifyOtp,
    setCurrentRoute
  } = useApp();

  const config = BUSINESS_CONFIGS[selectedBusinessType];

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoNotice, setDemoNotice] = useState(true);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      loginWithPhone(`+91 ${cleanNumber}`, selectedBusinessType);
      setLoading(false);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
    }, 600);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const success = verifyOtp(fullOtp);
      setLoading(false);
      if (success) {
        setCurrentRoute('onboarding');
      } else {
        setErrorMsg('Invalid OTP. Please check the code or use the demo OTP: 123456');
      }
    }, 700);
  };

  const handleQuickDemoOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  const getBusinessIcon = () => {
    switch (selectedBusinessType) {
      case 'grocery': return <Store className="w-8 h-8 text-emerald-600" />;
      case 'cafe': return <Coffee className="w-8 h-8 text-emerald-600" />;
      case 'restaurant': return <UtensilsCrossed className="w-8 h-8 text-emerald-600" />;
      case 'bakery': return <Cake className="w-8 h-8 text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfb] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={() => setCurrentRoute('welcome')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Business Selection</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200/90 rounded-2xl sm:px-10">
          {/* Header branding */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              {getBusinessIcon()}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-2">
              {config.name}
            </div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              {step === 'phone' ? 'Sign in to Taaza Setu' : 'Verify Phone Number'}
            </h2>
            <p className="mt-1 text-xs text-neutral-500 max-w-xs mx-auto">
              {step === 'phone'
                ? `Log in to manage ${config.name.toLowerCase()} inventory and demand forecasting.`
                : `We sent a 6-digit verification code to +91 ${phoneNumber}`}
            </p>
          </div>

          {/* Dev / Demo Mode Notice Banner */}
          <div className="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Development / Demo OTP Sandbox:</span> Real SMS gateway requires live Supabase Twilio/MSG91 credentials. In demo mode, enter any 10-digit number and use OTP{' '}
              <button
                type="button"
                onClick={handleQuickDemoOtp}
                className="font-bold underline text-amber-950 hover:text-emerald-700 ml-1"
              >
                123456 (Click to Fill)
              </button>
              .
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-neutral-500 border-r border-neutral-300 pr-2">
                      🇮🇳 +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="98200 12345"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full pl-20 pr-4 py-2.5 text-sm bg-neutral-50/50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white text-neutral-900 placeholder:text-neutral-400 font-medium"
                  />
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  We'll send an SMS verification OTP to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-box-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-11 h-12 text-center text-lg font-bold border border-neutral-300 rounded-xl bg-neutral-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all text-neutral-900"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="font-medium hover:text-neutral-900 underline"
                >
                  Change number
                </button>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(30);
                      setCanResend(false);
                    }}
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend in {timer}s</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>End-to-end encrypted session • Multi-tenant safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
