import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";

import { apiHooks } from "../api/api";
import { Office } from "../api/schema/shared";
import { ZombieLog } from "../api/schema/zombieLogs";
import { useToastError } from "../effects";
import Logs from "./zombieLogs/Logs";
import OfficeFilter from "./zombieLogs/OfficeFilter";
import Selected from "./zombieLogs/Selected";
import Title from "./zombieLogs/Title";

interface VersionCompareOptions {
  lexicographical?: boolean;
  zeroExtend?: boolean;
}

function versionCompare(
  v1: string,
  v2: string,
  options?: VersionCompareOptions
) {
  const lexicographical = options && options.lexicographical;
  const zeroExtend = options && options.zeroExtend;

  let v1parts: string[] | number[] = v1.split(".");
  let v2parts: string[] | number[] = v2.split(".");

  function isValidPart(x: string) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      // continue
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length !== v2parts.length) {
    return -1;
  }

  return 0;
}

function getVersion(s: string): string {
  const myRegexp = /Version:\s?(.*?)$/g;
  const myRegexp1 = /version:\s?(.*?)$/g;
  const match = myRegexp.exec(s);
  const match1 = myRegexp1.exec(s);
  if (match !== null) {
    return match[1];
  }
  if (match1 !== null) {
    return match1[1];
  }
  return "Fatal";
}

export interface DonutData {
  name: string;
  count: number;
}

const ZombieLogs: React.FC = () => {
  const initialSelectedOffice: Office = {
    name: "All",
    code: "All",
  };

  const [selectedOffice, setSelectedOffice] = useState(initialSelectedOffice);

  const [latestVersion, setLatestVersion] = useState("0.0.0.0");

  const [donutData, setDonutData] = useState([] as DonutData[]);

  const [selectedMachines, setSelectedMachines] = useState([] as ZombieLog[]);

  const [users, setUsers] = useState({});

  const {
    data: zombieLogsData,
    isLoading: _zombieLogsIsLoading,
    error: zombieLogsError,
  } = apiHooks.useGetZombieLogs();

  const {
    data: usersData,
    isLoading: _usersIsLoading,
    error: usersError,
  } = apiHooks.useGetAllUsers();

  const {
    data: _settingsData,
    isLoading: _settingsIsLoading,
    error: settingsError,
  } = apiHooks.useGetSettings();

  useToastError(zombieLogsError);
  useToastError(usersError);
  useToastError(settingsError);

  useEffect(() => {
    if (zombieLogsData) {
      const temp: Record<string, ZombieLog> = {};
      const donuts: Record<string, number> = {};
      const fatal: ZombieLog[] = [];

      const logs = zombieLogsData.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      logs.forEach((log) => {
        if (Object.prototype.hasOwnProperty.call(temp, log.machine)) {
          const existing = temp[log.machine];
          if (log.level === "Info" && existing.level !== "Info") {
            temp[log.machine] = log;
          }
        } else {
          temp[log.machine] = log;
        }
      });

      Object.keys(temp).forEach((key) => {
        const version = getVersion(temp[key].message);
        if (version === "Fatal") {
          fatal.push(temp[key]);
        }
        if (Object.prototype.hasOwnProperty.call(donuts, version)) {
          donuts[version] = donuts[version] + 1;
        } else {
          donuts[version] = 1;
        }
      });

      const donutData = Object.keys(donuts).map((key) => {
        if (versionCompare(key, latestVersion) === 1) {
          setLatestVersion(key);
        }

        return {
          name: key,
          count: donuts[key],
        };
      });

      setDonutData(donutData);
      setSelectedMachines(fatal);
    }
  }, [zombieLogsData, latestVersion]);

  useEffect(() => {
    if (usersData) {
      const users = usersData.reduce((obj, item) => {
        obj[item.machine] = item.user;
        return obj;
      }, {} as Record<string, string>);

      setUsers(users);
    }
  }, [usersData]);

  return (
    <Container fluid>
      <Title />
      <Logs
        selectedOffice={selectedOffice}
        setSelectedOffice={setSelectedOffice}
      />
      <OfficeFilter selectedOffice={selectedOffice} donutData={donutData} />
      <Selected selectedMachines={selectedMachines} users={users} />
    </Container>
  );
};

export default ZombieLogs;
