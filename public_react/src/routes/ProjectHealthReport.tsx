import { useCallback, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Sidebar from "./projectHealthReport/Sidebar";
import Main from "./projectHealthReport/pages/Main";
import ModelStats from "./projectHealthReport/pages/ModelStats";

export enum HealthReportPage {
  Main = "main",
  Worksets = "worksets",
  Links = "links",
  Views = "views",
  Styles = "styles",
  Models = "models",
  Families = "families",
  Groups = "groups",
  Warnings = "warnings"
}

export const ProjectHealthReport: React.FC = () => {
  const [page, setPage] = useState(HealthReportPage.Main);

  const setPageCb = useCallback((newPage: HealthReportPage) => {
    setPage((currPage) => {
      if (currPage === newPage) return HealthReportPage.Main;
      return newPage;
    });
  }, []);

  return (
    <Container>
      <Row>Project Health Report PLACEHOLDER</Row>
      <Row>
        <Row>
          <Col xs={6} sm={3}>
            <Sidebar setPage={setPageCb} activePage={page} />
          </Col>
          {/*<Col xs={12} sm={9}>
            <h2>No data available.</h2>
            <h4 style={{ color: "grey" }}>
              Please select a different model. It is also possible that there
              was no activity in this model for more than a month. Only most
              recent data is displayed.
            </h4>
          </Col>*/}
          {page === HealthReportPage.Main && (
            <Col xs={12} sm={9}>
              <Main />
            </Col>
          )}
          {page === HealthReportPage.Worksets && (
            <Col xs={12} sm={9}>
              WORKSET STATS
            </Col>
          )}
          {page === HealthReportPage.Links && (
            <Col xs={12} sm={9}>
              LINK STATS
            </Col>
          )}
          {page === HealthReportPage.Views && (
            <Col xs={12} sm={9}>
              VIEW STATS
            </Col>
          )}
          {page === HealthReportPage.Styles && (
            <Col xs={12} sm={9}>
              STYLE STATS
            </Col>
          )}
          {page === HealthReportPage.Models && (
            <Col xs={12} sm={9}>
              <ModelStats
                modelSize="73.4MiB"
                avgOpenTime="19s"
                avgSynchTime="45s"
              />
            </Col>
          )}
          {page === HealthReportPage.Families && (
            <Col xs={12} sm={9}>
              FAMILY STATS
            </Col>
          )}
          {page === HealthReportPage.Groups && (
            <Col xs={12} sm={9}>
              GROUP STATS
            </Col>
          )}
          {page === HealthReportPage.Warnings && (
            <Col xs={12} sm={9}>
              WARNINGS
            </Col>
          )}
          {/*<Col xs={12} sm={9}>
            SUMMARY
  </Col>*/}
        </Row>
      </Row>
    </Container>
  );
};

export default ProjectHealthReport;
