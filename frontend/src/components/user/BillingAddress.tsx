"use client";

import { useState, useEffect } from "react";
import { Edit, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomer, useUpdateCustomer } from "@/hooks/useCustomer";

interface BillingAddressData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export function BillingAddress() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: customerData, isLoading: loading, error: queryError } = useCustomer();
  const updateCustomer = useUpdateCustomer();
  const billingAddress = customerData?.billing || {
    first_name: "", last_name: "", email: "", phone: "",
    address_1: "", city: "", county: "", postcode: "", country: "Kenya",
  };
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load billing address') : null;
  const [saving, setSaving] = useState(false);

  const [editData, setEditData] = useState<BillingAddressData>(billingAddress);

  useEffect(() => {
    setEditData(billingAddress);
  }, [billingAddress]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await updateCustomer.mutateAsync({ billing: editData });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving billing address:', error);
      alert('Failed to save billing address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(billingAddress);
    setIsDialogOpen(false);
  };

  const handleEditClick = () => {
    setEditData(billingAddress);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {loading ? (
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="text-center text-gray-500 py-4">
              <p>{error}</p>
              <p className="text-sm mt-2">Please add your billing information.</p>
            </div>
          ) : !billingAddress.first_name && !billingAddress.last_name ? (
            <div className="text-center text-gray-500 py-4">
              <p>No billing address set up yet.</p>
              <p className="text-sm mt-2">Click edit to add your billing information.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {billingAddress.first_name} {billingAddress.last_name}
              </p>
              {billingAddress.address_1 && (
                <p className="text-gray-600">
                  {billingAddress.address_1}
                  {billingAddress.city && `, ${billingAddress.city}`}
                  {billingAddress.county && `, ${billingAddress.county}`}
                </p>
              )}
              {billingAddress.phone && (
                <p className="text-gray-600">Phone: {billingAddress.phone}</p>
              )}
              {billingAddress.email && (
                <p className="text-gray-600">Email: {billingAddress.email}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="flex items-center gap-2 w-full text-gray-400 justify-center"
          >
            <Edit size={16} />
            Edit
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Billing Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={editData.first_name}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={editData.last_name}
                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address_1" className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Input
                id="address_1"
                value={editData.address_1}
                onChange={(e) => setEditData({ ...editData, address_1: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  value={editData.city}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                  County
                </Label>
                <div className="relative mt-1">
                  <select
                    id="county"
                    value={editData.county}
                    onChange={(e) => setEditData({ ...editData, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-900 appearance-none pr-10"
                  >
                    <option value="">Select County</option>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Machakos">Machakos</option>
                    <option value="Kajiado">Kajiado</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                  Postcode
                </Label>
                <Input
                  id="postcode"
                  value={editData.postcode}
                  onChange={(e) => setEditData({ ...editData, postcode: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                Country
              </Label>
              <Select
                value={editData.country}
                onValueChange={(value) => setEditData({ ...editData, country: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary-900 text-white"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
