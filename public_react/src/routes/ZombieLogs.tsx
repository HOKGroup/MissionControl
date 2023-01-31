import { apiHooks } from "api/api";
import { User } from "api/schema/users";
import { ZombieLog } from "api/schema/zombieLogs";
import Page from "components/Page";
import { useCallback } from "react";
import { useState } from "react";
import { toast } from "react-toastify";

import Logs from "./zombieLogs/Logs";
import OfficeFilter from "./zombieLogs/OfficeFilter";
import Selected from "./zombieLogs/Selected";
import { getVersion } from "./zombieLogs/util";

type MachineUser = Record<string, string>;

export interface DonutData {
  name: string;
  count: number;
}

const sortZombieLogs = (zombieLogs: ZombieLog[]) => {
  return zombieLogs.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
};

const onZombieLogsError = () =>
  toast.error("Unable to retrieve the Zombie Logs.");
const onUsersError = () => toast.error("Could not retrieve user info.");
const onSettingsError = () => toast.error("Unable to retrieve the Settings.");

const ZombieLogs: React.FC = () => {
  const initialSelectedOffice = {
    name: "All",
    code: "All"
  };

  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());

  const [selectedOffice, setSelectedOffice] = useState(initialSelectedOffice);

  const [donutData, setDonutData] = useState([] as DonutData[]);

  const [selectedMachines, setSelectedMachines] = useState(
    null as ZombieLog[] | null
  );

  const onZombieLogsData = useCallback((zombieLogs: ZombieLog[]) => {
    const fatal: ZombieLog[] = [];

    const machineLogs = new Map<string, ZombieLog>();
    const chartCounts = new Map<string, number>();

    zombieLogs.reduce((map, log) => {
      const existing = map.get(log.machine);
      if (existing) {
        if (log.level === "info" && existing.level !== "Info") {
          map.set(log.machine, log);
        }
      } else {
        map.set(log.machine, log);
      }

      return map;
    }, machineLogs);

    machineLogs.forEach((log, _machine) => {
      const version = getVersion(log.message);
      if (version === "Fatal") {
        fatal.push(log);
      }

      const existingCount = chartCounts.get(version);
      if (existingCount) {
        chartCounts.set(version, existingCount + 1);
      } else {
        chartCounts.set(version, 1);
      }
    });

    const chartData: DonutData[] = [];

    chartCounts.forEach((count, version) => {
      chartData.push({
        name: version,
        count
      });
    });

    chartData.sort((a, b) => b.count - a.count);

    setDonutData(chartData);
    //setSelectedMachines(fatal);
  }, []);

  const {
    data: zombieLogsData,
    isLoading: zombieLogsIsLoading,
    error: _zombieLogsError
  } = apiHooks.useGetZombieLogs(undefined, {
    select: sortZombieLogs,
    onError: onZombieLogsError,
    onSuccess: onZombieLogsData
  });

  const filter = {
    from: dateFrom,
    to: dateTo,
    office: {
      name: selectedOffice.name,
      code: [selectedOffice.code]
    }
  };

  const {
    data: filteredZombieLogsData,
    isRefetching: filteredZombieLogsIsLoading,
    error: _filteredZombieLogsError,
    refetch: refetchFilteredZombieLogsData
  } = apiHooks.useGetFilteredZombieLogs(
    {
      filter
    },
    undefined,
    {
      enabled: false,
      select: sortZombieLogs,
      onSuccess: onZombieLogsData,
      onError: onZombieLogsError
    }
  );

  const selectMachineUsers = useCallback((users: User[]) => {
    return users.reduce(
      (obj, user) => ({
        ...obj,
        [user.machine]: user.user
      }),
      {} as MachineUser
    );
  }, []);

  const {
    data: machineUsers,
    isLoading: usersIsLoading,
    error: _usersError
  } = apiHooks.useGetAllUsers(undefined, {
    onError: onUsersError,
    select: selectMachineUsers
  });

  const {
    data: settingsData,
    isLoading: settingsIsLoading,
    error: _settingsError
  } = apiHooks.useGetSettings(undefined, {
    onError: onSettingsError
  });

  const handleChartClick = useCallback(
    (item: { name: string; code: string }) => {
      if (!zombieLogsData) return;

      const temp: Record<string, ZombieLog> = {};
      zombieLogsData.forEach((log) => {
        if (Object.prototype.hasOwnProperty.call(temp, log.machine)) {
          const existing = temp[log.machine];

          if (log.level === "Info" && existing.level !== "Info") {
            temp[log.machine] = log;
          }
        } else {
          temp[log.machine] = log;
        }
      });

      const result: ZombieLog[] = [];

      Object.keys(temp).forEach((key) => {
        const version = getVersion(temp[key].message);
        if (item.name === "Fatal") {
          if (version === "Fatal") {
            result.push(temp[key]);
          }
        } else {
          if (version === item.name) {
            result.push(temp[key]);
          }
        }

        setSelectedMachines(result);
      });
    },
    [zombieLogsData]
  );

  const zombieLogs = filteredZombieLogsData || zombieLogsData;

  return (
    <Page title="Zombie Logs">
      <Logs
        dateFrom={dateFrom}
        dateTo={dateTo}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        officesIsLoading={settingsIsLoading}
        offices={settingsData?.offices}
        selectedOffice={selectedOffice}
        setSelectedOffice={setSelectedOffice}
        fetchFilteredZombieLogs={refetchFilteredZombieLogsData}
        isLoadingFilteredZombieLogs={filteredZombieLogsIsLoading}
        zombieLogs={zombieLogs}
        isLoadingZombieLogs={zombieLogsIsLoading}
        machineUsers={machineUsers}
      />
      <OfficeFilter
        officeName={selectedOffice.name}
        donutData={donutData}
        handleChartClick={handleChartClick}
      />
      <Selected
        isLoading={zombieLogsIsLoading || usersIsLoading}
        selectedMachines={selectedMachines}
        machineUsers={machineUsers}
      />
    </Page>
  );
};

export default ZombieLogs;
