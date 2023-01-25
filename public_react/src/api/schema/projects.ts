import { z } from "zod";

export const address = z.object({
  street1: z.optional(z.string()),
  street2: z.optional(z.string()),
  city: z.optional(z.string()),
  state: z.optional(z.string()),
  zipCode: z.optional(z.string()),
  country: z.optional(z.string())
});

export type Address = z.infer<typeof address>;

export const project = z.object({
  _id: z.string(),
  name: z.string(),
  number: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  office: z.string(),
  viewStats: z.array(z.string()),
  worksetStats: z.array(z.string()),
  familyStats: z.array(z.string()),
  linkStats: z.array(z.string()),
  modelStats: z.array(z.string()),
  sheets: z.array(z.string()),
  triggerRecords: z.array(z.string()),
  configurations: z.array(z.string()),
  __v: z.number(),
  styleStats: z.array(z.string()),
  groupStats: z.array(z.string()),
  address: z.optional(address)
});

export type Project = z.infer<typeof project>;

export const projects = z.array(project);

export type Projects = Project[];
