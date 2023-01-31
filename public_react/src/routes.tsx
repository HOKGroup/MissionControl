import AddProject from "routes/AddProject";
import Addins from "routes/Addins";
import EditProject from "routes/EditProject";
import Home from "routes/Home";
import Project from "routes/Project";
import ProjectHealthReport from "routes/ProjectHealthReport";
import Projects from "routes/Projects";
import ZombieLogs from "routes/ZombieLogs";

import Layout from "./Layout";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/settings",
        element: <div>SETTINGS</div>
      },
      {
        path: "/projects",
        element: <Projects />
      },
      {
        path: "/projects/edit/:id",
        element: <EditProject />
      },
      {
        path: "/projects/add",
        element: <AddProject />
      },
      {
        path: "/projects/:id",
        element: <Project />
      },
      {
        path: "/file-paths",
        element: <div>FILE PATHS</div>
      },
      {
        path: "/addins",
        element: <Addins />
      },
      {
        path: "/zombie-logs",
        element: <ZombieLogs />
      },
      {
        path: "/projects/healthreport/:id",
        element: <ProjectHealthReport />
      }
    ]
  }
];

export default routes;
