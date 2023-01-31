import { ColumnDef, Row } from "@tanstack/react-table";

import { ZombieLog } from "../../api/schema/zombieLogs";
import Datatable from "../../components/Datatable";
import { parseLocation, parseMachine, parseUsername } from "./util";

interface MachinesTableProps {
  selectedMachines: ZombieLog[];
  machineUsers: Record<string, string>;
}

const MachinesTable: React.FC<MachinesTableProps> = ({
  machineUsers,
  selectedMachines
}) => {
  const columns: ColumnDef<ZombieLog>[] = [
    {
      header: "Location",
      accessorFn: parseLocation,
      meta: {
        className: "text-center"
      }
    },
    {
      header: "Machine",
      accessorFn: parseMachine,
      meta: {
        className: "text-center"
      }
    },
    {
      header: "User",
      accessorFn: (row) => parseUsername(machineUsers, row),
      meta: {
        className: "text-center"
      }
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
      getRowClassName={(row: Row<ZombieLog>) => {
        switch (row.original.level) {
          case "Info":
            return "";
          case "Error":
            return "bg-warning";
          case "Fatal":
            return "bg-danger";
          default:
            return "";
        }
      }}
    />
  );
};

export default MachinesTable;
