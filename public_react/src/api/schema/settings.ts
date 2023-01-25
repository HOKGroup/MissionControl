import { z } from "zod";

import { offices } from "./shared";

export const projectSubInfoDetails = z.object({
  pattern: z.string(),
  match: z.number().int(),
  group: z.number().int()
});

export const projectSubInfo = z.object({
  local: projectSubInfoDetails,
  revitServer: projectSubInfoDetails,
  bimThreeSixty: projectSubInfoDetails
});

export const projectInfo = z.object({
  source: z.string(),
  projectName: projectSubInfo
});

export const tempLocation = z.object({
  source: z.string(),
  pattern: z.string(),
  tempPath: z.string()
});

export const userLocation = z.object({
  source: z.string(),
  pattern: z.string(),
  match: z.number().int(),
  group: z.number().int()
});

export const settings = z.object({
  _id: z.string(),
  name: z.string(),
  __v: z.number(),
  localPathRgx: z.array(z.string()),
  offices: offices,
  projectInfo: projectInfo,
  states: z.array(z.string()),
  tempLocation: tempLocation,
  userLocation: userLocation
});

export type Settings = z.infer<typeof settings>;
