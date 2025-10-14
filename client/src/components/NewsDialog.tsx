import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { BrandSelector } from "./BrandSelector";

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  isFavorable: boolean;
  description?: string;
}
const newsArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrls: z.array(z.string().url()).optional(),
  source: z.string().optional(),
  suggestedFromBrandIds: z.array(z.string()).optional(),
  suggestedToBrandIds: z.array(z.string()).optional(),
  commentsEnabled: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  createdBy: z.string(),
});

const NewsDialog = ({
  showNewsDialog,
  setShowNewsDialog,
  news,
}: {
  showNewsDialog: boolean;
  setShowNewsDialog: (open: boolean) => void;
  news?: {
    id: string;
    title: string;
    description: string;
    imageUrls: string[];
    source: string;
    suggestedFromBrandIds: string[];
    suggestedToBrandIds: string[];
    commentsEnabled: boolean;
    isPublished: boolean;
    createdBy: string;
  };
}) => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const [selectedSuggestedFromBrands, setSelectedSuggestedFromBrands] =
    useState<string[]>([]);
  const [selectedSuggestedToBrands, setSelectedSuggestedToBrands] = useState<
    string[]
  >([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  //   const [selectedFromBrands, setSelectedFromBrands] = useState<string[]>([]);
  //   const [selectedToBrands, setSelectedToBrands] = useState<string[]>([]);
  const [selectedFromBrands, setSelectedFromBrands] = useState<Brand[]>([]);
  const [selectedToBrands, setSelectedToBrands] = useState<Brand[]>([]);

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!news || brands.length === 0) return;

    if (news.suggestedFromBrandIds) {
      setSelectedSuggestedFromBrands(news.suggestedFromBrandIds);

      const filteredFromBrands = brands.filter(
        (brand) => news.suggestedFromBrandIds.includes(brand.id) // assuming brand has an `id`
      );
      // do something with filteredFromBrands if needed
      setSelectedFromBrands(filteredFromBrands);
    }

    if (news.suggestedToBrandIds) {
      setSelectedSuggestedToBrands(news.suggestedToBrandIds);

      const filteredToBrands = brands.filter(
        (brand) => news.suggestedToBrandIds.includes(brand.id) // assuming brand has an `id`
      );
      // do something with filteredToBrands if needed
      setSelectedToBrands(filteredToBrands);
    }
  }, [news, brands]);

  const newsForm = useForm({
    resolver: zodResolver(newsArticleSchema),
    defaultValues: news ?? {
      title: "",
      description: "",
      source: "",
      imageUrls: [],
      suggestedFromBrandIds: [],
      suggestedToBrandIds: [],
      commentsEnabled: true,
      isPublished: true,
      createdBy: user?.id || "",
    },
  });

  const createNewsArticleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/moderation/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrls: imageUrls.filter((url) => url.trim()),
          suggestedFromBrandIds: selectedSuggestedFromBrands,
          suggestedToBrandIds: selectedSuggestedToBrands,
        }),
      });
      if (!response.ok) throw new Error("Failed to create news article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/news"] });
      toast({ title: "News article created successfully" });
      newsForm.reset();
      setShowNewsDialog(false);
      setImageUrls([""]);
      setSelectedSuggestedFromBrands([]);
      setSelectedSuggestedToBrands([]);
    },
  });

  const updateNewsArticleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!news) return;
      const response = await fetch(`/api/moderation/news/${news.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrls: imageUrls.filter((url) => url.trim()),
          suggestedFromBrandIds: selectedSuggestedFromBrands,
          suggestedToBrandIds: selectedSuggestedToBrands,
        }),
      });
      if (!response.ok) throw new Error("Failed to create news article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/news"] });
      toast({ title: "News article updated successfully" });
      newsForm.reset();
      setShowNewsDialog(false);
      setImageUrls([""]);
      setSelectedSuggestedFromBrands([]);
      setSelectedSuggestedToBrands([]);
    },
  });

  // Utility functions
  //   const addBrandToSelection = (
  //     brandId: string,
  //     type: "from" | "to" | "suggestedFrom" | "suggestedTo"
  //   ) => {
  //     switch (type) {
  //       case "from":
  //         if (!selectedFromBrands.includes(brandId)) {
  //           setSelectedFromBrands([...selectedFromBrands, brandId]);
  //         }
  //         break;
  //       case "to":
  //         if (!selectedToBrands.includes(brandId)) {
  //           setSelectedToBrands([...selectedToBrands, brandId]);
  //         }
  //         break;
  //       case "suggestedFrom":
  //         if (!selectedSuggestedFromBrands.includes(brandId)) {
  //           setSelectedSuggestedFromBrands([
  //             ...selectedSuggestedFromBrands,
  //             brandId,
  //           ]);
  //         }
  //         break;
  //       case "suggestedTo":
  //         if (!selectedSuggestedToBrands.includes(brandId)) {
  //           setSelectedSuggestedToBrands([...selectedSuggestedToBrands, brandId]);
  //         }
  //         break;
  //     }
  //   };
  //   const removeBrandFromSelection = (
  //     brandId: string,
  //     type: "from" | "to" | "suggestedFrom" | "suggestedTo"
  //   ) => {
  //     switch (type) {
  //       case "from":
  //         setSelectedFromBrands(
  //           selectedFromBrands.filter((id) => id !== brandId)
  //         );
  //         break;
  //       case "to":
  //         setSelectedToBrands(selectedToBrands.filter((id) => id !== brandId));
  //         break;
  //       case "suggestedFrom":
  //         setSelectedSuggestedFromBrands(
  //           selectedSuggestedFromBrands.filter((id) => id !== brandId)
  //         );
  //         break;
  //       case "suggestedTo":
  //         setSelectedSuggestedToBrands(
  //           selectedSuggestedToBrands.filter((id) => id !== brandId)
  //         );
  //         break;
  //     }
  //   };

  const handleSubmitAction = (data: any) => {
    if (!news) {
      newsForm.handleSubmit((data) => createNewsArticleMutation.mutate(data));
    } else if (news && news.id) {
      newsForm.handleSubmit((data) => updateNewsArticleMutation.mutate(data));
    }
  };

  const handleSelectedFromBrands = (brands: Brand[]) => {
    queryClient.invalidateQueries({ queryKey: ["/api/brands/all"] });
    setSelectedFromBrands(brands);
    const brandIds = brands.map((brand) => brand.id);
    setSelectedSuggestedFromBrands(brandIds);
  };

  const handleSelectedToBrands = (brands: Brand[]) => {
    queryClient.invalidateQueries({ queryKey: ["/api/brands/all"] });
    setSelectedToBrands(brands);
    const brandIds = brands.map((brand) => brand.id);
    setSelectedSuggestedToBrands(brandIds);
  };
  return (
    <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pt-2">
            {news ? "Edit News Article" : "Create News Article"}
          </DialogTitle>
        </DialogHeader>
        <Form {...newsForm}>
          <form
            onSubmit={newsForm.handleSubmit((data) => {
              if (!news) {
                createNewsArticleMutation.mutate(data);
              } else {
                updateNewsArticleMutation.mutate(data);
              }
            })}
            className="space-y-4"
          >
            <FormField
              control={newsForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter news title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={newsForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your news article content..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={newsForm.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Source</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter news source" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div>
                                    placeholder="Enter news title"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
  
                          {/* <div>
                            <Label>Image URLs</Label>
                            <div className="space-y-2 mt-2">
                              {imageUrls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={url}
                                    onChange={(e) =>
                                      updateImageUrl(index, e.target.value)
                                    }
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeImageUrl(index)}
                                    disabled={imageUrls.length === 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addImageUrl}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Image
                              </Button>
                            </div>
                          </div> */}

            <div>
              <Label>Suggested Switch From Brands</Label>
              <div className="mt-2 space-y-2">
                {/* <Select
                  onValueChange={(brandId) =>
                    addBrandToSelection(brandId, "suggestedFrom")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brands to suggest switching from" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands
                      .filter(
                        (brand: any) =>
                          !selectedSuggestedFromBrands.includes(brand.id)
                      )
                      .map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestedFromBrands.map((brandId) => {
                    const brand = brands.find((b: any) => b.id === brandId);
                    return (
                      <Badge
                        key={brandId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {brand?.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() =>
                            removeBrandFromSelection(brandId, "suggestedFrom")
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div> */}
                <BrandSelector
                  selectedBrands={selectedFromBrands}
                  onBrandsChange={handleSelectedFromBrands}
                  label="Brands to Switch FROM (Foreign/Target Brands)"
                  placeholder="Search foreign brands to switch from..."
                  maxSelections={10}
                  field="from"
                />
              </div>
            </div>

            <div>
              <Label>Suggested Switch To Brands</Label>
              <div className="mt-2 space-y-2">
                {/* <Select
                  onValueChange={(brandId) =>
                    addBrandToSelection(brandId, "suggestedTo")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brands to suggest switching to" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands
                      .filter(
                        (brand: any) =>
                          !selectedSuggestedToBrands.includes(brand.id)
                      )
                      .map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestedToBrands.map((brandId) => {
                    const brand = brands.find((b: any) => b.id === brandId);
                    return (
                      <Badge
                        key={brandId}
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        {brand?.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() =>
                            removeBrandFromSelection(brandId, "suggestedTo")
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div> */}
                <BrandSelector
                  selectedBrands={selectedToBrands}
                  onBrandsChange={handleSelectedToBrands}
                  label="Indian Alternative Brands (Switch TO)"
                  placeholder="Search Indian brands to recommend..."
                  maxSelections={10}
                  field="to"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="comments-enabled"
                  checked={newsForm.watch("commentsEnabled")}
                  onCheckedChange={(checked) =>
                    newsForm.setValue("commentsEnabled", checked)
                  }
                />
                <Label htmlFor="comments-enabled">Enable Comments</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-published"
                  checked={newsForm.watch("isPublished")}
                  onCheckedChange={(checked) =>
                    newsForm.setValue("isPublished", checked)
                  }
                />
                <Label htmlFor="is-published">Publish Immediately</Label>
              </div>
            </div>

            {news ? (
              <Button
                type="submit"
                disabled={updateNewsArticleMutation.isPending}
                className="w-full"
              >
                Update News Article
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createNewsArticleMutation.isPending}
                className="w-full"
              >
                Create News Article
              </Button>
            )}
          </form>
        </Form>
        <Button
          variant="outline"
          className="lg:hidden pt-2 w-full"
          onClick={() => setShowNewsDialog(false)}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDialog;
