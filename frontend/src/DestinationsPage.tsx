import classNames from "classnames";
import objectHash from "object-hash";
import React, { Reducer, useEffect, useReducer } from "react";
import { Prompt, useHistory, useLocation } from "react-router";
import API from "./api";
import { DestinationData } from "./apiTypes";
import { composeNewQuery, destinationAddressToString, destinationOrderTable, destinationTranslationTable } from "./utilities";
import PaginationControl from "./PaginationControl";
import PropertyEditor from "./PropertyEditor";
import { Link } from "react-router-dom";

type State = {
    destinations: DestinationData[];
    entriesPerPage: number;
    isCurrentModified: boolean;
    isPropertyEditorHighlighted: boolean;
    isLoading: boolean;
};
type Action = 
  | { type: "SET_LOADING", payload: boolean }
  | { type: "SET_DESTINATIONS", payload: DestinationData[] }
  | { type: "UPDATE_DESTINATION", payload: DestinationData }
  | { type: "REMOVE_DESTINATION", payload: number }
  | { type: "SET_IS_CURRENT_MODIFIED", payload: boolean }
  | { type: "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED", payload: boolean };

function DestinationsPage(props: {

}) {
    const query = new URLSearchParams(useLocation().search);
    const history = useHistory();
    const [state, dispatch] = useReducer<Reducer<State, Action>>(stateReducer, {
        destinations: [],
        entriesPerPage: 10,
        isCurrentModified: false,
        isPropertyEditorHighlighted: false,
        isLoading: true
    });

    const totalPages = 
        Math.floor(state.destinations.length / state.entriesPerPage) +
        (state.destinations.length % state.entriesPerPage !== 0 ? 1 : 0) +
        (state.destinations.length === 0 ? 1 : 0);
    const toId = query.get("toid") ? parseInt(query.get("toid") ?? "-1") : null;
    const currentId = (query.get("id") ? parseInt(query.get("id") ?? "-1") : null);
    const currentDest = state.destinations.find(dest => dest._id === currentId);
    const currentPage = parseInt(query.get("p") ?? "0");

    useEffect(() => {
        API.get("/destinations").then((response) => {
            dispatch({
                type: "SET_DESTINATIONS",
                payload: response.data.data
            });
            dispatch({
                type: "SET_LOADING",
                payload: false
            });
        });
    }, []);

    if (toId !== null && !state.isLoading) {
        // redirect the user to the proper ID and page number, but only after
        //  the dests have loaded
        let pageNum = Math.floor(
            state.destinations.findIndex(d => d._id === toId) /
            state.entriesPerPage
        );
        history.push(`?p=${pageNum}&id=${toId}`);
    }

    function handleSwitchRow(id: number) {
        if (state.isCurrentModified) {
            doUnsavedAlert();
        } else {
            const newrow = id === currentId ? null : id.toString();
            history.push(composeNewQuery({id: newrow}));
        }
    }

    function doUnsavedAlert() {
        dispatch({
            type: "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED",
            payload: true
        });
        setTimeout(() => {
            dispatch({
                type: "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED",
                payload: false
            });
        }, 250);
    }

    function handleAddNew() {
        if (state.isCurrentModified)
            doUnsavedAlert();
        else {
            API.post("/destination").then((response) => {
                dispatch({
                    type: "UPDATE_DESTINATION",
                    payload: response.data.data
                });
            });
        }
    }

    function handleRemove() {
        let res = window.confirm("Sunteți sigur că doriți să ștergeți acest destinatar?\n" + currentDest?.name);
        if (!res)
            return;
        let formData = new FormData();
        formData.append("_method", "delete");
        API.post(`/destination/${currentDest?._id}`, formData).then((response) => {
            dispatch({
                type: "REMOVE_DESTINATION",
                payload: currentDest?._id ?? -1
            });
        });
    }

    function handleUpdate(newSubject: {[key: string]: any}) {
        // send api request and update in memory
        let formData = new FormData();
        let differences: string[] =
            Object.keys(currentDest ?? {})
            .filter((prop) => (currentDest as {[key: string]: any})[prop] !== newSubject[prop]);
        for (let diff of differences) {
            formData.append(diff, newSubject[diff] ?? "");
        }
        formData.append("_method", "patch");
        API.post(`/destination/${newSubject._id}`, formData).then((response) => {
            // update in memory
            dispatch({
                type: "UPDATE_DESTINATION",
                payload: newSubject as DestinationData
            });
            dispatch({
                type: "SET_IS_CURRENT_MODIFIED",
                payload: false
            });
        });
    }

    if (state.isLoading) {
        return (
            <span className="spinner spinner-border"></span>
        );
    }

    return (
        <>
            <Prompt when={state.isCurrentModified} message={"Aveți modificări nesalvate! Sunteți sigur că doriți să părăsiți pagina?"}  />
            <div className="row">
                <div className={currentDest ? "col-md-8" : "col-12"}>
                    <div className="d-flex mb-2">
                        <div className="mr-2">
                            <button className="btn btn-primary" onClick={handleAddNew}>
                                <span className="bi-person-plus mr-2" />
                                Adaugă destinatar
                            </button>
                        </div>
                        <div className="overflow-scroll">
                            <PaginationControl pages={totalPages} currentPage={currentPage}/>
                        </div>
                    </div>
                    <table className="table table-bordered table-hover table-responsive-md">
                        <thead>
                            <tr>
                                <th>Nume</th>
                                <th>Adresa</th>
                                <th>Observații</th>
                                { !currentDest && <th>Opțiuni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {state.destinations
                            .sort((a, b) => a.name > b.name ? 1 : -1)
                            .slice(state.entriesPerPage * currentPage, state.entriesPerPage * currentPage + state.entriesPerPage)
                            .map((dest, index) => (
                                <tr
                                    className={classNames({
                                        "table-active": dest._id === currentId && !state.isCurrentModified,
                                        "table-warning": dest._id === currentId && state.isCurrentModified
                                    })}
                                    style={{cursor: "pointer"}}
                                    key={objectHash(dest)}
                                >
                                    <td key={dest.name}
                                        onClick={() => handleSwitchRow(dest._id)}
                                    >
                                        <span className="badge badge-danger">{currentPage * state.entriesPerPage + index+1}</span>
                                        <span className="badge badge-info">{dest._id}</span>
                                        &nbsp;
                                        {dest.name}
                                    </td>
                                    <td key={index+"-1"}
                                        onClick={() => handleSwitchRow(dest._id)}
                                    >
                                        {destinationAddressToString(dest).split("\n").map(row => <>{row}<br /></>)}
                                    </td>
                                    <td key={index+"-2"}
                                        onClick={() => handleSwitchRow(dest._id)}
                                    >
                                        {dest.observations}
                                    </td>
                                    { !currentDest &&
                                    <td>
                                        <Link
                                            className="btn btn-primary btn-sm mb-2"
                                            to={"/letters/all?d=" + dest._id}
                                        >
                                            <span className="bi-table mr-2" />
                                            Toate scrisorile destinatarului
                                        </Link>
                                    </td>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="overflow-scroll">
                        <PaginationControl pages={totalPages} currentPage={currentPage}/>
                    </div>
                </div>
                <div className="col">
                    { currentDest && <>
                        <div className="card mb-2">
                            <div className="card-header">
                                <h5 className="card-title">Opțiuni</h5>
                            </div>
                            <div className="card-body d-flex flex-column">
                                <Link
                                    className="btn btn-primary btn-sm mb-2"
                                    to={"/letters/all?d=" + currentDest._id}
                                >
                                    <span className="bi-table mr-2" />
                                    Toate scrisorile destinatarului
                                </Link>
                                <button className="btn btn-outline-danger btn-sm" onClick={handleRemove}>
                                    <span className="bi-person-dash mr-2" />
                                    Șterge destinatar
                                </button>
                            </div>
                        </div>
                        <PropertyEditor
                            subject={currentDest ?? {}}
                            onSubmit={handleUpdate}
                            onModify={(newVal, isOriginal) => {
                                dispatch({
                                    type: "SET_IS_CURRENT_MODIFIED",
                                    payload: !isOriginal
                                });
                            }}
                            isHighlighted={state.isPropertyEditorHighlighted}
                            key={objectHash(currentDest)}
                            translationTable={destinationTranslationTable()}
                            orderTable={destinationOrderTable()}
                        />
                    </>}
                </div>
            </div>
        </>
    );
}

function stateReducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.payload
            };
        case "SET_DESTINATIONS":
            return {
                ...state,
                destinations: action.payload
            };
        case "UPDATE_DESTINATION":
            let newDests = [...state.destinations];
            let index = newDests.findIndex(d => d._id === action.payload._id);
            if (index !== -1) {
                newDests[index] = action.payload;
            } else {
                newDests.push(action.payload);
            }
            return {
                ...state,
                destinations: newDests
            };
        case "REMOVE_DESTINATION":
            return {
                ...state,
                destinations: state.destinations.filter(d => d._id !== action.payload)
            };
        case "SET_IS_CURRENT_MODIFIED":
            return {
                ...state,
                isCurrentModified: action.payload
            };
        case "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED":
            return {
                ...state,
                isPropertyEditorHighlighted: action.payload
            };
        default: throw new Error("Invalid action");
    }
}

export default DestinationsPage;