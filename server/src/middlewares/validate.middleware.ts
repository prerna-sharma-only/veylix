import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    // .parse(data)	-> Returns validated data or throws an error
    // .safeParse(data)	-> Returns a success/error result without throwing for validation failures

    if (!result.success) {
      res.status(400).json({   //HTTP 400 means the client sent invalid input.
        success: false,
        message: "Validation failed",
        //Retrieves validation errors->
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data; //Replaces input with validated/transformed data
    next();
  };
};

//NOTES
// ZodType: Represents a Zod schema. This lets our middleware accept different schemas, not just the service schema.
// RequestHandler: Express's TypeScript type for middleware.
// validate(schema): A function that receives a schema and returns Express middleware.
// safeParse(req.body): Validates incoming request data.
// issue.path: Identifies the field that failed validation.
// issue.message: Explains why validation failed.
// req.body = result.data: Replaces the original request body with validated data, including transformations such as trimming.
// next(): Continues to the next middleware or controller.