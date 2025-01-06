import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./trainingFormSchema";

interface NotificationFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function NotificationFields({ form }: NotificationFieldsProps) {
  return (
    <div className="space-y-4" role="group" aria-label="Personnalisation des notifications">
      <h3 className="text-lg font-semibold text-white mb-4">Personnalisation des notifications</h3>
      
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
                placeholder="Rappel : entraînement de {sport} prévu dans une semaine"
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
                aria-label="Message de notification une semaine avant l'entraînement"
              />
            </FormControl>
            <FormDescription className="text-gray-400">
              Laissez vide pour utiliser le message par défaut
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notificationMissingPlayers"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">
              Message si manque de joueurs
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Il manque des joueurs pour l'entraînement de {sport}. Pensez à vous inscrire !"
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
                aria-label="Message de notification en cas de manque de joueurs"
              />
            </FormControl>
            <FormDescription className="text-gray-400">
              Envoyé une semaine avant si moins de 6 joueurs
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notificationDayBefore"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">
              Message la veille
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Rappel : entraînement de {sport} demain"
                className="bg-gray-800 border-gray-700 text-white resize-none"
                {...field}
                aria-label="Message de notification la veille de l'entraînement"
              />
            </FormControl>
            <FormDescription className="text-gray-400">
              Envoyé un jour avant, quel que soit le nombre de joueurs
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}