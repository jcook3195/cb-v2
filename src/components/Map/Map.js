import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import ReactPaginate from 'react-paginate';

import AlertComponent from "../ui/AlertComponent/AlertComponent";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import FloatingLabel from "react-bootstrap/FloatingLabel";

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
  const [campgrounds, setCampgrounds] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("primary");
  const [manageCampgrounds, setManageCampgrounds] = useState(false);
  const [currentCampgroundId, setCurrentCampgroundId] = useState("");
  const [showSingleCampground, setShowSingleCampground] = useState(false);
  const [currentCampgroundData, setCurrentCampgroundData] = useState(null);

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

  const getCampgrounds = async () => {
    const data = await getDocs(campgroundsCollectionRef);
    setCampgrounds(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // action handlers
  const onNewCampgroundHandler = () => {
    setNewCampground(true);
    setManageCampgrounds(false);

    setCgName("");    
    setCgLat("");
    setCgLng("");
    setCgRating("");
    setCgDesc("");
  };

  const onManageCampgroundsHandler = () => {
    setNewCampground(false);
    setManageCampgrounds(true);
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
    setManageCampgrounds(true);
    setShowSingleCampground(false);
    setCgName("");
    setCgLat("");
    setCgLng("");
    setCgRating("");
    setCgDesc("");
    getCampgrounds();
    console.log("Added Campground with ID of: " + docRef.id);
  };

  const onDeleteCampgroundHandler = async (campgroundId) => {
    try {
      const campgroundDocRef = doc(db, "campgrounds", campgroundId);
      await deleteDoc(campgroundDocRef);

      setAlertText("Campground successfully removed.");
      setAlertType("success");
      onShowAlertHandler();

      setShowSingleCampground(false);
      setManageCampgrounds(true);
      setCurrentCampgroundId("");

      getCampgrounds();
    } catch (error) {
      console.error("Error deleting campground: ", error);
      setAlertText("There was an error deleting the campground.");
      setAlertType("danger");
      onShowAlertHandler();
    }
  }

  const getSingleCampground = async () => {
    const docRef = doc(db, "campgrounds", currentCampgroundId);
    const data = await getDoc(docRef);

    setCurrentCampgroundData(data);
    setCgName(data._document.data.value.mapValue.fields.name.stringValue);    
    setCgLat(data._document.data.value.mapValue.fields.lat.stringValue);
    setCgLng(data._document.data.value.mapValue.fields.lng.stringValue);
    setCgRating(data._document.data.value.mapValue.fields.rating.stringValue);
    setCgDesc(data._document.data.value.mapValue.fields.description.stringValue);
  }

  const onShowSingleCampgroundHandler = (campgroundId) => {
    setCurrentCampgroundId(campgroundId);
    setShowSingleCampground(true);
    setManageCampgrounds(false);
  }

  const onCancelAddCampground = () => {
    setNewCampground(false);
    setManageCampgrounds(false);
    setShowSingleCampground(false);
  }

  const onUpdateCampgroundHandler = async () => {
    const campgroundRef = doc(db, "campgrounds", currentCampgroundId);
    try {
      await updateDoc(campgroundRef, {
        name: cgName,
        lat: cgLat,
        lng: cgLng,
        rating: cgRating,
        description: cgDesc
      });

      getSingleCampground();

      setAlertText(`${cgName} has been updated.`);
      setAlertType('success');
      onShowAlertHandler();
    } catch (error) {
      console.error("Error updating campground: ", error);

      setAlertText(`Error updating campground: ${cgName}`);
      setAlertType('danger');
      onShowAlertHandler();
    }
  }

  const isAddCampgroundButtonDisabled = !(
        cgName &&
        cgLat &&
        cgLng &&
        cgRating &&
        cgDesc
  );

  function Campgrounds({campgrounds}) {
    return (
      <>
        {campgrounds?.map((i) => {
          return (
            <div className="card mb-4" key={i.id} onClick={() => onShowSingleCampgroundHandler(i.id)}>
              <div className="card-body">
                <h5>{i.name}</h5>
                <hr />
                <p>More data.</p>
              </div>
            </div>
          )
        })}
      </>
    );
  };

  function PaginatedItems({ itemsPerPage, campgrounds}) {
    const [itemOffset, setItemOffset] = useState(0);

    const endOffset = itemOffset + itemsPerPage;
    const currentCampgrounds = campgrounds.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(campgrounds.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % campgrounds.length;
      setItemOffset(newOffset);
    };

    return (
      <>
        <Campgrounds campgrounds={currentCampgrounds} />
        <ReactPaginate
            breakLabel="..."
            nextLabel="Next"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="Previous"
            renderOnZeroPageCount={null}
        />
      </>
    )
  }

  useEffect(() => {
    getCampgrounds();    
  }, []);

  useEffect(() => {
    if (currentCampgroundId !== "") {
      getSingleCampground();
    }
  }, [currentCampgroundId, showSingleCampground])

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
            {campgrounds !== null ? (
              campgrounds.map(({ id, name, lat, lng, rating, description }) => (
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
      <Row className="justify-content-center text-center">
        <Col className="mt-4 mb-4">          
          {!newCampground && (
            <>
              <Button variant="primary" onClick={onNewCampgroundHandler}>
                New Campground +
              </Button>{" "}     
            </>
          )}

          {!manageCampgrounds && (
            <>
              <Button variant="secondary" onClick={onManageCampgroundsHandler}>
                Manage Campgrounds
              </Button>{" "}
            </>
          )}

          {(newCampground || manageCampgrounds || showSingleCampground) && (
              <Button
                variant="danger"
                onClick={onCancelAddCampground}
              >
                Cancel
              </Button>
            )} 
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
                <Form.Group className="mb-3" controlId="cgNameEdit">
                  <FloatingLabel label="Campground Name">
                    <Form.Control 
                      type="text"
                      onChange={cgNameOnChangeHandler}
                      value={cgName}
                      id="cgNameEdit"
                    />
                  </FloatingLabel>
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgLatEdit">
                  <FloatingLabel label="Campground Latitude">
                    <Form.Control
                      type="text"
                      onChange={cgLatOnChangeHandler}
                      value={cgLat}
                      id="cgLatEdit"
                    />
                  </FloatingLabel>
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgLngEdit">
                  <FloatingLabel label="Campground Longitude">
                    <Form.Control
                      type="text"
                      onChange={cgLngOnChangeHandler}
                      value={cgLng}
                      id="cgLngEdit"
                    />
                  </FloatingLabel>
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgRatingEdit">
                  <FloatingLabel label="Campground Rating">
                    <Form.Control
                      type="text"
                      onChange={cgRatingOnChangeHandler}
                      value={cgRating}
                      id="cgRatingEdit"
                    />
                  </FloatingLabel>
                </Form.Group>
                <Form.Group className="mb-3" controlId="cgDescEdit">
                  <FloatingLabel label="Campground Description">
                    <Form.Control
                      type="text"
                      onChange={cgDescriptionOnChangeHandler}
                      value={cgDesc}
                      id="cgDescEdit"
                    />
                  </FloatingLabel>
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row className="justify-content-center text-center">
            <Col className="mt-4 mb-4">
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

      {manageCampgrounds && (
        <>
          <Row className="justify-content-center manage-campgrounds">
            <Col className="mt-4 mb-4 text-center">
              <PaginatedItems itemsPerPage={4} campgrounds={campgrounds} />
            </Col>
          </Row>
        </>
      )}

      {((showSingleCampground && currentCampgroundData != null) && !manageCampgrounds && !newCampground) && (
        <>
          <Row className="justify-content-center text-start single-trip">
            <Col className="mt-4 mb-4">
              <Form>
                  <Form.Group className="mb-3" controlId="cgName">
                    <FloatingLabel label="Campground Name">
                      <Form.Control 
                        type="text"
                        onChange={cgNameOnChangeHandler}
                        value={cgName}
                        id="cgName"
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="cgLat">
                    <FloatingLabel label="Campground Latitude">
                      <Form.Control
                        type="text"
                        onChange={cgLatOnChangeHandler}
                        value={cgLat}
                        id="cgLat"
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="cgLng">
                    <FloatingLabel label="Campground Longitude">
                      <Form.Control
                        type="text"
                        onChange={cgLngOnChangeHandler}
                        value={cgLng}
                        id="cgLng"
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="cgRating">
                    <FloatingLabel label="Campground Rating">
                      <Form.Control
                        type="text"
                        onChange={cgRatingOnChangeHandler}
                        value={cgRating}
                        id="cgRating"
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="cgDesc">
                    <FloatingLabel label="Campground Description">
                      <Form.Control
                        type="text"
                        onChange={cgDescriptionOnChangeHandler}
                        value={cgDesc}
                        id="cgDesc"
                      />
                    </FloatingLabel>
                  </Form.Group>
                </Form>
            </Col>
          </Row>
          <Row className="justify-content-center text-center">
            <Col className="mt-4 mb-4">
              <Button
                variant="primary"
                onClick={onUpdateCampgroundHandler}
                >
                  Update Campground
                </Button>{" "}
                <Button variant="danger" onClick={() => onDeleteCampgroundHandler(currentCampgroundId)}>
                    Delete Campground
                </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Map;
