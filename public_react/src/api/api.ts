import { Zodios } from "@zodios/core";
import { ZodiosHooks } from "@zodios/react";

import addinsApi from "./endpoints/addins";
import projectsApi from "./endpoints/projects";
import settingsApi from "./endpoints/settings";
import usersApi from "./endpoints/users";
import zombieLogsApi from "./endpoints/zombieLogs";

const apiUrl = "/api/v2";

const apiClient = new Zodios(apiUrl, [
  ...projectsApi,
  ...zombieLogsApi,
  ...usersApi,
  ...settingsApi,
  ...addinsApi
]);

const apiHooks = new ZodiosHooks("api", apiClient);

export { apiClient, apiHooks };
