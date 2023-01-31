import { makeApi } from "@zodios/core";
import { zombieLog, zombieLogs } from "api/schema/zombieLogs";
import { z } from "zod";

const zombieLogsApi = makeApi([
  {
    method: "get",
    path: "/zombielogs",
    alias: "getZombieLogs",
    description: "Get all zombie logs",
    response: zombieLogs,
    status: 200,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() }
    ]
  },
  {
    method: "post",
    path: "/zombielogs",
    alias: "addZombieLog",
    description: "Create a zombie log",
    response: zombieLog,
    status: 201,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() }
    ]
  },
  {
    method: "post",
    path: "/zombielogs/filter",
    alias: "getFilteredZombieLogs",
    description: "Get filtered zombie logs",
    immutable: true,
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          filter: z.object({
            from: z.coerce.date(),
            to: z.coerce.date(),
            office: z.object({
              name: z.string(),
              code: z.array(z.string())
            })
          })
        })
      }
    ],
    response: zombieLogs,
    status: 201,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() }
    ]
  }
]);

export default zombieLogsApi;
