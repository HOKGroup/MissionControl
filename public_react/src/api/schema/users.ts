import { z } from "zod";

export const user = z.object({
  _id: z.string(),
  user: z.string(),
  __v: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  machine: z.string(),
});

export type User = z.infer<typeof user>;

export const users = z.array(user);

export type Users = User[];
