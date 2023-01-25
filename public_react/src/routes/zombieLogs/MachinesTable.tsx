import { ColumnDef, Row } from "@tanstack/react-table";

import Datatable from "../../Datatable";
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
  selectedMachines
}) => {
  const columns: ColumnDef<ZombieLog>[] = [
    {
      header: "Location",
      accessorFn: (row) => parseLocation(row.machine)
    },
    {
      header: "Machine",
      accessorFn: (row) => parseMachine(users, row.machine)
    },
    {
      header: "User",
      accessorFn: (row) => parseUsername(users, row.machine)
    },
    {
      header: "Message",
      accessorKey: "message"
    }
  ];

  return (
    <Datatable
      columns={columns}
      data={selectedMachines}
      getRowClassNames={(row: Row<ZombieLog>) => {
        switch (row.original.level) {
          case "Info":
            return "table-info";
          case "Error":
            return "bg-warning";
          case "Fatal":
            return "bg-danger";
          default:
            return "table-info";
        }
      }}
    />
  );
};

export default MachinesTable;
