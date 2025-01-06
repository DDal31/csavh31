import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";

interface NotificationFieldsProps {
  form: UseFormReturn<any>;
}

export function NotificationFields({ form }: NotificationFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Notifications automatiques</h3>
      
      <FormField
        control={form.control}
        name="notificationWeekBefore"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">
              Message une semaine avant (si 6+ joueurs)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Rappel : entraînement prévu dans une semaine"
                className="bg-gray-700 border-gray-600 text-white resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notificationMissingPlayers"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">
              Message si moins de 6 joueurs une semaine avant
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Il manque des joueurs pour l'entraînement, pensez à vous inscrire !"
                className="bg-gray-700 border-gray-600 text-white resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notificationDayBefore"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">
              Message la veille de l'entraînement
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Rappel : entraînement prévu demain"
                className="bg-gray-700 border-gray-600 text-white resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}