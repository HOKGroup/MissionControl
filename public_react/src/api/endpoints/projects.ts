import { makeApi } from "@zodios/core";
import { z } from "zod";

import { project, projects } from "../schema/projects";
import { deleteResponse } from "../schema/shared";

const projectsApi = makeApi([
  {
    method: "get",
    path: "/api/v2/projects/sort",
    alias: "getProjects",
    response: projects,
    status: 200,
    errors: [
      {
        status: 404,
        schema: z.any(),
      },
      {
        status: 500,
        schema: z.any(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v2/projects/:id",
    alias: "getProjectById",
    response: project,
    status: 200,
    errors: [
      {
        status: 404,
        schema: z.any(),
      },
      {
        status: 500,
        schema: z.any(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/v2/projects",
    alias: "addProject",
    response: project,
    status: 201,
    errors: [
      {
        status: 404,
        schema: z.any(),
      },
      {
        status: 500,
        schema: z.any(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v2/projects/:id",
    alias: "deleteProject",
    response: deleteResponse,
    status: 201,
    errors: [
      {
        status: 404,
        schema: z.any(),
      },
      {
        status: 500,
        schema: z.any(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/v2/projects/:id",
    alias: "updateProject",
    response: project,
    status: 202,
    errors: [
      {
        status: 404,
        schema: z.any(),
      },
      {
        status: 500,
        schema: z.any(),
      },
    ],
  },
]);

export default projectsApi;
