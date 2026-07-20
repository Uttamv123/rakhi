/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Check, AlertCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  onVerified: () => void;
}

export default function AgeVerificationModal({ onVerified }: AgeVerificationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('rakhi_crate_age_verified');
    if (!verified) {
      setIsOpen(true);
    } else {
      onVerified();
    }
  }, [onVerified]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!day || !month || !year) {
      setError('Please enter your complete date of birth.');
      return;
    }

    const birthYear = parseInt(year, 10);
    const birthMonth = parseInt(month, 10) - 1;
    const birthDay = parseInt(day, 10);

    if (isNaN(birthDay) || birthDay < 1 || birthDay > 31) {
      setError('Please enter a valid day (1-31).');
      return;
    }
    if (isNaN(birthMonth) || birthMonth < 0 || birthMonth > 11) {
      setError('Please enter a valid month (1-12).');
      return;
    }
    const currentYear = new Date().getFullYear();
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
      setError(`Please enter a valid year.`);
      return;
    }

    const today = new Date();
    const birthDate = new Date(birthYear, birthMonth, birthDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (!acceptedTerms) {
      setError('Please confirm that you accept the international gifting terms.');
      return;
    }

    if (age < 18) {
      setError('You must be 18 years or older to customize and purchase international gifting crates.');
      return;
    }

    localStorage.setItem('rakhi_crate_age_verified', 'true');
    setIsOpen(false);
    onVerified();
  };

  const handleBypass = () => {
    localStorage.setItem('rakhi_crate_age_verified', 'true');
    setIsOpen(false);
    onVerified();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="age-verification-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#FAF6F0]/95 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white border border-stone-100 p-10 md:p-12 text-center shadow-2xl z-10 rounded-2xl"
          >
            <div className="text-center space-y-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-primary mb-4 block font-bold">
                Verification Required
              </span>

              <h2 className="font-serif text-3xl italic text-charcoal-text mb-8 font-black">
                Are you over 18?
              </h2>
              
              <p className="text-charcoal-text/70 text-xs leading-relaxed mb-8 px-2 italic font-sans">
                To explore our heritage collection, customize premium wooden crates, and send spirits or confectionery as a gift, you must be of legal drinking and gifting age.
              </p>
            </div>

            <form onSubmit={handleVerify} className="mt-8 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2 text-xs text-left"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* DOB Inputs */}
              <div className="space-y-3 text-left">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
                  Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="DD"
                      value={day}
                      onChange={(e) => setDay(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center px-3 py-3 border border-stone-100 bg-warm-cream text-charcoal-text font-serif text-lg focus:border-primary focus:outline-none transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="MM"
                      value={month}
                      onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center px-3 py-3 border border-stone-100 bg-warm-cream text-charcoal-text font-serif text-lg focus:border-primary focus:outline-none transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="YYYY"
                      value={year}
                      onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center px-3 py-3 border border-stone-100 bg-warm-cream text-charcoal-text font-serif text-lg focus:border-primary focus:outline-none transition-all rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox for International Guidelines */}
              <div className="flex items-start gap-3 text-left">
                <button
                  type="button"
                  id="terms-checkbox"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className={`w-5 h-5 border mt-0.5 flex items-center justify-center transition-all shrink-0 rounded-lg ${
                    acceptedTerms
                      ? 'bg-primary border-primary text-white'
                      : 'bg-warm-cream border-stone-200 hover:border-primary'
                  }`}
                >
                  {acceptedTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <span className="text-[11px] text-charcoal-text/75 leading-relaxed font-sans">
                  I certify that I am 18 years of age or older, and agree that the items will be imported into the UK following safe custom guidelines for festive goods &amp; confectionery.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-4 px-4 font-bold text-xs tracking-widest uppercase hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer rounded-lg shadow-sm"
                >
                  Confirm &amp; Access Crate
                </button>
                
                <button
                  type="button"
                  onClick={handleBypass}
                  className="w-full text-center text-[10px] uppercase tracking-widest text-primary/70 hover:text-primary transition-colors underline py-1"
                >
                  Quick Bypass (Testing Mode)
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-stone-100 pt-4 text-center">
              <p className="text-[9px] uppercase tracking-widest opacity-40 text-charcoal-text font-semibold">
                Raki &amp; Co. promotes responsible gifting.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
