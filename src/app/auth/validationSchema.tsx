'use client';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignDto } from '@/lib/types/auth.type';
import { z } from 'zod';

// Base schemas
const emailSchema = z.string().email('Invalid email format.');
const passwordSchema = z
  .string()
  .regex(/^(?=.*[A-Z])(?!^[A-Za-z]+$)(?!^[0-9]+$).+$/)
  .min(8, 'Minimum 8 characters, at least one capital letter and one number.');

// Auth schemas
export const signSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sign up form hook
export function useSignForm(): UseFormReturn<SignDto> {
  return useForm<SignDto>({
    resolver: zodResolver(signSchema),
    defaultValues: { email: '', password: '' },
  });
}
