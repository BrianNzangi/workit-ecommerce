'use client';

import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
  length?: number;
}

export default function OTPInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
}: OTPInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setVal = (idx: number, char: string) => {
    if (char.length > 1 || !/^\d*$/.test(char)) return;
    const digits = value.split('');
    digits[idx] = char;
    const next = digits.join('').slice(0, length);
    onChange(next);

    if (char && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }

    if (next.length === length) {
      onComplete?.();
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      const digits = value.split('');
      digits[idx - 1] = '';
      onChange(digits.join(''));
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length === length) {
      onComplete?.();
    }
    const targetIdx = Math.min(pasted.length, length - 1);
    refs.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => setVal(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          disabled={disabled}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/20 focus:border-primary-900 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
