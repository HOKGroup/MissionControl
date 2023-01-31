import { apiHooks } from "api/api";
import { Addin } from "api/schema/addins";
import { settings } from "api/schema/settings";
import { offices } from "api/schema/shared";
import Page from "components/Page";
import { useCallback, useState } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from "react-bootstrap/Card";
import CardHeader from "react-bootstrap/CardHeader";
import ToggleButton from "react-bootstrap/ToggleButton";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

import AddinManager from "./addins/AddinManager";
import Users from "./addins/Users";

interface YearButtonProps {
  year: string;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}
const YearButton: React.FC<YearButtonProps> = ({
  setSelectedYear,
  selectedYear,
  year
}) => {
  const onClick = useCallback(
    () => setSelectedYear(year),
    [year, setSelectedYear]
  );
  return (
    <ToggleButton
      type="radio"
      value={year}
      onClick={onClick}
      checked={year === selectedYear}
      variant="outline-primary"
    >
      {year}
    </ToggleButton>
  );
};

interface Office {
  name: string;
  code: string;
}

const Addins: React.FC = () => {
  const {
    data: settingsData,
    isLoading: _settingsDataIsLoading,
    error: _settingsError
  } = apiHooks.useGetSettings(undefined, {
    select: (settings) => ({
      ...settings,
      offices: settings.offices.map((office) => ({
        ...office,
        code: office.code[0]
      }))
    })
  });

  const [selectedYear, setSelectedYear] = useState("2020");
  const [selectedAddin, setSelectedAddin] = useState(
    undefined as Addin | undefined
  );
  const [selectedOffice, setSelectedOffice] = useState(
    undefined as Office | undefined
  );

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
        year: selectedYear
      }
    },
    {
      select: selectAddinsData,
      keepPreviousData: true
    }
  );

  const revitVersions = ["2017", "2018", "2019", "2020", "2021", "2022"];

  const chartAddinsData = addinsData || [];

  const handleClickBar = useCallback((addin: Addin) => {
    setSelectedAddin(addin);
  }, []);

  return (
    <Page title="Addins">
      <Card className="mb-4">
        <CardHeader>
          <Card.Title>
            Plugin Use Frequency:
            <ButtonGroup className="float-end">
              {revitVersions.map((v) => (
                <YearButton
                  key={v}
                  year={v}
                  setSelectedYear={setSelectedYear}
                  selectedYear={selectedYear}
                />
              ))}
            </ButtonGroup>
          </Card.Title>
        </CardHeader>
        <Card.Body>
          <ResponsiveContainer
            width="100%"
            height={chartAddinsData.length * 20}
          >
            <BarChart
              data={chartAddinsData}
              layout="vertical"
              barCategoryGap={0}
            >
              <XAxis type="number" dataKey="count" />
              <YAxis
                width={250}
                interval={0}
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
              />
              <Bar dataKey="count" fill="steelblue" onClick={handleClickBar}>
                <LabelList dataKey="count" position="right" fill="black" />
                {chartAddinsData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.name === selectedAddin?.name ? "red" : "steelblue"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
      {selectedAddin && settingsData && (
        <Users
          offices={settingsData.offices}
          selectedOffice={selectedOffice}
          setSelectedOffice={setSelectedOffice}
          addinName={selectedAddin.name}
          year={selectedYear}
        />
      )}
      {selectedAddin?.name === "AddinManager" && (
        <AddinManager year={selectedYear} officeCode={selectedOffice?.code} />
      )}
    </Page>
  );
};

export default Addins;
