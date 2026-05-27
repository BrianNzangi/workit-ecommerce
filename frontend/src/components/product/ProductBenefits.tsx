"use client"

import { ChevronRight, Handshake, ShieldCheck, Undo2 } from "lucide-react"

export default function ProductBenefits() {
  return (
    <div className="mt-2 space-y-4 text-left">
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-accent-100 p-2 text-accent-900">
          <ShieldCheck size={20} />
        </span>
        <div>
          <div className="flex items-center text-base font-semibold">
            Security & Privacy <ChevronRight size={16} />
          </div>
          <div className="grid text-base text-gray-900">
            <span>• 100% Secure payment</span>
            <span>• Secure privacy</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="rounded-full bg-accent-100 p-2 text-accent-900">
          <Undo2 size={20} />
        </span>
        <div>
          <div className="flex items-center text-base font-semibold">
            FREE Returns <ChevronRight size={16} />
          </div>
          <div className="grid text-base text-gray-900">
            <span>• 30-day Free Returns</span>
            <span>• Refund for lost/damaged items</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="rounded-full bg-accent-100 p-2 text-accent-900">
          <Handshake size={20} />
        </span>
        <div>
          <div className="flex items-center text-base font-semibold">
            Professional Service <ChevronRight size={16} />
          </div>
          <div className="grid text-base text-gray-900">
            <span>• 12-month warranty</span>
            <span>• Customer Support</span>
          </div>
        </div>
      </div>
    </div>
  )
}
