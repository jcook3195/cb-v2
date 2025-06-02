import React, { useEffect, useState } from 'react'
import { db } from "../../firebase/firebase"
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    addDoc
} from "firebase/firestore";
import ReactPaginate from 'react-paginate';

import AlertComponent from '../ui/AlertComponent/AlertComponent';

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"

function AllTrips() {
    // state management
    const [trips, setTrips] = useState([]);
    const [campgrounds, setCampgrounds] = useState("");
    const [newTrip, setNewTrip] = useState(false);
    const [showTrips, setShowTrips] = useState(true);
    const [showSingleTrip, setShowSingleTrip] = useState(false);
    const [currentTripId, setCurrentTripId] = useState("");
    const [currentTripData, setCurrentTripData] = useState(null);
    const [selectedCampground, setSelectedCampground] = useState("");
    const [tripName, setTripName] = useState("");
    const [tripStartDate, setTripStartDate] = useState("");
    const [tripEndDate, setTripEndDate] = useState("");
    const [beforeLeavingChecklist, setBeforeLeavingChecklist] = useState(null);
    const [afterReturningChecklist, setAfterReturningChecklist] = useState(null);
    const [packingChecklist, setPackingChecklist] = useState(null);
    const [beforeLeavingCheckedState, setBeforeLeavingCheckedState] = useState(null);
    const [afterReturningCheckedState, setAfterReturningCheckedState] = useState(null);
    const [packingCheckedState, setPackingCheckedState] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertType, setAlertType] = useState("primary");

    // database
    const tripsCollectionRef = collection(db, "trips");
    const campgroundsCollectionRef = collection(db, "campgrounds");
    const beforeLeavingCollectionRef = collection(db, "beforeLeavingChecklist");
    const afterReturningCollectionRef = collection(db, "afterReturningChecklist");
    const packingCollectionRef = collection(db, "packingChecklist");

    const onShowAlertHandler = () => {
        setShowAlert(true);

        setTimeout(() => {
            setShowAlert(false)}
        , 5000);
    }

    const getTrips = async () => {
        const data = await getDocs(tripsCollectionRef);
        setTrips(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const getSingleTrip = async () => {
        const docRef = doc(db, "trips", currentTripId);
        const data = await getDoc(docRef);
        setCurrentTripData(data);
    }

    const getChecklists = async () => {
        const beforeLeavingData = await getDocs(beforeLeavingCollectionRef);
        const afterReturningData = await getDocs(afterReturningCollectionRef);
        const packingData = await getDocs(packingCollectionRef);

        const beforeLeavingArray = beforeLeavingData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))

        const beforeLeavingChecklistObject = beforeLeavingArray.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});

        const afterReturningArray = afterReturningData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))

        const afterReturningChecklistObject = afterReturningArray.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});

        const packingArray = packingData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))

        const packingChecklistObject = packingArray.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});

        setBeforeLeavingChecklist(beforeLeavingChecklistObject);
        setAfterReturningChecklist(afterReturningChecklistObject);
        setPackingChecklist(packingChecklistObject);
    };

    const getCampgrounds = async () => {
        const data = await getDocs(campgroundsCollectionRef);
        setCampgrounds(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const onNewTripHandler = () => {
        setNewTrip(true);
    };

    const onCancelNewTripHandler = () => {
        setNewTrip(false);
        setShowSingleTrip(false);
        setShowTrips(true);
    }

    const onAddTripHandler = async () => {        
        const docRef = await addDoc(tripsCollectionRef, {
            name: tripName,
            tripStartDate: tripStartDate,
            tripEndDate: tripEndDate,
            campground: selectedCampground,
            beforeCheck: beforeLeavingChecklist,
            afterCheck: afterReturningChecklist,
            packCheck: packingChecklist
        });

        setAlertText(`Trip to ${selectedCampground} has been added!`);
        setAlertType('success');
        onShowAlertHandler();

        setNewTrip(false);
        setTripName("");
        setTripStartDate("");
        setTripEndDate("");
        setCurrentTripId(docRef.id);    
    };

    const isAddTripButtonDisabled = !(
        tripName &&
        tripStartDate &&
        tripEndDate &&
        selectedCampground !== "default" &&
        selectedCampground !== ""
    );

    const onNameChangeHandler = (e) => {
        setTripName(e.target.value);
    };

    const onTripStartDateChangeHandler = (e) => {
        setTripStartDate(e.target.value);
    };

    const onTripEndDateChangeHandler = (e) => {
        setTripEndDate(e.target.value);
    }

    const onCampgroundSelectChangeHandler = (e) => {
        setSelectedCampground(e.target.value);
    };

    const onShowSingleTripHandler = (tripId) => {
        setCurrentTripId(tripId);
        setShowSingleTrip(true);
        setShowTrips(false);
    };

    const onBeforeLeavingCheckChangeHandler = (listItemId, initialCheckedState, position) => {
        const updatedCheckedState = beforeLeavingCheckedState.map((item, index) =>
            index === position ? !item : item
        );

        setBeforeLeavingCheckedState(updatedCheckedState);

         updateCheckList("beforeCheck", listItemId, initialCheckedState);
    };

    const onAfterReturningCheckChangeHandler = (listItemId, initialCheckedState, position) => {
        const updatedCheckedState = afterReturningCheckedState.map((item, index) =>
            index === position ? !item : item
        );

        setAfterReturningCheckedState(updatedCheckedState);

         updateCheckList("afterCheck", listItemId, initialCheckedState);
    };

    const onPackingCheckChangeHandler = async (listItemId, initialCheckedState, position) => {
        const updatedCheckedState = packingCheckedState.map((item, index) =>
            index === position ? !item : item
        );

        setPackingCheckedState(updatedCheckedState);    
        
        updateCheckList("packCheck", listItemId, initialCheckedState);
    };

    const updateCheckList = async (checklist, listItemId, initialCheckedState) => {
        const listRef = doc(db, "trips", currentTripId);
        const checkedState = !initialCheckedState; 

        try {            
            const updatePath = `${checklist}.${listItemId}.checked`
            await updateDoc(listRef, {
                [updatePath]: checkedState,
             });

             // Update local state
             getSingleTrip(); // Refresh the single trip data after updating Firestore
        } catch (error) {
            console.error("Error updating checklist item:", error);
        }
    }

    function Trips({trips}) {
        return(
            <>
                {trips?.map((i) => {
                    const startDate = new Date(i.tripStartDate);
                    const startMonth = startDate.toLocaleString('default', { month: 'long' });
                    const endDate = new Date(i.tripEndDate);
                    const endMonth = endDate.toLocaleString('default', { month: 'long' });

                    return (
                        <div className="card mb-4" key={i.id} onClick={() => onShowSingleTripHandler(i.id)}>
                            <div className="card-body">
                                <h5>{i.campground} | {i.name}</h5>
                                <hr />
                                <p>{startMonth} {startDate.getDate()} - {endMonth} {endDate.getDate()}, {endDate.getFullYear()}</p>
                            </div>
                        </div>
                    );
                    })}
            </>
        )
    }

    function PaginatedItems({ itemsPerPage, currentTrips }) {
        const [itemOffset, setItemOffset] = useState(0);
        
        const endOffset = itemOffset + itemsPerPage;
        const trips = currentTrips.slice(itemOffset, endOffset);
        const pageCount = Math.ceil(currentTrips.length / itemsPerPage);
        
        // Invoke when user click to request another page.
        const handlePageClick = (event) => {
            const newOffset = (event.selected * itemsPerPage) % currentTrips.length;
            setItemOffset(newOffset);
        };
        
        return (
            <>
            <Trips trips={trips} />
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
        );
    }

    useEffect(() => {
        getTrips();
        getChecklists();
        getCampgrounds();

        if(currentTripId !== "") {
            getSingleTrip();
        }
    }, [currentTripId]);

    useEffect(() => {
        if (beforeLeavingChecklist != null) {
            setBeforeLeavingCheckedState(new Array(beforeLeavingChecklist.length).fill(false));
        }
    }, [beforeLeavingChecklist]);

    useEffect(() => {
        if (afterReturningChecklist != null) {
        setAfterReturningCheckedState(new Array(afterReturningChecklist.length).fill(false));
        }
    }, [afterReturningChecklist]);

    useEffect(() => {
        if (packingChecklist != null) {
            setPackingCheckedState(new Array(packingChecklist.length).fill(false));
        }
    }, [packingChecklist]);

  return (
    <>
        {showAlert && (
            <AlertComponent alertText={alertText} alertType={alertType} />                
        )}

        <Row className="justify-content-center text-center">
            <Col className="mt-4 mb-4">
                {!newTrip && (
                    <>
                        <Button variant="primary" onClick={onNewTripHandler}>
                            New Trip +
                        </Button>{" "}
                    </>                    
                )}                

                {(newTrip || showSingleTrip) && (
                    <Button variant="danger" onClick={onCancelNewTripHandler}>
                        Return to All Trips
                    </Button>
                )}
            </Col>
        </Row>

        {showTrips && !newTrip && (
            <Col className="mt-4 mb-4">
                <PaginatedItems itemsPerPage={4} currentTrips={trips} />
            </Col>
        )}   

        {(showSingleTrip && currentTripData != null) && !newTrip && (
            <Row className="justify-content-center text-start single-trip">
                <Col className="mt-4 mb-4">
                    <h2>{currentTripData._document.data.value.mapValue.fields.name.stringValue}</h2>
                    <hr />
                    <h3>Campground: {currentTripData._document.data.value.mapValue.fields.campground.stringValue}</h3>
                    <h4>Packing Checklist</h4>
                    <form className="text-start">
                        {/* {JSON.stringify(currentTripData._document.data.value.mapValue.fields.packCheck.mapValue.fields)} */}
                        {Object.keys(currentTripData._document.data.value.mapValue.fields.packCheck.mapValue.fields).map((key, i) => {
                            const packLoopList = currentTripData._document.data.value.mapValue.fields.packCheck.mapValue.fields[key].mapValue.fields;
                            
                            return (
                                <div key={packLoopList.id.stringValue}>
                                    
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={packLoopList.item.stringValue + "checkId"}
                                            style={{
                                                float: "none",
                                                marginRight: ".5rem",
                                                borderColor: "#000"
                                            }}
                                            checked={packLoopList.checked.booleanValue}
                                            onChange={() => onPackingCheckChangeHandler(packLoopList.id.stringValue, packLoopList.checked.booleanValue)}
                                        />
                                        <label
                                            htmlFor={packLoopList.item.stringValue + "checkId"} 
                                            className="form-check-label"
                                        >
                                            {packLoopList.item.stringValue}
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </form>
                    <h4>Before Leaving Checklist</h4>
                    <form className="text-start">                       
                        {Object.keys(currentTripData._document.data.value.mapValue.fields.beforeCheck.mapValue.fields).map((key, i) => {
                            const beforeLoopList = currentTripData._document.data.value.mapValue.fields.beforeCheck.mapValue.fields[key].mapValue.fields;
                            
                            return (
                                <div key={beforeLoopList.id.stringValue}>
                                    
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={beforeLoopList.item.stringValue + "checkId"}
                                            style={{
                                                float: "none",
                                                marginRight: ".5rem",
                                                borderColor: "#000"
                                            }}
                                            checked={beforeLoopList.checked.booleanValue}
                                            onChange={() => onBeforeLeavingCheckChangeHandler(beforeLoopList.id.stringValue, beforeLoopList.checked.booleanValue)}
                                        />
                                        <label
                                            htmlFor={beforeLoopList.item.stringValue + "checkId"} 
                                            className="form-check-label"
                                        >
                                            {beforeLoopList.item.stringValue}
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </form>
                    <h4>After Returning Checklist</h4>
                    <form className="text-start">
                        {Object.keys(currentTripData._document.data.value.mapValue.fields.afterCheck.mapValue.fields).map((key, i) => {
                            const afterLoopList = currentTripData._document.data.value.mapValue.fields.afterCheck.mapValue.fields[key].mapValue.fields;
                            
                            return (
                                <div key={afterLoopList.id.stringValue}>
                                    
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={afterLoopList.item.stringValue + "checkId"}
                                            style={{
                                                float: "none",
                                                marginRight: ".5rem",
                                                borderColor: "#000"
                                            }}
                                            checked={afterLoopList.checked.booleanValue}
                                            onChange={() => onAfterReturningCheckChangeHandler(afterLoopList.id.stringValue, afterLoopList.checked.booleanValue)}
                                        />
                                        <label
                                            htmlFor={afterLoopList.item.stringValue + "checkId"} 
                                            className="form-check-label"
                                        >
                                            {afterLoopList.item.stringValue}
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </form>
                </Col>
            </Row>
        )}     

        {newTrip && (
            <>
                <Row className="justify-content-center text-center">
                    <Col className="mt-4 mb-4">
                        <Form>
                            <Form.Group className="mb-3" controlId="tripName">
                                <Form.Label>Trip Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={onNameChangeHandler}
                                    value={tripName}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="tripStartDate">
                                <Form.Label>Trip Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    onChange={onTripStartDateChangeHandler}
                                    value={tripStartDate}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="tripEndDate">
                                <Form.Label>Trip End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    onChange={onTripEndDateChangeHandler}
                                    value={tripEndDate}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Campground</Form.Label>
                                <Form.Select
                                    aria-label="Default select example"
                                    onChange={onCampgroundSelectChangeHandler}
                                    defaultValue={"default"}
                                >
                                    <option value="default" disabled>
                                        Select a Campground
                                    </option>

                                    {campgrounds.map((i) => {
                                        return (
                                        <option key={i.id} value={i.name}>
                                            {i.name}
                                        </option>
                                        );
                                    })}
                                </Form.Select>
                            </Form.Group>                            
                        </Form>
                    </Col>
                </Row>
                <Row className="justify-content-center text-center">
                    <Col lg={6} xs={12} className="mt-4 mb-4">
                        <Button 
                            variant="primary" 
                            onClick={onAddTripHandler}
                            disabled={isAddTripButtonDisabled}
                        >
                                Add Trip
                        </Button>{" "}
                    </Col>
                </Row>
            </>
        )}
    </>
  )
}

export default AllTrips;