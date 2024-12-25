import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

const formSchema = z.object({
  type: z.enum(["goalball", "torball", "other"] as const),
  otherTypeDetails: z.string().optional().nullable(),
  date: z.date({
    required_error: "Une date est requise",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
}).refine((data) => {
  if (data.type === "other" && !data.otherTypeDetails) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser le type d'entraînement",
  path: ["otherTypeDetails"],
}).refine((data) => {
  const [startHour, startMinute] = data.startTime.split(":").map(Number);
  const [endHour, endMinute] = data.endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return endTotal > startTotal;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["endTime"],
});

type TrainingFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function TrainingForm({ onSuccess, onCancel }: TrainingFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "goalball",
      otherTypeDetails: "",
      startTime: "09:00",
      endTime: "10:30",
    },
  });

  const selectedType = form.watch("type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting training form with values:", values);
      const { error } = await supabase
        .from("trainings")
        .insert({
          type: values.type as TrainingType,
          other_type_details: values.type === "other" ? values.otherTypeDetails : null,
          date: format(values.date, "yyyy-MM-dd"),
          start_time: values.startTime,
          end_time: values.endTime,
        });

      if (error) throw error;

      console.log("Training created successfully");
      toast({
        title: "Entraînement créé",
        description: "L'entraînement a été ajouté avec succès.",
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating training:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'entraînement.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Créer un entraînement
        </h2>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#9b87f5] font-medium">Type d'entraînement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-gray-200">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="goalball">Goalball</SelectItem>
                      <SelectItem value="torball">Torball</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "other" && (
              <FormField
                control={form.control}
                name="otherTypeDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#9b87f5] font-medium">Précisez le type d'entraînement</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Type d'entraînement" 
                        {...field} 
                        className="bg-white/10 border-white/20 text-gray-200 placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[#9b87f5] font-medium">Date de l'entraînement</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-white/10 border-white/20 text-gray-200",
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
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#9b87f5] font-medium">Heure de début</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="bg-white/10 border-white/20 text-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#9b87f5] font-medium">Heure de fin</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="bg-white/10 border-white/20 text-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white mt-8"
            >
              Créer l'entraînement
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}