import { makeApi } from "@zodios/core";
import { address, project, projects } from "api/schema/projects";
import { deleteResponse, office } from "api/schema/shared";
import { z } from "zod";

const projectsApi = makeApi([
  {
    method: "get",
    path: "/projects/sort",
    alias: "getProjects",
    response: projects,
    status: 200,
    errors: [
      {
        status: 404,
        schema: z.any()
      },
      {
        status: 500,
        schema: z.any()
      }
    ]
  },
  {
    method: "get",
    path: "/projects/:id",
    alias: "getProjectById",
    response: project,
    status: 200,
    errors: [
      {
        status: 404,
        schema: z.any()
      },
      {
        status: 500,
        schema: z.any()
      }
    ]
  },
  {
    method: "post",
    path: "/projects",
    alias: "addProject",
    response: project,
    status: 201,
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({
          name: z.string(),
          number: z.string(),
          office: z.string(),
          address: address.optional()
        })
      }
    ],
    errors: [
      {
        status: 404,
        schema: z.any()
      },
      {
        status: 500,
        schema: z.any()
      }
    ]
  },
  {
    method: "delete",
    path: "/projects/:id",
    alias: "deleteProject",
    response: deleteResponse,
    status: 201,
    errors: [
      {
        status: 404,
        schema: z.any()
      },
      {
        status: 500,
        schema: z.any()
      }
    ]
  },
  {
    method: "put",
    path: "/projects/:id",
    alias: "updateProject",
    response: project,
    status: 202,
    errors: [
      {
        status: 404,
        schema: z.any()
      },
      {
        status: 500,
        schema: z.any()
      }
    ]
  }
]);

export default projectsApi;
