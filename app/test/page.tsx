import { Suspense } from 'react';
import TestFlow from './TestFlow';

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
          <p className="text-sm text-ink-muted">불러오는 중...</p>
        </div>
      }
    >
      <TestFlow />
    </Suspense>
  );
}
