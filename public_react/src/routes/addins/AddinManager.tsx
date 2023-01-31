import { apiHooks } from "api/api";
import { AddinManagerDetail } from "api/schema/addins";
import { useCallback } from "react";
import Card from "react-bootstrap/Card";
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

interface AddinManagerDetailsProps {
  year: string;
  officeCode?: string | undefined;
}

const AddinManager: React.FC<AddinManagerDetailsProps> = ({
  year,
  officeCode
}) => {
  const selectAddinManagerDetails = useCallback(
    (addinManagerDetails: AddinManagerDetail[]) => {
      return addinManagerDetails.sort(
        (a, b) =>
          b.never +
          b.always +
          b.thisSessionOnly -
          a.never -
          a.always -
          a.thisSessionOnly
      );
    },
    []
  );

  const {
    data: addinManagerDetails,
    isLoading: _addinManagerDetailsIsLoading,
    error: _addinManagerDetailsError
  } = apiHooks.useGetAddinManagerDetails(
    {
      params: { year, office: officeCode }
    },
    {
      keepPreviousData: true,
      select: selectAddinManagerDetails
    }
  );

  return (
    <Card>
      <Card.Header>
        <Card.Title>Addin Manager: Usage Details - {year}</Card.Title>
      </Card.Header>
      <Card.Body>
        {addinManagerDetails && (
          <ResponsiveContainer
            width="100%"
            height={addinManagerDetails.length * 20}
          >
            <BarChart data={addinManagerDetails} layout="vertical">
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={250}
                interval={0}
                tickLine={false}
                axisLine={false}
              />
              <Legend verticalAlign="top" />
              <Bar dataKey="thisSessionOnly" stackId="a" fill="orange">
                <LabelList
                  dataKey="thisSessionOnly"
                  position="inside"
                  fill="black"
                />
              </Bar>
              <Bar dataKey="always" stackId="a" fill="green">
                <LabelList dataKey="always" position="inside" fill="black" />
              </Bar>
              <Bar dataKey="never" stackId="a" fill="red">
                <LabelList dataKey="never" position="inside" fill="black" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default AddinManager;
