import { makeApi } from "@zodios/core";
import { settings } from "api/schema/settings";
import { z } from "zod";

const settingsApi = makeApi([
  {
    method: "get",
    path: "/settings",
    alias: "getSettings",
    response: settings,
    status: 200,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() }
    ]
  }
]);

export default settingsApi;
