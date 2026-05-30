"use client";

import { useState } from "react";
import { Bell, Mail, ShieldAlert, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SettingsPage() {
  const { customer, logout } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [promoNotifs, setPromoNotifs] = useState(true);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setDeleting(false);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
              <User className="text-primary-900" size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {customer?.firstName} {customer?.lastName}
              </p>
              <p className="text-sm text-gray-600">{customer?.emailAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Order updates</p>
                <p className="text-xs text-gray-500">Receive email updates about your orders</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifs}
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${emailNotifs ? "bg-primary-900" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow transition-transform ${emailNotifs ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">SMS notifications</p>
                <p className="text-xs text-gray-500">Get text messages for order status</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={smsNotifs}
              onClick={() => setSmsNotifs(!smsNotifs)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${smsNotifs ? "bg-primary-900" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow transition-transform ${smsNotifs ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </label>

          <label className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Promotions & deals</p>
                <p className="text-xs text-gray-500">Receive exclusive offers and discounts</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={promoNotifs}
              onClick={() => setPromoNotifs(!promoNotifs)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${promoNotifs ? "bg-primary-900" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow transition-transform ${promoNotifs ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </label>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <ShieldAlert size={18} />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This action is permanent and cannot be undone. All your data, orders, and account information will be deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
