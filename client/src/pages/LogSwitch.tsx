import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Camera, Globe, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api"; // Import the API module
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

export default function LogSwitch() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fromBrand: "",
    toBrand: "",
    category: "",
    reason: "",
    isPublic: false,
    evidenceUrl: "", // Added imageUrl to formData
  });

  const [fromBrandSearch, setFromBrandSearch] = useState("");
  const [toBrandSearch, setToBrandSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for selected file

  // Search brands for autocomplete
  const { data: fromBrandsData } = useQuery({
    queryKey: ["/api/brands/search", { q: fromBrandSearch }],
    enabled: fromBrandSearch.length > 2,
  });

  const { data: toBrandsData } = useQuery({
    queryKey: ["/api/brands/search", { q: toBrandSearch }],
    enabled: toBrandSearch.length > 2,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });

  const createBrandMutation = useMutation({
    mutationFn: async (brandData: any) => {
      const response = await apiRequest("POST", "/api/brands", brandData);
      return response.json();
    },
  });

  const logSwitchMutation = useMutation({
    mutationFn: async (switchData: any) => {
      const response = await apiRequest("POST", "/api/switches", switchData);
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
      setFormData({
        fromBrand: "",
        toBrand: "",
        category: "",
        reason: "",
        isPublic: false,
        evidenceUrl: "",
      });
      setSelectedFile(null);
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error logging switch",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB
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
      // Upload image if selected
      if (selectedFile) {
        const uploadResult = await api.uploadImage(selectedFile);
        evidenceUrl = uploadResult.url; // Assuming the API returns { url: string }
        setFormData({ ...formData, evidenceUrl });
      }

      if (!formData.fromBrand) {
        toast({
          title: "Please select a brand to switch from",
          variant: "destructive",
        });
        return;
      }
      if (!formData.toBrand) {
        toast({
          title: "Please select a brand to switch to",
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
      // Create brands if they don't exist
      // let fromBrandId = null;
      // let toBrandId = null;

      // // Create "from" brand
      // const fromBrandResult = await createBrandMutation.mutateAsync({
      //   name: formData.fromBrand,
      //   category: formData.category,
      //   isIndian: false,
      // });
      // fromBrandId = fromBrandResult.brand.id;

      // // Create "to" brand
      // const toBrandResult = await createBrandMutation.mutateAsync({
      //   name: formData.toBrand,
      //   category: formData.category,
      //   isIndian: true,
      // });
      // toBrandId = toBrandResult.brand.id;

      // Log the switch
      await logSwitchMutation.mutateAsync({
        userId: user.id,
        fromBrandId: formData.fromBrand,
        toBrandId: formData.toBrand,
        category: formData.category,
        reason: formData.reason,
        isPublic: formData.isPublic,
        points: 25,
        evidenceUrl, // Include imageUrl in the switch data
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

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Log Your Switch
          </h1>
          <p className="text-gray-600">
            Share your journey to Indian alternatives
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Switch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Switch Visual */}
              <div className="bg-gradient-to-r from-red-50 to-green-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* From Brand */}
                  <div className="text-center">
                    <Label className="text-red-600 font-medium">
                      Switching FROM
                    </Label>
                    {/* <Input
                      placeholder="e.g., Coca Cola"
                      value={formData.fromBrand}
                      onChange={(e) =>
                        setFormData({ ...formData, fromBrand: e.target.value })
                      }
                      className="mt-2 border-red-200 focus:border-red-400"
                      required
                    /> */}
                    {/* <Select
                      value={formData.fromBrand}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fromBrand: value })
                      }
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
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

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-8 w-8 text-orange-500" />
                  </div>

                  {/* To Brand */}
                  <div className="text-center">
                    <Label className="text-green-600 font-medium">
                      Switching TO
                    </Label>
                    {/* <Input
                      placeholder="e.g., Thums Up"
                      value={formData.toBrand}
                      onChange={(e) =>
                        setFormData({ ...formData, toBrand: e.target.value })
                      }
                      className="mt-2 border-green-200 focus:border-green-400"
                    /> */}
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
                  placeholder="Share your experience... Quality? Price? Supporting local business? Taste? etc."
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
                    className="mt-2 text-sm text-gray-600 text-wrap"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG up to 5MB
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-gray-600 mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Points Preview */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
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
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
