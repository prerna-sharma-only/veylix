import { z } from "zod";

//resgiter schema___________
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please provide a valid email address")),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password cannot exceed 72 UTF-8 bytes",
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

//1. .toLowerCase()
// Converts the email into lowercase before it reaches the controller.

// 2. .pipe(z.email())
// First performs string transformations, then validates the resulting value as an email.

// 3. .refine()
// Allows us to define a custom validation condition. Here, we're checking the password's UTF-8 byte length because bcrypt has a 72-byte input limit.

// 4. z.infer<typeof registerSchema>
// Automatically derives a TypeScript type from our validation schema. This avoids manually maintaining the same field definitions twice.

//login schema__________________
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please provide a valid email address")),

  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;