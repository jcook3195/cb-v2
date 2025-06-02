import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Map from "./components/Map/Map";
import ListManagement from "./components/ListManagement/ListManagement";

import "./App.css";

function App() {
  return (
    <React.Fragment>
      <Container>
        <Row className="justify-content-center">
          <Col xs lg={6} className="mt-4 mb-4 text-center">
            <h1>CampingBuddyV2</h1>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col lg={12} xl={6}>
            <ListManagement />
          </Col>
          <Col lg={12} xl={6}>
            <Map />
          </Col>          
        </Row>
      </Container>
    </React.Fragment>
  );
}
export default App;
