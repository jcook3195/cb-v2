import React, { useState, useEffect} from 'react';
import AllTrips from "../AllTrips/AllTrips";

import Row from "react-bootstrap/Row";

function ListManagement() {

  return (
    <>
        <Row className="justify-content-center text-start existing-trips">
          <AllTrips />
        </Row>
    </>
  )
}

export default ListManagement