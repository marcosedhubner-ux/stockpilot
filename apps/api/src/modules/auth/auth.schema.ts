import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerStaffSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["ADMIN", "STAFF"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterStaffInput = z.infer<typeof registerStaffSchema>;
