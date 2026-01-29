import { z } from 'zod';

// Authentication validation schemas
export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(128, { message: 'Password must be less than 128 characters' }),
});

export type AuthFormData = z.infer<typeof authSchema>;

// Fishing log validation schema
export const fishingLogSchema = z.object({
  lake_id: z.string().uuid().optional().or(z.literal('')),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date' }),
  fish_caught: z
    .string()
    .max(200, { message: 'Fish caught must be less than 200 characters' })
    .optional()
    .or(z.literal('')),
  fly_used: z
    .string()
    .max(100, { message: 'Fly used must be less than 100 characters' })
    .optional()
    .or(z.literal('')),
  weather_conditions: z
    .string()
    .max(200, { message: 'Weather conditions must be less than 200 characters' })
    .optional()
    .or(z.literal('')),
  water_temperature: z
    .number()
    .min(-10, { message: 'Temperature seems too low' })
    .max(120, { message: 'Temperature seems too high' })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, { message: 'Notes must be less than 1000 characters' })
    .optional()
    .or(z.literal('')),
  success_rating: z
    .number()
    .int()
    .min(1, { message: 'Rating must be between 1 and 5' })
    .max(5, { message: 'Rating must be between 1 and 5' })
    .optional()
    .nullable(),
});

export type FishingLogFormData = z.infer<typeof fishingLogSchema>;

// Helper to validate and transform fishing log data
export function validateFishingLogData(data: {
  lake_id: string;
  date: string;
  fish_caught: string;
  fly_used: string;
  weather_conditions: string;
  water_temperature: string;
  notes: string;
  success_rating: number;
}) {
  return fishingLogSchema.safeParse({
    lake_id: data.lake_id || undefined,
    date: data.date,
    fish_caught: data.fish_caught || undefined,
    fly_used: data.fly_used || undefined,
    weather_conditions: data.weather_conditions || undefined,
    water_temperature: data.water_temperature ? parseFloat(data.water_temperature) : undefined,
    notes: data.notes || undefined,
    success_rating: data.success_rating || undefined,
  });
}
