"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

interface AccountInfoData {
  name: string;
  email: string;
  phone: string;
}

export function AccountInfo() {
  const { customer, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfoData>({
    name: "",
    email: "",
    phone: "",
  });

  const [editData, setEditData] = useState<AccountInfoData>(accountInfo);

  useEffect(() => {
    if (customer && !loading) {
      const userData = {
        name: `${customer.firstName} ${customer.lastName}`.trim() || 'User',
        email: customer.emailAddress || '',
        phone: customer.phoneNumber || '',
      };
      setAccountInfo(userData);
      setEditData(userData);
    }
  }, [customer, loading]);

  const handleSave = () => {
    setAccountInfo(editData);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setEditData(accountInfo);
    setIsDialogOpen(false);
  };

  const handleEditClick = () => {
    setEditData(accountInfo);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white border border-gray-100 shadow-xs p-6 flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-6">Account Information</h2>

        <div className="flex-1">
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">{accountInfo.name}</p>
            <p className="text-gray-600">Phone Number: {accountInfo.phone}</p>
            <p className="text-gray-600">Email: {accountInfo.email}</p>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} title="Edit Account Information">
        <DialogContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="mt-1"
              />
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
