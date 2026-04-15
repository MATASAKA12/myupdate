'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || "Invalid email or password");
  }

  // Successful login → go to dashboard
  redirect('/dashboard');
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:3000',
    },
  });

  if (error) {
    throw new Error(error.message || "Signup failed");
  }

  return { success: true, needsConfirmation: true };
}
