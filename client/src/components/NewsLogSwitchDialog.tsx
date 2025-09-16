import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@/lib/api";
import BrandSelectComboBox from "@/components/BrandSelectComboBox";

const categories = [
  { value: "FOOD_BEVERAGES", label: "Food & Beverages" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FASHION", label: "Fashion" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "HOME_GARDEN", label: "Home & Garden" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "SPORTS", label: "Sports" },
  { value: "BOOKS_MEDIA", label: "Books & Media" },
  { value: "OTHER", label: "Other" },
];

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  isFavorable: boolean;
  description?: string;
}

interface LogSwitchDialogProps {
  newsId: string;
}

export default function NewsLogSwitchDialog({ newsId }: LogSwitchDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    fromBrand: "",
    toBrand: "",
    category: "",
    reason: "",
    isPublic: false,
    evidenceUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });

  const logSwitchMutation = useMutation({
    mutationFn: async (switchData: any) => {
      const response = await apiRequest("POST", `/api/switches`, switchData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Switch logged successfully!",
        description: `You earned 25 XP for making a switch${
          formData.isPublic ? " and sharing it!" : "!"
        }`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setOpen(false);
      setFormData({
        fromBrand: "",
        toBrand: "",
        category: "",
        reason: "",
        isPublic: false,
        evidenceUrl: "",
      });
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Error logging switch",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let evidenceUrl = "";
      if (selectedFile) {
        const uploadResult = await api.uploadImage(selectedFile);
        evidenceUrl = uploadResult.url;
        setFormData({ ...formData, evidenceUrl });
      }

      if (!formData.fromBrand || !formData.toBrand) {
        toast({
          title: "Both brands are required",
          variant: "destructive",
        });
        return;
      }

      if (formData.fromBrand === formData.toBrand) {
        toast({
          title: "From and To brands cannot be the same",
          variant: "destructive",
        });
        return;
      }

      await logSwitchMutation.mutateAsync({
        userId: user.id,
        newsId,
        fromBrandId: formData.fromBrand,
        toBrandId: formData.toBrand,
        category: formData.category,
        reason: formData.reason,
        isPublic: formData.isPublic,
        points: 25,
        evidenceUrl,
      });
    } catch (error) {
      console.error("Error logging switch:", error);
      toast({
        title: "Error logging switch",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          Log Your Switch
        </Button> */}
        <button className="rounded-full px-4 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all">
          Act on this
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>Log Your Switch</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-2">
            {/* Brand Switch */}
            <div className="bg-gradient-to-r from-red-50 to-green-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <Label className="text-red-600 font-medium">
                    Switching FROM
                  </Label>
                  <BrandSelectComboBox
                    value={formData.fromBrand}
                    brands={brands.filter((brand) => !brand.isIndian)}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, fromBrand: value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Foreign/Non-preferred brand
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-8 w-8 text-orange-500" />
                </div>

                <div className="text-center">
                  <Label className="text-green-600 font-medium">
                    Switching TO
                  </Label>
                  <BrandSelectComboBox
                    value={formData.toBrand}
                    brands={brands.filter(
                      (brand) => brand.isIndian || brand.isFavorable
                    )}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, toBrand: value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Indian/Preferred brand
                  </p>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Product Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div>
              <Label>Why did you make this switch?</Label>
              <Textarea
                placeholder="Share your experience..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="mt-1"
                rows={4}
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <Label>Add Photo Evidence (Optional)</Label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                <Camera className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">
                  Upload a photo of your new product or purchase receipt
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="mt-2 text-sm text-gray-600"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Reward Preview */}
            {/* <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-900">
                      Reward Preview
                    </h4>
                    <p className="text-sm text-orange-700">
                      Base: 25 XP{" "}
                      {formData.isPublic && "+ 10 XP bonus for sharing"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      {formData.isPublic ? "35" : "25"} XP
                    </p>
                  </div>
                </div>
              </div> */}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                disabled={logSwitchMutation.isPending}
              >
                {logSwitchMutation.isPending
                  ? "Logging Switch..."
                  : "Log My Switch"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
