'use client';
import React from 'react';
import { useSignForm } from '@/app/auth/validationSchema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { SubmitHandler } from 'react-hook-form';
import { SignDto } from '@/lib/types/auth.type';
export type AuthMode = 'signup' | 'signin';

interface SignFormProps {
  mode: AuthMode;
  onSubmit: SubmitHandler<SignDto>;
}

export default function SignForm({ mode, onSubmit }: SignFormProps) {
  const isSignUp = mode === 'signup';
  const title = isSignUp ? 'Sign Up' : 'Sign In';
  const description = isSignUp
    ? 'Complete all the fields to create an account.'
    : 'Enter your credentials to sign in.';
  const buttonText = isSignUp ? 'Create an account' : 'Sign In';
  const linkMessage = isSignUp
    ? 'Already have an account?'
    : "Don't have an account yet?";
  const link = isSignUp ? '/auth?mode=signIn' : '/auth?mode=signUp';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useSignForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 items-start">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register('email')}
                  type="text"
                  placeholder="example@yourmail.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  {...register('password')}
                  type="text"
                  placeholder="At least 8 characters & one capital letter"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                {buttonText}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link href={link} className="underline">
                {linkMessage}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
