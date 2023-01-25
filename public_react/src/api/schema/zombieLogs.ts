import { z } from "zod";

export const zombieLog = z.object({
  _id: z.string(),
  message: z.string(),
  createdAt: z.coerce.date(),
  version: z.string(),
  level: z.string(),
  machine: z.string(),
  exception: z.string(),
  source: z.string(),
  __v: z.number()
});

export type ZombieLog = z.infer<typeof zombieLog>;

export const zombieLogs = z.array(zombieLog);

export type ZombieLogs = ZombieLog[];
