import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandSelector } from "./BrandSelector";
import { Calendar, Target, Award, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  description?: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  targetCategory?: string | null;
  fromBrandIds: string[];
  fromBrands?: Brand[];
  toBrandIds: string[];
  toBrands?: Brand[];
  pointsReward: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface EnhancedMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMissionCreated?: () => void;
  mission?: Mission | null;
}

export function EnhancedMissionDialog({
  open,
  onOpenChange,
  onMissionCreated,
  mission,
}: EnhancedMissionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // If editing, prefill state from mission prop
  const [missionData, setMissionData] = useState(() =>
    mission
      ? {
          title: mission.title,
          description: mission.description,
          category: mission.targetCategory || mission.category,
          fromBrandIds: mission.fromBrandIds,
          toBrandIds: mission.toBrandIds,
          pointsReward: mission.pointsReward,
          startDate: mission.startDate ? mission.startDate.slice(0, 10) : "",
          endDate: mission.endDate ? mission.endDate.slice(0, 10) : "",
          isActive: mission.isActive,
        }
      : {
          title: "",
          description: "",
          category: "",
          fromBrandIds: [],
          toBrandIds: [],
          pointsReward: 50,
          startDate: "",
          endDate: "",
          isActive: true,
        }
  );

  const [selectedFromBrands, setSelectedFromBrands] = useState<Brand[]>([]);
  const [selectedToBrands, setSelectedToBrands] = useState<Brand[]>([]);

  // Create or update mission mutation
  const missionMutation = useMutation({
    mutationFn: (data: any) => {
      if (mission && mission.id) {
        // Edit mode
        return apiRequest(
          "PUT",
          `/api/moderation/missions/${mission.id}`,
          data
        );
      } else {
        // Create mode
        return apiRequest("POST", "/api/moderation/missions", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/missions"] });
      resetForm();
      onOpenChange(false);
      onMissionCreated?.();
    },
  });

  const resetForm = () => {
    setMissionData({
      title: "",
      description: "",
      category: "",
      fromBrandIds: [],
      toBrandIds: [],
      pointsReward: 50,
      startDate: "",
      endDate: "",
      isActive: true,
    });
    setSelectedFromBrands([]);
    setSelectedToBrands([]);
  };

  // Query to fetch all brands
  const { data: allBrands = [] } = useQuery({
    queryKey: ["/api/brands/all"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/brands");
      return response.json();
    },
  });

  // When dialog opens for edit, prefill brands
  React.useEffect(() => {
    if (open && mission) {
      setMissionData({
        title: mission.title,
        description: mission.description,
        category: mission.targetCategory || mission.category,
        fromBrandIds: mission.fromBrandIds,
        toBrandIds: mission.toBrandIds,
        pointsReward: mission.pointsReward,
        startDate: mission.startDate ? mission.startDate.slice(0, 10) : "",
        endDate: mission.endDate ? mission.endDate.slice(0, 10) : "",
        isActive: mission.isActive,
      });
      // Optionally, fetch brand objects for selectedFromBrands and selectedToBrands
      if (mission.fromBrandIds.length > 0 || mission.toBrandIds.length > 0) {
        if (allBrands.length > 0) {
          setSelectedFromBrands(
            allBrands.filter((b: any) => mission.fromBrandIds.includes(b.id))
          );
          setSelectedToBrands(
            allBrands.filter((b: any) => mission.toBrandIds.includes(b.id))
          );
        }
      } else {
        setSelectedFromBrands([]);
        setSelectedToBrands([]);
      }
    } else if (open && !mission) {
      resetForm();
    }
  }, [open, mission, allBrands]);

  const handleSubmit = () => {
    if (!missionData.title || !missionData.description || !missionData.category)
      return;

    const missionPayload = {
      ...missionData,
      targetCategory: missionData.category,
      fromBrandIds: selectedFromBrands.map((b) => b.id),
      toBrandIds: selectedToBrands.map((b) => b.id),
      createdBy: user?.id,
      startDate: missionData.startDate
        ? new Date(missionData.startDate).toString()
        : null,
      endDate: missionData.endDate
        ? new Date(missionData.endDate).toString()
        : null,
    };

    missionMutation.mutate(missionPayload);
  };

  const categories = [
    "Food & Beverages",
    "Electronics",
    "Fashion & Clothing",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Sports & Fitness",
    "Books & Education",
    "Automotive",
    "Health & Wellness",
    "Travel & Tourism",
  ];

  const categoryEnum: Record<string, string> = {
    FOOD_BEVERAGES: "Food & Beverages",
    ELECTRONICS: "Electronics",
    FASHION: "Fashion & Clothing",
    BEAUTY: "Beauty & Personal Care",
    HOME_GARDEN: "Home & Garden",
    AUTOMOTIVE: "Automotive",
    SPORTS: "Sports & Fitness",
    BOOKS_MEDIA: "Books & Education",
    OTHER: "Other",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {mission ? "Edit Mission" : "Create New Mission"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="missionTitle">Mission Title *</Label>
              <Input
                id="missionTitle"
                value={missionData.title}
                onChange={(e) =>
                  setMissionData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Switch from Maggi to Local Noodle Brands"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="missionDescription">Description *</Label>
              <Textarea
                id="missionDescription"
                value={missionData.description}
                onChange={(e) =>
                  setMissionData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the mission objectives and benefits of switching..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="missionCategory">Category *</Label>
              <Select
                value={missionData.category}
                onValueChange={(value) =>
                  setMissionData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryEnum).map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryEnum[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Brand Selection */}
          <div className="space-y-4">
            <BrandSelector
              selectedBrands={selectedFromBrands}
              onBrandsChange={setSelectedFromBrands}
              label="Brands to Switch FROM (Foreign/Target Brands)"
              placeholder="Search foreign brands to switch from..."
              maxSelections={5}
            />

            <BrandSelector
              selectedBrands={selectedToBrands}
              onBrandsChange={setSelectedToBrands}
              label="Indian Alternative Brands (Switch TO)"
              placeholder="Search Indian brands to recommend..."
              maxSelections={10}
            />
          </div>

          {/* Mission Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pointsReward" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                Points Reward
              </Label>
              <Input
                id="pointsReward"
                type="number"
                min="10"
                max="500"
                value={missionData.pointsReward}
                onChange={(e) =>
                  setMissionData((prev) => ({
                    ...prev,
                    pointsReward: parseInt(e.target.value) || 50,
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="startDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={missionData.startDate}
                onChange={(e) =>
                  setMissionData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={missionData.endDate}
                onChange={(e) =>
                  setMissionData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="mt-1"
                min={missionData.startDate}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !missionData.title ||
              !missionData.description ||
              !missionData.category ||
              selectedFromBrands.length === 0 ||
              missionMutation.isPending
            }
          >
            {missionMutation.isPending
              ? mission
                ? "Saving..."
                : "Creating..."
              : mission
              ? "Save Changes"
              : "Create Mission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
