import { z } from "zod/v4";

/**
 * A field describing the error category. MUST be one of the following strings,
 * with HTTP status codes defined in the wire spec.
 */
export const ErrorCodeSchema = z.enum([
  "PERMISSION_DENIED",
  "INVALID_ARGUMENT",
  "NOT_FOUND",
  "CONFLICT",
  "REQUEST_ENTITY_TOO_LARGE",
  "FAILED_PRECONDITION",
  "INTERNAL",
  "TIMEOUT",
  "CUSTOM_CLIENT",
  "CUSTOM_SERVER",
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
