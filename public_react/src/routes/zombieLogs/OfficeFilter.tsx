import CardHeaderWithLoadingBar from "components/CardHeaderWithLoadingBar";
import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

import type { DonutData } from "../ZombieLogs";

interface Office {
  name: string;
  code: string;
}

interface OfficeFilterProps {
  officeName: string;
  donutData: DonutData[];
  handleChartClick: (item: Office) => void;
  isLoading: boolean;
}

const OfficeFilter: React.FC<OfficeFilterProps> = ({
  officeName,
  donutData,
  handleChartClick,
  isLoading
}) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null as string | null);

  return (
    <Row>
      <CardGroup className="pb-4">
        <Card>
          <CardHeaderWithLoadingBar
            isLoading={isLoading}
            onClick={() => setCollapsed(!isCollapsed)}
          >
            <Card.Title>Office Filter: {officeName}</Card.Title>
          </CardHeaderWithLoadingBar>
          <Collapse in={!isCollapsed}>
            <Card.Body>
              {donutData.length > 0 && (
                <ResponsiveContainer
                  width="100%"
                  height={donutData.length * 60}
                >
                  <BarChart
                    width={500}
                    height={500}
                    layout="vertical"
                    data={donutData}
                    barSize={17}
                  >
                    <XAxis type="number" dataKey="count" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Bar
                      dataKey="count"
                      fill="steelblue"
                      animationDuration={1_000}
                      onClick={(data: Office) => {
                        if (selectedBar === data.name) {
                          setSelectedBar(null);
                        } else {
                          setSelectedBar(data.name);
                          handleChartClick(data);
                        }
                      }}
                    >
                      <LabelList
                        dataKey="count"
                        position="insideRight"
                        fill="black"
                        offset={20}
                      />
                      {donutData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.name === selectedBar ? "#d9534f" : "steelblue"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Collapse>
        </Card>
      </CardGroup>
    </Row>
  );
};

export default OfficeFilter;
