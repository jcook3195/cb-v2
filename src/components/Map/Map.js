import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";

import AlertComponent from "../ui/AlertComponent/AlertComponent";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

// database
const campgroundsCollectionRef = collection(db, "campgrounds");

// google maps libraries
const libraries = ["places"];

// map styles
const mapContainerStyle = {
  width: "100%",
  height: "80vh",
};

// center point of the map on load
const center = {
  lat: 32.24675453083131,
  lng: -83.26449168979302,
};

const Map = () => {
  // state management
  const [activeMarker, setActiveMarker] = useState(null);
  const [newCampground, setNewCampground] = useState(false);
  const [cgName, setCgName] = useState("");
  const [cgLat, setCgLat] = useState("");
  const [cgLng, setCgLng] = useState("");
  const [cgRating, setCgRating] = useState("");
  const [cgDesc, setCgDesc] = useState("");
  const [markers, setMarkers] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("primary");

  const onShowAlertHandler = () => {
      setShowAlert(true);

      setTimeout(() => {
          setShowAlert(false)}
      , 5000);
  }

  // active marker handling
  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  // api key and libraries on load
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBSN8xcuSK5SkqWe27rYDXo29l44U4EnQU",
    libraries,
  });

  const getMarkers = async () => {
    const data = await getDocs(campgroundsCollectionRef);
    setMarkers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // action handlers
  const onNewCampgroundHandler = () => {
    setNewCampground(true);
  };

  const cgNameOnChangeHandler = (e) => {
    setCgName(e.target.value);
  };

  const cgLatOnChangeHandler = (e) => {
    setCgLat(e.target.value);
  };

  const cgLngOnChangeHandler = (e) => {
    setCgLng(e.target.value);
  };

  const cgRatingOnChangeHandler = (e) => {
    setCgRating(e.target.value);
  };

  const cgDescriptionOnChangeHandler = (e) => {
    setCgDesc(e.target.value);
  };

  const onAddCampgroundHandler = async () => {
    const docRef = await addDoc(campgroundsCollectionRef, {
      name: cgName,
      lat: cgLat,
      lng: cgLng,
      rating: cgRating,
      description: cgDesc,
    });

    setAlertText(`Campground ${cgName} has been added!`);
    setAlertType('success');
    onShowAlertHandler();

    setNewCampground(false);
    setCgName("");
    setCgLat("");
    setCgLng("");
    setCgRating("");
    setCgDesc("");
    getMarkers();
    console.log("Added Campground with ID of: " + docRef.id);
  };

  const isAddCampgroundButtonDisabled = !(
        cgName &&
        cgLat &&
        cgLng &&
        cgRating &&
        cgDesc
  );

  useEffect(() => {
    getMarkers();
  }, []);

  // loading error handlers
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <>
      <Row>
        <Col>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={center}
          >
            {markers !== null ? (
              markers.map(({ id, name, lat, lng, rating, description }) => (
                <MarkerF
                  key={id}
                  icon="/map-pin.png"
                  position={{ lat: Number(lat), lng: Number(lng) }}
                  onClick={() => handleActiveMarker(id)}
                >
                  {activeMarker === id ? (
                    <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                      <div className="text-center">
                        <h5>{name}</h5>
                        <div>{rating}</div>
                        <p>{description}</p>
                      </div>
                    </InfoWindowF>
                  ) : null}
                </MarkerF>
              ))
            ) : (
              <></>
            )}
          </GoogleMap>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs lg={6} className="mt-4 mb-4 text-center">
          <Button variant="primary" onClick={onNewCampgroundHandler}>
            New Campground +
          </Button>{" "}
        </Col>
      </Row>

      {showAlert && (
          <AlertComponent alertText={alertText} alertType={alertType} />                
      )}

      {newCampground && (
        <>
          <Row className="justify-content-center">
            <Col className="mt-4 mb-4 text-center">
              <Form>
                <Form.Group className="mb-3" controlId="cgName">
                  <Form.Label>Campground Name</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={cgNameOnChangeHandler}
                    value={cgName}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgLat">
                  <Form.Label>Campground Lat</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={cgLatOnChangeHandler}
                    value={cgLat}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgLng">
                  <Form.Label>Campground Lng</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={cgLngOnChangeHandler}
                    value={cgLng}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgRating">
                  <Form.Label>Campground Rating</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={cgRatingOnChangeHandler}
                    value={cgRating}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgDesc">
                  <Form.Label>Campground Description</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={cgDescriptionOnChangeHandler}
                    value={cgDesc}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row className="justify-content-center text-center">
            <Col lg={6} xs={12} className="mt-4 mb-4">
              <Button 
                variant="primary" 
                onClick={onAddCampgroundHandler}
                disabled={isAddCampgroundButtonDisabled}
              >
                Add Campground
              </Button>{" "}
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Map;
