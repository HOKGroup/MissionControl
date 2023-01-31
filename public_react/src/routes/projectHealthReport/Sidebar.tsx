import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import ListGroup from "react-bootstrap/ListGroup";

import { HealthReportPage } from "../ProjectHealthReport";
import { BadgeColor } from "./Badge";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  activePage: HealthReportPage;
  setPage: (page: HealthReportPage) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage }) => {
  return (
    <ListGroup>
      <Dropdown>
        <Dropdown.Toggle
          className="border"
          variant="light"
          style={{ width: "100%" }}
        >
          DROPDOWN BUTTON
        </Dropdown.Toggle>
      </Dropdown>
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Groups}
        setPage={setPage}
        color={BadgeColor.Green}
        name="Groups"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Worksets}
        setPage={setPage}
        color={BadgeColor.Orange}
        name="Worksets"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Models}
        setPage={setPage}
        color={BadgeColor.Orange}
        name="Model"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Links}
        setPage={setPage}
        color={BadgeColor.Orange}
        name="Links"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Warnings}
        setPage={setPage}
        color={BadgeColor.Red}
        name="Warnings"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Styles}
        setPage={setPage}
        color={BadgeColor.Red}
        name="Styles"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
      <SidebarItem
        activePage={activePage}
        page={HealthReportPage.Views}
        setPage={setPage}
        color={BadgeColor.Red}
        name="Views"
        scoreData={{ passingChecks: 2, newMax: 8 }}
      />
    </ListGroup>
  );
};

export default Sidebar;
