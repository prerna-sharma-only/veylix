import { z } from "zod";
//zod is the library we installed.
// z is the commonly used name for its schema-building API.
// We use it to define rules such as z.string(), z.number() and z.object().


//define schema
export const createServiceSchema = z.object({
  name: z.string().trim().min(1).max(100),

  url: z.string()
  .trim()
  .pipe(z.url())
  .refine(
    (value) =>
      value.startsWith("http://") ||
      value.startsWith("https://"),
    "URL must use HTTP or HTTPS"
  ),

  intervalSeconds: z.number().int().min(30).max(86400),
});

//Zod Schema = Data ke rules
//z.infer = Un rules se TypeScript type banana

export type CreateServiceInput = z.infer<
  typeof createServiceSchema
>;

// Zod method	Meaning
// z.object()	Incoming value must be an object
// z.string()	Value must be a string
// .trim()	Removes whitespace at the beginning and end
// .min(1)	Requires at least one character
// .max(100)	Maximum 100 characters
// .url()	Checks URL syntax
// .refine()	Applies an additional custom rule
// z.number()	Value must be a number
// .int()	Number must be an integer
// .min(30)	Minimum monitoring interval: 30 seconds
// .max(86400)	Maximum monitoring interval: 24 hours