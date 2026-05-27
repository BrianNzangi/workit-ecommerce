import CheckoutHeader from "@/components/layout/header/CheckoutHeader";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CheckoutHeader />
      <main className="grow">{children}</main>
    </>
  );
}
