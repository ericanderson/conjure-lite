import { z } from "zod";

/**
 * The safety of the type with regard to logging in accordance with the SLS specification.
 * Allowed values are 'safe', 'unsafe', and 'do-not-log'.
 * Only conjure primitives and wrappers around conjure primitives may declare safety,
 * the safety of complex types is computed based on the type graph.
 * The exception is that 'bearertoken' is always considered 'do-not-log' and safety cannot be overridden.
 */
export const LogSafetySchema = z.enum(["safe", "unsafe", "do-not-log"]);

export type LogSafety = z.infer<typeof LogSafetySchema>;
