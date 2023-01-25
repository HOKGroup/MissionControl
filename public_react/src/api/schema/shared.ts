import { z } from "zod";

export const deleteResponse = z.object({
  acknowledged: z.boolean(),
  deletedCount: z.number()
});

export const office = z.object({
  code: z.array(z.string()),
  name: z.string()
});

export type Office = z.infer<typeof office>;

export const offices = z.array(office);

export type Offices = Office[];

export type DeleteResponse = z.infer<typeof deleteResponse>;
