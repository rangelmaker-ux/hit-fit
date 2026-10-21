"use client";

import React from 'react';
import { AuthLoginView } from '@/components/auth-login-view';
import { AuthenticatedUser } from '@/lib/auth-client';

interface OnboardingAuthViewProps {
  onAuthenticated: (user: AuthenticatedUser) => void;
  onRestoreBackup?: () => void;
}

/**
 * Legado HIT-FIT: Redireciona para o fluxo oficial de login simplificado por PIN
 */
export function OnboardingAuthView({ onAuthenticated }: OnboardingAuthViewProps) {
  return <AuthLoginView onAuthenticated={onAuthenticated} />;
}
