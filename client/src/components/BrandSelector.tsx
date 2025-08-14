import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, X, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  description?: string;
}

interface BrandSelectorProps {
  selectedBrands: Brand[];
  onBrandsChange: (brands: Brand[]) => void;
  label: string;
  placeholder?: string;
  maxSelections?: number;
}

export function BrandSelector({
  selectedBrands,
  onBrandsChange,
  label,
  placeholder = "Search brands...",
  maxSelections = 10
}: BrandSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBrandData, setNewBrandData] = useState({
    name: '',
    category: '',
    isIndian: true,
    description: ''
  });

  const queryClient = useQueryClient();

  // Search brands query
  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/brands/search', searchQuery],
    queryFn: () => apiRequest(`/api/brands/search?query=${encodeURIComponent(searchQuery)}`),
    enabled: searchQuery.length > 0,
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: (brandData: any) => apiRequest('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandData)
    }),
    onSuccess: (newBrand) => {
      // Add the new brand to selected brands
      if (selectedBrands.length < maxSelections) {
        onBrandsChange([...selectedBrands, newBrand]);
      }
      // Reset form
      setNewBrandData({ name: '', category: '', isIndian: true, description: '' });
      setShowAddDialog(false);
      setSearchQuery('');
      // Invalidate search cache
      queryClient.invalidateQueries({ queryKey: ['/api/brands/search'] });
    }
  });

  const handleSelectBrand = (brand: Brand) => {
    const isAlreadySelected = selectedBrands.some(b => b.id === brand.id);
    if (!isAlreadySelected && selectedBrands.length < maxSelections) {
      onBrandsChange([...selectedBrands, brand]);
    }
    setOpen(false);
    setSearchQuery('');
  };

  const handleRemoveBrand = (brandId: string) => {
    onBrandsChange(selectedBrands.filter(b => b.id !== brandId));
  };

  const handleCreateBrand = () => {
    if (newBrandData.name && newBrandData.category) {
      createBrandMutation.mutate(newBrandData);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Selected brands */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {selectedBrands.map((brand) => (
          <Badge key={brand.id} variant="secondary" className="flex items-center gap-1">
            {brand.name}
            <button
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
              <Button 
                variant="outline" 
                size="sm"
                className="h-6 border-dashed"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Brand
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput 
                  placeholder={placeholder}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        No brands found for "{searchQuery}"
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setNewBrandData(prev => ({ ...prev, name: searchQuery }));
                          setShowAddDialog(true);
                          setOpen(false);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create "{searchQuery}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((brand: Brand) => {
                      const isSelected = selectedBrands.some(b => b.id === brand.id);
                      return (
                        <CommandItem
                          key={brand.id}
                          onSelect={() => handleSelectBrand(brand)}
                          disabled={isSelected}
                          className={cn(
                            "flex items-center justify-between",
                            isSelected && "opacity-50"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{brand.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {brand.category}
                              {brand.isIndian && (
                                <Badge variant="outline" className="ml-2 h-4 text-xs">
                                  🇮🇳 Indian
                                </Badge>
                              )}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
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
                onChange={(e) => setNewBrandData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Label htmlFor="brandCategory">Category</Label>
              <Input
                id="brandCategory"
                value={newBrandData.category}
                onChange={(e) => setNewBrandData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Electronics, Food, Fashion"
              />
            </div>
            <div>
              <Label htmlFor="brandDescription">Description (Optional)</Label>
              <Input
                id="brandDescription"
                value={newBrandData.description}
                onChange={(e) => setNewBrandData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the brand"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isIndian"
                checked={newBrandData.isIndian}
                onChange={(e) => setNewBrandData(prev => ({ ...prev, isIndian: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isIndian">Indian Brand</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBrand}
              disabled={!newBrandData.name || !newBrandData.category || createBrandMutation.isPending}
            >
              {createBrandMutation.isPending ? 'Creating...' : 'Create Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}