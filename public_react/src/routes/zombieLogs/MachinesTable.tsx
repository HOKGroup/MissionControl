import DataTable, { TableColumn } from "react-data-table-component";

import { ZombieLog } from "../../api/schema/zombieLogs";

const parseLocation = (machine: string) => {
  if (!machine) {
    return "N/A";
  }

  const parts = machine.split("-");
  return parts[0];
};

const parseMachine = (users: Record<string, string>, machine: string) => {
  if (!machine) {
    return "N/A";
  }

  if (Object.prototype.hasOwnProperty.call(users, machine)) {
    return users[machine];
  } else {
    return "Unknown";
  }
};

const parseUsername = (users: Record<string, string>, machine: string) => {
  if (!machine) {
    return "N/A";
  }

  if (Object.prototype.hasOwnProperty.call(users, machine)) {
    return users[machine];
  } else {
    return "Unknown";
  }
};

interface MachinesTableProps {
  selectedMachines: ZombieLog[];
  users: Record<string, string>;
}

const MachinesTable: React.FC<MachinesTableProps> = ({
  users,
  selectedMachines,
}) => {
  const columns: TableColumn<ZombieLog>[] = [
    {
      name: "Location",
      selector: (row) => parseLocation(row.machine),
      sortable: true,
    },
    {
      name: "Machine",
      selector: (row) => parseMachine(users, row.machine),
      sortable: true,
    },
    {
      name: "User",
      selector: (row) => parseUsername(users, row.machine),
      sortable: true,
    },
    {
      name: "Message",
      selector: (row) => row.message,
      sortable: true,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={selectedMachines}
      pagination
      conditionalRowStyles={[
        {
          when: (row) => row.level === "Info",
          classNames: ["table-info"],
        },
        {
          when: (row) => row.level === "Error",
          classNames: ["bg-warning"],
        },
        {
          when: (row) => row.level === "Fatal",
          classNames: ["bg-danger"],
        },
        {
          when: (row) =>
            row.level !== "Info" &&
            row.level !== "Error" &&
            row.level !== "Fatal",
          classNames: ["table-info"],
        },
      ]}
    />
  );
};

export default MachinesTable;
