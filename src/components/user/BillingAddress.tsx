"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

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
  const [billingAddress, setBillingAddress] = useState<BillingAddressData>({
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+254 712 345 678",
    address_1: "123 Main Street",
    city: "Nairobi",
    county: "Nairobi",
    postcode: "00100",
    country: "Kenya",
  });

  const [editData, setEditData] = useState<BillingAddressData>(billingAddress);

  const handleSave = () => {
    setBillingAddress(editData);
    setIsDialogOpen(false);
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
      <div className="bg-white border border-gray-100 shadow-xs p-6 flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-6">Billing Address</h2>

        <div className="flex-1">
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {billingAddress.first_name} {billingAddress.last_name}
            </p>
            <p className="text-gray-600">
              {billingAddress.address_1}, {billingAddress.city}, {billingAddress.county}
            </p>
            <p className="text-gray-600">Phone Number: {billingAddress.phone}</p>
            <p className="text-gray-600">Email: {billingAddress.email}</p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="flex items-center gap-2 w-full text-gray-400 justify-center"
          >
            <Edit size={16} />
            Edit
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title="Edit Billing Address">
        <DialogContent>
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
                <Input
                  id="county"
                  value={editData.county}
                  onChange={(e) => setEditData({ ...editData, county: e.target.value })}
                  className="mt-1"
                />
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
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#0046BE] text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
