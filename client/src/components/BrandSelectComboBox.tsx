"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import FeedbackSwitchDialog from "./home/FeedbackSwitchDialog";

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  description?: string;
}
const BrandSelectComboBox = ({
  brands,
  value,
  onValueChange,
}: {
  brands: Brand[];
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-2"
          >
            {value
              ? brands.find((brand) => brand.id === value)?.name
              : "Select brand..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search brand..."
              className="h-9"
              required
            />
            <CommandList>
              <CommandEmpty className="p-3 max-w-[300px] text-center">
                No brand found. If you can't find it, you can use the{" "}
                <span
                  className="text-orange-500 cursor-pointer"
                  onClick={() => setFeedbackOpen(true)}
                >
                  {" "}
                  'Suggest Brand'
                </span>
                form.
              </CommandEmpty>
              <CommandGroup>
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.id}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {brand.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === brand.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Feedback Dialog */}
      <FeedbackSwitchDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
};

export default BrandSelectComboBox;
