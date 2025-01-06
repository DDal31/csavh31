import * as z from "zod";

export const formSchema = z.object({
  type: z.enum(["goalball", "torball", "other", "showdown"]),
  otherTypeDetails: z.string().optional(),
  date: z.date({
    required_error: "Une date est requise",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
  notificationWeekBefore: z.string().optional(),
  notificationMissingPlayers: z.string().optional(),
  notificationDayBefore: z.string().optional(),
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