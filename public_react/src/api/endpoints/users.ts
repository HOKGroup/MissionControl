import { makeApi } from "@zodios/core";
import { z } from "zod";

import { user, users } from "../schema/users";

const usersApi = makeApi([
  {
    method: "get",
    path: "/api/v2/users",
    alias: "getAllUsers",
    response: users,
    status: 200,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() },
    ],
  },
  {
    method: "put",
    path: "/api/v2/users/:id",
    alias: "addUser",
    response: user,
    status: 201,
    errors: [
      { status: 404, schema: z.any() },
      { status: 500, schema: z.any() },
    ],
  },
]);

export default usersApi;
