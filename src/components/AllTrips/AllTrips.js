import React, { useEffect, useState } from 'react'
import { db } from "../../firebase/firebase"
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore";
import ReactPaginate from 'react-paginate';

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

function AllTrips() {
    // state management
    const [trips, setTrips] = useState([]);
    const [showTrips, setShowTrips] = useState(true);
    const [showSingleTrip, setShowSingleTrip] = useState(false);
    const [currentTripId, setCurrentTripId] = useState("");
    const [currentTripData, setCurrentTripData] = useState(null);
    const [beforeLeavingChecklist, setBeforeLeavingChecklist] = useState(null);
    const [afterReturningChecklist, setAfterReturningChecklist] = useState(null);
    const [packingChecklist, setPackingChecklist] = useState(null);
    const [beforeLeavingCheckedState, setBeforeLeavingCheckedState] = useState(null);
    const [afterReturningCheckedState, setAfterReturningCheckedState] = useState(null);
    const [packingCheckedState, setPackingCheckedState] = useState(null);

    // database
    const tripsCollectionRef = collection(db, "trips");
    // const campgroundsCollectionRef = collection(db, "campgrounds");
    const beforeLeavingCollectionRef = collection(db, "beforeLeavingChecklist");
    const afterReturningCollectionRef = collection(db, "afterReturningChecklist");
    const packingCollectionRef = collection(db, "packingChecklist");

    const getTrips = async () => {
        const data = await getDocs(tripsCollectionRef);
        setTrips(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    const getSingleTrip = async () => {
        console.log("Current Trip Id: " + currentTripId);
        const docRef = doc(db, "trips", currentTripId);
        const data = await getDoc(docRef);
        setCurrentTripData(data);
    }

    const getChecklists = async () => {
        const beforeLeavingData = await getDocs(beforeLeavingCollectionRef);
        const afterReturningData = await getDocs(afterReturningCollectionRef);
        const packingData = await getDocs(packingCollectionRef);

        setBeforeLeavingChecklist(beforeLeavingData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setAfterReturningChecklist(afterReturningData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setPackingChecklist(packingData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    // const getCampgrounds = async () => {
    //     const data = await getDocs(campgroundsCollectionRef);
    //     setCampgrounds(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    // };

    const onShowSingleTripHandler = (tripId) => {
        setCurrentTripId(tripId);
        setShowSingleTrip(true);
        setShowTrips(false);
    }

    const onBeforeLeavingCheckChangeHandler = (position) => {
        const updatedCheckedState = beforeLeavingCheckedState.map((item, index) =>
        index === position ? !item : item
        );

        setBeforeLeavingCheckedState(updatedCheckedState);

        console.log(currentTripData);
    };

    const onAfterReturningCheckChangeHandler = (position) => {
        const updatedCheckedState = afterReturningCheckedState.map((item, index) =>
        index === position ? !item : item
        );

        setAfterReturningCheckedState(updatedCheckedState);
    };

    const onPackingCheckChangeHandler = async (itemId, initialCheckedState, position) => {
        const updatedCheckedState = packingCheckedState.map((item, index) =>
            index === position ? !item : item
        );

        setPackingCheckedState(updatedCheckedState);    
        
        updatePackingList();
    };

    const updatePackingList = async () => {
        // Find the correct checklist and item
        const tripRef = doc(db, "trips", currentTripId);

        try {            
            // Construct the update object.  This is a *very* specific path to the 'checked' value.  Adapt as needed.
            //  await updateDoc(tripRef, {
            //     [`packCheck`]: packingCheckedState,
            //  });

            console.log(packingChecklist);

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
                    console.log("THIS: " + JSON.stringify(i));
                    return (
                        <div className="card mb-4" key={i.id} onClick={() => onShowSingleTripHandler(i.id)}>
                            <div className="card-body">
                                <h3>{i.campground} | {i.date}</h3>
                                <hr />
                                <p>Something should go here.</p>
                            </div>
                        </div>
                    );
                    })}
            </>
        )
    }

    function PaginatedItems({ itemsPerPage, currentTrips }) {
        // Here we use item offsets; we could also use page offsets
        // following the API or data you're working with.
        const [itemOffset, setItemOffset] = useState(0);
        
        // Simulate fetching items from another resources.
        // (This could be items from props; or items loaded in a local state
        // from an API endpoint with useEffect and useState)
        const endOffset = itemOffset + itemsPerPage;
        console.log(`Loading trips from ${itemOffset} to ${endOffset}`);
        const trips = currentTrips.slice(itemOffset, endOffset);
        const pageCount = Math.ceil(currentTrips.length / itemsPerPage);
        
        // Invoke when user click to request another page.
        const handlePageClick = (event) => {
            const newOffset = (event.selected * itemsPerPage) % currentTrips.length;
            console.log(
            `User requested page number ${event.selected}, which is offset ${newOffset}`
            );
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
        // getCampgrounds();

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
        {showTrips && (
            <Col lg={6} xs={12} className="mt-4 mb-4">
                <PaginatedItems itemsPerPage={4} currentTrips={trips} />
            </Col>
        )}   

        {showSingleTrip && currentTripData != null && (
            <Row className="justify-content-center text-start single-trip">
                <Col lg={6} xs={12} className="mt-4 mb-4">
                    <h2>{currentTripData._document.data.value.mapValue.fields.name.stringValue}</h2>
                    <hr />
                    <h3>Campground: {currentTripData._document.data.value.mapValue.fields.campground.stringValue}</h3>
                    <h6>Dates: {currentTripData._document.data.value.mapValue.fields.date.stringValue}</h6>
                    <h4>Packing Checklist</h4>
                    <form className="text-start">
                    {JSON.stringify(currentTripData)}
                    </form>
                    
                </Col>
            </Row>
        )}     
    </>
  )
}

export default AllTrips