"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

const HelpHero = () => {
  return (
    <section className="bg-primary-900 py-20 font-[DM_SANS]">
      <div className="container mx-auto px-8">
        <div className="bg-white border-8 border-primary-500 rounded-xs shadow-xl p-10 text-gray-800 ">
          <h1 className="text-3xl font-bold mb-6">Welcome to Workit Customer Support</h1>

          <p className="mb-6 leading-relaxed">
            For faster and more personalized assistance, please contact us directly through your
            <Link href="/sign-in" className="font-bold text-primary-900 hover:underline">Workit account</Link> using the <strong>Help</strong>, <strong>Return</strong>, or
            <strong> Warranty</strong> options.
          </p>

          <p className="mb-6 leading-relaxed">
            If you haven’t made a purchase yet, simply fill out the form below, our support team will get back to you within two business days.
          </p>

          <div className="flex gap-4 mt-8">
            <SignUpButton mode="modal">
              <button className="bg-primary-900 text-white px-6 py-3 rounded-xs font-medium hover:bg-primary-800 transition">
                Create an Account
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="text-primary-900 font-medium border border-primary-900 px-6 py-3 rounded-xs hover:bg-primary-50 transition">
                Already a member? Log-in here.
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpHero;
