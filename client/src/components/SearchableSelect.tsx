import * as React from "react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Brand {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  formData: {
    fromBrand: string;
    toBrand: string;
    category: string;
    reason: string;
    isPublic: boolean;
    evidenceUrl: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      fromBrand: string;
      toBrand: string;
      category: string;
      reason: string;
      isPublic: boolean;
      evidenceUrl: string;
    }>
  >;
  brands: Brand[];
}

export function SearchableSelect({
  formData,
  setFormData,
  brands,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter brands based on search term
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  return (
    <Select
      value={formData.fromBrand}
      onValueChange={(value) => setFormData({ ...formData, fromBrand: value })}
      required
    >
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="Select brand" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>
        <ScrollArea className="h-[200px]">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-gray-500">No brands found</div>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
