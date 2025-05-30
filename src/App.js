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
          <Col>
            <Map />
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col>
            <ListManagement />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}
export default App;
