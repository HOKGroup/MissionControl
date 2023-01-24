import { makeApi } from "@zodios/core";
import { z } from "zod";

import { settings } from "../schema/settings";

const settingsApi = makeApi([
  {
    method: "get",
    path: "/api/v2/settings",
    alias: "getSettings",
    response: settings,
    status: 200,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() },
    ],
  },
]);

export default settingsApi;
