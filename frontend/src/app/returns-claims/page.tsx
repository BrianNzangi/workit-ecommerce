import React from "react";
import ReturnsClaims from "../../components/help/ReturnsClaims";

export default function ReturnsClaimsPage() {
  return (
    <main>
      <header className="bg-primary-900 py-12 font-sans">
        <div className="container mx-auto px-8">
          <div className="bg-white border-6 border-primary-500 rounded-xs p-8 text-gray-800">
            <h1 className="text-2xl font-bold mb-3">Warranty & Returns</h1>
            <p className="text-gray-700">
              How to return, replace or refund your order. Find answers to warranty, return and claim questions below.
            </p>
          </div>
        </div>
      </header>

      <ReturnsClaims />
    </main>
  );
}
