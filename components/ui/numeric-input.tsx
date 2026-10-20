"use client";

import React, { useState, useEffect, useRef } from 'react';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string | null | undefined;
  onChangeValue: (value: number | null, text: string) => void;
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

  // Converte valor externo em representação textual inicial
  const formatInitialText = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '';
    return String(val);
  };

  const [textValue, setTextValue] = useState<string>(() => formatInitialText(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sincroniza com prop externa apenas quando o usuário NÃO estiver digitando ativamente no campo
  useEffect(() => {
    if (!isFocused) {
      setTextValue(formatInitialText(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Se o usuário apagou tudo, mantenha o campo completamente vazio!
    if (raw === '') {
      setTextValue('');
      onChangeValue(null, '');
      return;
    }

    // Normaliza separador decimal (aceita tanto vírgula quanto ponto)
    if (allowDecimals) {
      // Substitui múltiplos separadores, permitindo apenas um
      // Permite apenas dígitos, uma vírgula ou um ponto
      const sanitized = raw.replace(/[^\d.,]/g, '');
      
      // Conta separadores
      const separators = sanitized.match(/[,.]/g);
      if (separators && separators.length > 1) {
        // Se houver mais de um separador, ignore a digitação do segundo
        return;
      }
      raw = sanitized;
    } else {
      // Apenas números inteiros
      raw = raw.replace(/\D/g, '');
    }

    setTextValue(raw);

    // Se terminar com vírgula ou ponto (ex: "12,"), não tenta converter para número ainda
    if (raw.endsWith(',') || raw.endsWith('.')) {
      // Notifica com null ou valor parcial, mas mantém texto
      const partial = parseFloat(raw.replace(',', '.'));
      onChangeValue(isNaN(partial) ? null : partial, raw);
      return;
    }

    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);

    if (isNaN(parsed)) {
      onChangeValue(null, raw);
    } else {
      onChangeValue(parsed, raw);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (selectOnFocus) {
      // Seleciona todo o conteúdo após micro-delay para compatibilidade móvel
      setTimeout(() => {
        e.target.select();
      }, 20);
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (textValue === '' || textValue.trim() === '') {
      onChangeValue(null, '');
      setTextValue('');
      onBlur?.(e);
      return;
    }

    const normalized = textValue.replace(',', '.');
    let parsed = parseFloat(normalized);

    if (isNaN(parsed)) {
      setTextValue('');
      onChangeValue(null, '');
    } else {
      // Aplica restrições de min e max caso especificadas
      if (typeof min === 'number' && parsed < min) parsed = min;
      if (typeof max === 'number' && parsed > max) parsed = max;

      const formatted = String(parsed);
      setTextValue(formatted);
      onChangeValue(parsed, formatted);
    }

    onBlur?.(e);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={textValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      {...rest}
    />
  );
});
