import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex flex-col items-center justify-center min-h-[70vh] text-center font-[DM_SANS] px-4">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-64 mb-2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
      </main>
    }>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
