
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./trainingFormSchema";

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isAdmin?: boolean;
};

export function AccessibleTrainingDateField({ form, isAdmin = false }: Props) {
  console.log("Rendering AccessibleTrainingDateField with isAdmin:", isAdmin);
  
  // Function to suggest training times based on day of week but allows modification
  const suggestTimesByDay = (date: Date) => {
    if (!date) return;
    
    const dayOfWeek = date.getDay();
    
    // Only set times if they haven't been manually changed
    // Tuesday (2) or Friday (5)
    if (dayOfWeek === 2 || dayOfWeek === 5) {
      form.setValue("startTime", "18:00");
      form.setValue("endTime", "21:30");
      console.log("Suggested times for Tuesday/Friday: 18:00 - 21:30");
    } 
    // Saturday (6)
    else if (dayOfWeek === 6) {
      form.setValue("startTime", "09:00");
      form.setValue("endTime", "12:30");
      console.log("Suggested times for Saturday: 09:00 - 12:30");
    }
  };
  
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-white font-medium">
            Date de l'entraînement
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal bg-white/10 border-white/20 text-white",
                    !field.value && "text-gray-400"
                  )}
                >
                  {field.value ? (
                    format(field.value, "dd/MM/yyyy")
                  ) : (
                    <span>Sélectionnez une date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date);
                  if (date) {
                    suggestTimesByDay(date);
                  }
                }}
                disabled={isAdmin ? undefined : (date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage className="text-white" />
        </FormItem>
      )}
    />
  );
}
