import { apiHooks } from "api/api";
import { Addin } from "api/schema/addins";
import { useCallback } from "react";
import Card from "react-bootstrap/Card";
import DropdownButton from "react-bootstrap/DropdownButton";
import DropdownItem from "react-bootstrap/DropdownItem";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

interface Office {
  name: string;
  code: string;
}

interface UsersProps {
  addinName: string;
  year: string;
  offices: Office[];
  selectedOffice: Office | undefined;
  setSelectedOffice: (office: Office) => void;
}

const Users: React.FC<UsersProps> = ({
  addinName,
  year,
  selectedOffice,
  setSelectedOffice: _setSelectedOffice,
  offices
}) => {
  const selectAddinsData = useCallback((addins: Addin[]) => {
    return addins.sort((a, b) => b.count - a.count);
  }, []);
  const {
    data: addinsData,
    isLoading: _addinsDataIsLoading,
    error: _addinsError
  } = apiHooks.useGetAddinsByYear(
    {
      params: {
        year: year,
        name: addinName
      }
    },
    {
      select: selectAddinsData
    }
  );

  return (
    <Card className="mb-4">
      <Card.Header>
        <Card.Title className="d-flex align-items-center justify-content-between">
          Users: {addinName}
          <DropdownButton title={selectedOffice?.name || "All"} size="sm">
            {offices &&
              offices.map((office) => {
                return (
                  <DropdownItem
                    key={office.code}
                    eventKey={`${office.name}:${office.code}`}
                  >
                    {office.name}
                  </DropdownItem>
                );
              })}
          </DropdownButton>
        </Card.Title>
      </Card.Header>

      <Card.Body>
        {addinsData && (
          <ResponsiveContainer width="100%" height={addinsData.length * 20}>
            <BarChart data={addinsData} layout="vertical" barCategoryGap={0}>
              <XAxis type="number" dataKey="count" />
              <YAxis
                width={250}
                interval={0}
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
              />
              <Bar dataKey="count" fill="red">
                <LabelList dataKey="count" position="right" fill="black" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default Users;
