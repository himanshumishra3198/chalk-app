import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().max(60),
  password: z.string(),
  name: z.string(),
});

export const SigninUserSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const CreateRoomSchema = z.object({
  slug: z.string(),
});

export const JWT_SECRET = process.env.JWT_SECRET || "1234";
