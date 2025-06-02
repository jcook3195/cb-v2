import React from 'react';
import Alert from 'react-bootstrap/Alert';

function AlertComponent({ alertText, alertType }) {
  if (!alertText) {
    return null;
  }

  return (
    <Alert variant={alertType}>
      {alertText}
    </Alert>
  );
}

export default AlertComponent;
