{/* Coupon */ }
<div className="space-y-1">
  <label htmlFor="coupon" className="text-sm font-medium">
    Coupon Code
  </label>
  <div className="flex gap-2">
    <input
      type="text"
      id="coupon"
      value={coupon}
      onChange={(e) => setCoupon(e.target.value)}
      className="flex-1 border rounded px-3 py-1.5 text-sm"
      placeholder="Enter code e.g. SAVE10"
    />
    <button
      onClick={applyCoupon}
      className="text-sm bg-[#0046BE] text-white px-3 py-1.5 rounded hover:bg-black transition"
    >
      Apply
    </button>
  </div>
  {error && <p className="text-xs text-red-500">{error}</p>}
  {discount > 0 && (
    <p className="text-sm text-green-600">
      Discount applied: -KES {discount.toFixed(2)}
    </p>
  )}
</div>

{/* Totals */ }
<div className="flex justify-between text-sm">
  <span>Subtotal</span>
  <span>KES {subtotal.toFixed(2)}</span>
</div>
{
  discount > 0 && (
    <div className="flex justify-between text-sm text-green-600">
      <span>Discount</span>
      <span>-KES {discount.toFixed(2)}</span>
    </div>
  )
}
      <div className="flex justify-between font-semibold text-base border-t pt-2">
        <span>Total</span>
        <span>KES {discountedTotal.toFixed(2)}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full bg-black text-white py-2 rounded text-sm font-semibold hover:bg-gray-800 transition"
      >
        Proceed to Checkout
      </button>

      <div className="text-xs text-gray-500 mt-3 space-y-1 leading-snug">
        <p>Workit protects your payment information</p>
        <p>Every transaction is secure and encrypted</p>
        <p>We do not store your payment card’s CVV, ensuring your privacy</p>
      </div>
    </div >
  );
}