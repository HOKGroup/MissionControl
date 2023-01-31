import { z } from "zod";

export const addin = z.object({
  name: z.string(),
  office: z.string(),
  count: z.number().int()
});

export type Addin = z.infer<typeof addin>;

export const addins = z.array(addin);

export const addinmanagerDetail = z.object({
  name: z.string(),
  never: z.number().int(),
  always: z.number().int(),
  thisSessionOnly: z.number().int()
});

export type AddinManagerDetail = z.infer<typeof addinmanagerDetail>;

export const addinManagerDetails = z.array(addinmanagerDetail);

export type Addins = Addin[];
