import { makeApi } from "@zodios/core";
import { addinManagerDetails, addins } from "api/schema/addins";
import { z } from "zod";

const addinsApi = makeApi([
  {
    method: "get",
    path: "/addins/:year",
    alias: "getAddinsByYear",
    response: addins,
    parameters: [
      {
        type: "Query",
        name: "name",
        schema: z.optional(z.string())
      },
      {
        type: "Query",
        name: "office",
        schema: z.optional(z.string())
      }
    ]
  },
  {
    method: "get",
    path: "/addins/:year/addinmanager",
    alias: "getAddinManagerDetails",
    response: addinManagerDetails,
    parameters: [
      {
        type: "Query",
        name: "office",
        schema: z.optional(z.string())
      }
    ]
  }
]);

export default addinsApi;
