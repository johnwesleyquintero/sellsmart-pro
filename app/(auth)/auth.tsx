import React, { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signUp, signIn, signOut } from '../../lib/auth';
import { useToast } from '../../components/ui/use-toast';
import { Toaster } from '../../components/ui/toaster';
import { supabase } from '../../lib/supabaseClient';

interface Session {
  user: {
    name: string;
  };
}

interface AuthError {
  message: string;
}

const AuthPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const session = supabase.auth.session();
    if (session) {
      console.log('User is logged in:', session.user);
      router.push('/dashboard'); // Redirect to dashboard or another page
    } else {
      console.log('No user session found.');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: unknown, session: Session | null) => {
      if (session) {
        console.log('User signed in:', session.user);
        router.push('/dashboard'); // Redirect to dashboard or another page
      } else {
        console.log('User signed out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp({ email, password });
        if (error) {
          throw error;
        } else {
          alert('Sign up successful! Please check your email to verify.');
          router.push('/dashboard'); // Redirect to dashboard or another page
        }
      } else {
        const { error } = await signIn({ email, password });
        if (error) {
          throw error;
        } else {
          alert('Sign in successful!');
          router.push('/dashboard'); // Redirect to dashboard or another page
        }
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 ">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form >
        <button
          className="mt-4 text-sm text-blue-500 hover:text-blue-700"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default AuthPage;
