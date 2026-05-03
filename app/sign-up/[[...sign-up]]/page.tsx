import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <Suspense>
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <SignUp />
      </div>
    </Suspense>
  );
}