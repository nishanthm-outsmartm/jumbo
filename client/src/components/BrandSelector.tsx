import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { categoryEnum } from "@/lib/const";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  isFavorable: boolean;
  description?: string;
}

interface BrandSelectorProps {
  selectedBrands: Brand[];
  onBrandsChange: (brands: Brand[]) => void;
  label: string;
  placeholder?: string;
  maxSelections?: number;
  brandAddDialog?: boolean;
  field?:"from"|"to";
}

export function BrandSelector({
  selectedBrands,
  onBrandsChange,
  label,
  placeholder = "Search brands...",
  maxSelections = 10,
  brandAddDialog = true,
  field

}: BrandSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBrandData, setNewBrandData] = useState({
    name: "",
    category: "",
    isIndian: field=="to",
    isFavorable: false,
    description: "",
  });

  const queryClient = useQueryClient();

  // Fetch all brands from the database
  const { data: allBrands = [] } = useQuery({
    queryKey: ["/api/brands/all"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/brands");
      return response.json();
    },
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (brandData: any) => {
      const response = await apiRequest("POST", "/api/brands", brandData);
      const data = await response.json();
      // console.log("Created brand:", data);
      return data as Brand;
    },
    onSuccess: (newBrand: Brand) => {
      // Add the new brand to selected brands
      if (selectedBrands.length < maxSelections) {
        const filteredNewBrand: Brand = {
          id: newBrand.id,
          name: newBrand.name,
          category: newBrand.category,
          isIndian: newBrand.isIndian,
          isFavorable: newBrand.isFavorable,
          description: newBrand.description,
        };
        // console.log("Adding new brand to selection:", filteredNewBrand);
        onBrandsChange([...selectedBrands, filteredNewBrand]);
      }
      // Reset form
      setNewBrandData({
        name: "",
        category: "",
        isIndian: field=="to",
        isFavorable:false,
        description: "",
      });
      setShowAddDialog(false);
      setSearchQuery("");
      // Invalidate search cache
      queryClient.invalidateQueries({ queryKey: ["/api/brands/search"] });
    },
  });

  const handleSelectBrand = (brand: Brand) => {
    const isAlreadySelected = selectedBrands.some((b) => b.id === brand.id);
    if (!isAlreadySelected && selectedBrands.length < maxSelections) {
      onBrandsChange([...selectedBrands, brand]);
    }
    setOpen(false);
    setSearchQuery("");
  };

  const handleRemoveBrand = (brandId: string) => {
    onBrandsChange(selectedBrands.filter((b) => b.id !== brandId));
  };

  const handleCreateBrand = () => {
    if (newBrandData.name && newBrandData.category) {
      createBrandMutation.mutate(newBrandData);
    }
  };

  // Filter brands client-side
  const filteredBrands = allBrands.filter((brand: Brand) => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFieldFilter = field === "from"
      ? !brand.isIndian
      : field === "to"
      ? brand.isIndian || brand.isFavorable
      : true; // fallback if field is something else

    return matchesSearch && matchesFieldFilter;
  });


  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Selected brands */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {selectedBrands.map((brand, _index) => (
          <Badge
            key={_index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {brand.name}
            <button
              type="button"
              onClick={() => handleRemoveBrand(brand.id)}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {selectedBrands.length < maxSelections && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 border-dashed">
                <Plus className="h-3 w-3 mr-1" />
                Add Brand
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <div className="p-2">
                <Input
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="h-48">
                  {filteredBrands.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No brands found.
                      {brandAddDialog && (
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() => {
                            setShowAddDialog(true);
                            setOpen(false);
                          }}
                        >
                          Add Brand
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredBrands.map((brand: Brand) => {
                      const isSelected = selectedBrands.some(
                        (b) => b.id === brand.id
                      );
                      return (
                        <div
                          key={brand.id}
                          className={cn(
                            " flex items-center justify-between px-2 py-1 cursor-pointer rounded hover:bg-accent",
                            isSelected && "opacity-50 pointer-events-none"
                          )}
                          onClick={() => handleSelectBrand(brand)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{brand.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {brand.category}
                              {brand.isIndian && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 h-4 text-xs"
                                >
                                  🇮🇳 Indian
                                </Badge>
                              )}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      );
                    })
                  )}
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Add new brand dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={newBrandData.name}
                onChange={(e) =>
                  setNewBrandData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Label htmlFor="brandCategory">Category</Label>
              <Select
                value={newBrandData.category}
                onValueChange={(value) =>
                  setNewBrandData((prev) => ({ ...prev, category: value }))
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
              {/* <Input
                id="brandCategory"
                value={newBrandData.category}
                onChange={(e) =>
                  setNewBrandData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                placeholder="e.g., Electronics, Food, Fashion"
              /> */}
            </div>
            <div>
              <Label htmlFor="brandDescription">Description (Optional)</Label>
              <Input
                id="brandDescription"
                value={newBrandData.description}
                onChange={(e) =>
                  setNewBrandData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the brand"
              />
            
            </div>
            <div className="flex items-center space-x-2 gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isIndian"
                checked={newBrandData.isIndian}
                onChange={(e) =>
                  setNewBrandData((prev) => ({
                    ...prev,
                    isIndian: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isIndian">Indian Brand</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFavorable"
                checked={newBrandData.isFavorable}
                onChange={(e) =>
                  setNewBrandData((prev) => ({
                    ...prev,
                    isFavorable: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isIndian">Is Favorable Brand</Label>
            </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBrand}
              disabled={
                !newBrandData.name ||
                !newBrandData.category ||
                createBrandMutation.isPending
              }
            >
              {createBrandMutation.isPending ? "Creating..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
