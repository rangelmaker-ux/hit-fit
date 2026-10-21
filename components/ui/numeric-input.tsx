"use client";

import React, { useState, useEffect, useRef } from 'react';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string | null | undefined;
  onChangeValue?: (value: number | null, text: string) => void;
  onChange?: (value: number | null) => void;
  allowDecimals?: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  selectOnFocus?: boolean;
}

/**
 * NumericInput resistente:
 * - Não converte string vazia para 0 enquanto o usuário digita ou apaga.
 * - Ao apagar todo o conteúdo, o campo fica COMPLETAMENTE VAZIO.
 * - Aceita tanto vírgula (,) quanto ponto (.) para decimais no padrão brasileiro.
 * - Não impede estados intermediários como "12," ou "0.".
 * - Seleciona todo o conteúdo ao focar para facilitar substituição direta.
 * - Converte para número e valida no onChange e no blur.
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(function NumericInput(
  {
    value,
    onChangeValue,
    onChange,
    allowDecimals = true,
    min,
    max,
    step,
    placeholder = "",
    selectOnFocus = true,
    className = "",
    onFocus,
    onBlur,
    ...rest
  },
  forwardedRef
) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

  const notify = (num: number | null, raw: string) => {
    onChangeValue?.(num, raw);
    onChange?.(num);
  };

  // Converte valor externo em representação textual inicial
  const formatInitial = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'number') {
      if (isNaN(val)) return '';
      return String(val).replace('.', ',');
    }
    return String(val);
  };

  const [textValue, setTextValue] = useState<string>(() => formatInitial(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sincroniza com mudanças externas APENAS quando o campo não está em foco ativo
  useEffect(() => {
    if (!isFocused) {
      setTextValue(formatInitial(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Se o usuário apagou tudo, deixa rigorosamente vazio sem injetar 0
    if (raw === '') {
      setTextValue('');
      notify(null, '');
      return;
    }

    if (allowDecimals) {
      // Aceita apenas dígitos, uma vírgula ou um ponto
      const sanitized = raw.replace(/[^0-9.,]/g, '');
      const separatorsCount = (sanitized.match(/[.,]/g) || []).length;
      if (separatorsCount > 1) {
        return;
      }
      raw = sanitized;
    } else {
      raw = raw.replace(/\D/g, '');
    }

    setTextValue(raw);

    // Se terminar com vírgula ou ponto (ex: "12,"), não tenta converter para número ainda
    if (raw.endsWith(',') || raw.endsWith('.')) {
      const partial = parseFloat(raw.replace(',', '.'));
      notify(isNaN(partial) ? null : partial, raw);
      return;
    }

    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);

    if (isNaN(parsed)) {
      notify(null, raw);
    } else {
      notify(parsed, raw);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (selectOnFocus) {
      setTimeout(() => {
        e.target.select();
      }, 20);
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (textValue === '' || textValue.trim() === '') {
      notify(null, '');
      setTextValue('');
      onBlur?.(e);
      return;
    }

    const normalized = textValue.replace(',', '.');
    let parsed = parseFloat(normalized);

    if (isNaN(parsed)) {
      notify(null, '');
      setTextValue('');
    } else {
      if (min !== undefined && parsed < min) parsed = min;
      if (max !== undefined && parsed > max) parsed = max;

      notify(parsed, String(parsed).replace('.', ','));
      setTextValue(String(parsed).replace('.', ','));
    }

    onBlur?.(e);
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={textValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`text-base ${className}`}
      style={{
        fontSize: '16px',
        touchAction: 'manipulation',
        ...rest.style
      }}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
    />
  );
});
