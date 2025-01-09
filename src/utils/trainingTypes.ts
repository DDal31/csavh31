export const VALID_TRAINING_TYPES = ["goalball", "torball", "other", "showdown"] as const;
export type TrainingType = typeof VALID_TRAINING_TYPES[number];

export function isValidTrainingType(type: string): type is TrainingType {
  return VALID_TRAINING_TYPES.includes(type.toLowerCase() as TrainingType);
}