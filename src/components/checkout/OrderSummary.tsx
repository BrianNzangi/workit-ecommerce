<span>Ksh. {subtotal.toLocaleString()}</span>
      </div >

  {/* VAT */ }
  < div className = "flex justify-between text-sm" >
        <span>VAT ({(vatRate * 100).toFixed(0)}%)</span>
        <span>Ksh. {vat.toLocaleString()}</span>
      </div >

  {/* Shipping */ }
  < div className = "flex justify-between text-sm" >
        <span>Shipping</span>
        <span>Ksh. {shipping.toLocaleString()}</span>
      </div >

  {/* Discount */ }
{
  discount > 0 && (
    <div className="flex justify-between text-sm text-green-600">
      <span>Coupon ({coupon?.code})</span>
      <span>-Ksh. {discount.toLocaleString()}</span>
    </div>
  )
}

<hr />

{/* Total */ }
<div className="flex justify-between font-bold text-base">
  <span>Total</span>
  <span>Ksh. {total.toLocaleString()}</span>
</div>
    </div >
  );
}