import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().min(3).max(60),
  password: z.string().min(3),
  name: z.string(),
});

export const SigninUserSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(3),
});

export const CreateRoomSchema = z.object({
  slug: z.string().min(3),
});

export const JWT_SECRET = process.env.JWT_SECRET || "1234";
