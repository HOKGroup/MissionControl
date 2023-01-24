import { makeApi } from "@zodios/core";
import { z } from "zod";

import { office } from "../schema/shared";
import { zombieLog, zombieLogs } from "../schema/zombieLogs";

const zombieLogsApi = makeApi([
  {
    method: "get",
    path: "/api/v2/zombielogs",
    alias: "getZombieLogs",
    description: "Get all zombie logs",
    response: zombieLogs,
    status: 200,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() },
    ],
  },
  {
    method: "post",
    path: "/api/v2/zombielogs",
    alias: "addZombieLog",
    description: "Create a zombie log",
    response: zombieLog,
    status: 201,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() },
    ],
  },
  {
    method: "get",
    path: "/api/v2/zombielogs/filter",
    alias: "getFilteredZombieLogs",
    description: "Get filtered zombie logs",
    parameters: [
      {
        name: "filter",
        type: "Body",
        schema: z.object({
          from: z.string(),
          to: z.string(),
          office: office,
        }),
      },
    ],
    response: zombieLogs,
    status: 201,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() },
    ],
  },
]);

export default zombieLogsApi;
