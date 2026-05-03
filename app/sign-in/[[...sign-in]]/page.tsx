import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignInPage() {
  return (
    <Suspense>
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <SignIn />
      </div>
    </Suspense>
  );
}