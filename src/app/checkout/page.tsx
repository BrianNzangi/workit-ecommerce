import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import CheckoutClient from "@/components/checkout/CheckoutClient"

export default async function CheckoutPage() {
  const user = await currentUser()
  if (!user) redirect("/sign-in?redirect_url=/checkout")

  return (
    <CheckoutClient
      user={{
        id: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.emailAddresses?.[0]?.emailAddress || "",
      }}
    />
  )
}