import classNames from "classnames";
import objectHash from "object-hash";
import { useReducer } from "react";
import { Prompt, useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { DestinationData, LetterData, LetterType } from "../apiTypes";
import PaginationControl from "../PaginationControl";
import ProperyEditor from "../PropertyEditor";
import { composeNewQuery, letterOrderTable, letterTranslationTable } from "../utilities";
import NewLetterModal from "./NewLetterModal";

type State = {
    entriesPerPage: number;
    isAddNewModalShown: boolean;
    isCurrentModified: boolean;
    isPropertyEditorHighlighted: boolean;
};
type Action = 
  | { type: "SET_ADD_NEW_MODAL_SHOWN", payload: boolean }
  | { type: "SET_IS_CURRENT_MODIFIED", payload: boolean }
  | { type: "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED", payload: boolean }

export default function LettersTableSubpage(props: {
    destinations: DestinationData[];
    letters: LetterData[];
    onAddNew: (type: LetterType, destId: number) => void;
    onModify: (newSubject: {[key: string]: string}, currentLetter: LetterData) => Promise<void>;
    onRemove: (letterData: LetterData) => void;
}) {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const currentPage = parseInt(query.get("p") ?? "0");
    const currentId = query.get("id") ? parseInt(query.get("id") ?? "0") : null;
    const toId = query.get("toid") ? parseInt(query.get("toid") ?? "0") : null;
    const [state, dispatch] = useReducer(stateReducer, {
        entriesPerPage: 10,
        isAddNewModalShown: false,
        isCurrentModified: false,
        isPropertyEditorHighlighted: false
    });
    const history = useHistory();
    const destinationFilter = query.get("d") ? parseInt(query.get("d") ?? "-1") : null;
    const typeFilter = (query.get("t") !== "null" ? (query.get("t") ?? null) : null);
    const filteredLetters = props.letters.filter(lett => {
        let res = true;
        if (typeFilter !== null)
            res = res && lett.type === typeFilter;
        if (destinationFilter !== null)
            res = res && lett.destinationId === destinationFilter;
        return res;
    });
    const totalPages = 
        Math.floor(filteredLetters.length / state.entriesPerPage) +
        (filteredLetters.length % state.entriesPerPage !== 0 ? 1 : 0);
    const currentLetter = filteredLetters.find(lett => lett._id === currentId) ?? null;

    if (toId !== null) {
        // calculate page number and redirect
        let pageNum = Math.floor(
            filteredLetters.findIndex(l => l._id === toId) /
            state.entriesPerPage
        );
        // preserve filter params
        history.push(composeNewQuery({
            toid: null,
            id: toId,
            p: pageNum
        }));
        return null;
    }

    function handleAddNew(type: LetterType, destId: number) {
        handleAddNewModalVisibility(false);
        props.onAddNew(type, destId);
    }

    function handleAddNewModalVisibility(newVis: boolean) {
        dispatch({
            type: "SET_ADD_NEW_MODAL_SHOWN",
            payload: newVis
        });
    }

    function handleSwitchRow(newId: number) {
        let id: string | null;
        if (state.isCurrentModified) {
            dispatch({
                type: "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED",
                payload: true
            });
            setTimeout(() => {
                dispatch({
                    type: "SET_IS_PROPERTY_EDITOR_HIGHLIGHTED",
                    payload: false
                });
            }, 500);
            return;
        }
        if (currentId === newId)
            id = null;
        else id = newId.toString();
        history.push(composeNewQuery({id}));
    }

    function handleSubmit(newSubject: {[key: string]: any}) {
        if (!currentLetter)
            return;
        props.onModify(newSubject, currentLetter).then(() => {
            dispatch({
                type: "SET_IS_CURRENT_MODIFIED",
                payload: false
            });
        });
    }

    function handleRemove() {
        currentLetter && props.onRemove(currentLetter);
    }

    function retrieveDest(destId: number) {
        return props.destinations.find(dest => dest._id === destId);
    }

    return (
        <>
            <Prompt when={state.isCurrentModified} message={"Aveți modificări nesalvate! Sunteți sigur că doriți să părăsiți pagina?"} />
            <NewLetterModal
                destinations={props.destinations}
                show={state.isAddNewModalShown}
                onHide={() => handleAddNewModalVisibility(false)}
                onSubmit={handleAddNew}
            />
            <div className="row">
                <div className={classNames({"col-md-8": currentLetter, "col-md-12": !currentLetter})}>
                    <div className="d-flex mb-2">
                        <div className="mr-2">
                            <button className="btn btn-primary" onClick={() => handleAddNewModalVisibility(true)}>
                                <span className="bi-file-plus mr-2" />
                                Adaugă scrisoare
                            </button>
                        </div>
                        <PaginationControl pages={totalPages} />
                    </div>
                    <div className="d-flex mb-2">
                        <div className="btn-group mr-2">
                            <button className={classNames({
                                "btn": true,
                                "btn-outline-primary": typeFilter !== "incoming",
                                "btn-primary": typeFilter === "incoming"
                            })} onClick={() => {
                                if (typeFilter === "incoming")
                                    history.push(composeNewQuery({t: null}));
                                else history.push(composeNewQuery({t: "incoming"}));
                            }}>
                                <span className="bi-file-arrow-down mr-2" />
                                Numai primite
                            </button>
                            <button className={classNames({
                                "btn": true,
                                "btn-outline-primary": typeFilter !== "outgoing",
                                "btn-primary": typeFilter === "outgoing"
                            })} onClick={() => {
                                if (typeFilter === "outgoing")
                                    history.push(composeNewQuery({t: null}));
                                else history.push(composeNewQuery({t: "outgoing"}));
                            }}>
                                <span className="bi-file-arrow-up mr-2" />
                                Numai trimise
                            </button>
                        </div>
                        <div className="form-group m-0">
                            <select
                                className="form-control"
                                value={destinationFilter ?? -1}
                                onChange={(ev) => {
                                    history.push(composeNewQuery({d: (ev.target.value !== "-1") ? ev.target.value : null}));
                                }}
                            >
                                <option value={-1} key={-1}>Toți destinatarii</option>
                                    {destinationFilter && !filteredLetters.map(l => l.destinationId).includes(destinationFilter) &&
                                        <option value={destinationFilter} key={destinationFilter}>Numai {retrieveDest(destinationFilter)?.name ?? "(negăsit)"}</option>
                                    }
                                    {props.destinations
                                    .filter(dest => props.letters.map(lett => lett.destinationId).includes(dest._id))
                                    .map(dest => (
                                        <option value={dest._id} key={dest._id}>Numai {dest.name}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                    <table className={classNames({
                        "table table-bordered table-hover table-responsive-md": true,
                        "d-none d-md-table": currentLetter
                    })}>
                        <thead><tr>
                            <th>Cod</th>
                            <th>Pentru/De la</th>
                            <th>Tip</th>
                            <th>Detalii</th>
                            <th>Observații</th>
                            {!currentLetter && <th>Opțiuni</th>}
                        </tr></thead>
                        <tbody>
                            {filteredLetters.length === 0 &&
                            <tr>
                                <td colSpan={6}>Nu există scrisori {filteredLetters.length !== props.letters.length && "cu filtrele selectate"}.</td>
                            </tr>
                            }
                            {filteredLetters
                            .slice(state.entriesPerPage * currentPage, state.entriesPerPage * currentPage + state.entriesPerPage)
                            .map((letter, index) => (
                                <tr
                                    key={letter._id}
                                    className={classNames({
                                        "table-active": currentId === letter._id && !state.isCurrentModified,
                                        "table-warning": currentId === letter._id && state.isCurrentModified
                                    })}
                                >
                                    <td
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleSwitchRow(letter._id)}
                                    >
                                        <span className="badge badge-danger">{currentPage * state.entriesPerPage + index+1}</span>
                                        <span className="badge badge-info">{letter._id}</span>
                                        &nbsp;
                                        {letter.code}
                                    </td>
                                    <td
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleSwitchRow(letter._id)}
                                    >
                                        {retrieveDest(letter.destinationId)?.name}
                                    </td>
                                    <td
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleSwitchRow(letter._id)}
                                    >
                                        {letter.type === "incoming" ? <>
                                            <span className="bi-arrow-down mr-2" />
                                            Primită
                                        </> : <>
                                            <span className="bi-arrow-up mr-2" />
                                            Trimisă
                                        </>}
                                    </td>
                                    <td
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleSwitchRow(letter._id)}
                                    >
                                        {letter.handwritten && <>De mână: {letter.handwritten}<br /></>}
                                        {letter.type === "outgoing" && <>
                                            {letter.writtenDate && <>Scrisă: {letter.writtenDate}<br /></>}
                                            {letter.sentDate && <>Trimisă: {letter.sentDate}<br /></>}
                                        </>}
                                        {letter.receivedDate && <>Primită: {letter.receivedDate}<br /></>}
                                        {letter.price && <>Preț: {letter.price}</>}
                                    </td>
                                    <td
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleSwitchRow(letter._id)}
                                    >{letter.observations}</td>
                                    { !currentLetter &&
                                    <td>
                                        <Link
                                            className="btn btn-primary btn-sm mb-2 mr-2"
                                            to={"/letters/group?id=" + retrieveDest(letter.destinationId)?._id + "#id_" + retrieveDest(letter.destinationId)?._id}>
                                            <span className="bi-card-list mr-2" />
                                            Toate scrisorile
                                        </Link>
                                        <Link
                                            className="btn btn-primary btn-sm mb-2 mr-2"
                                            to={"/destinations?toid=" + retrieveDest(letter.destinationId)?._id}>
                                            <span className="bi-person mr-2" />
                                            Detalii destinatar
                                        </Link>
                                    </td>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <PaginationControl pages={totalPages} />
                </div>
                <div className="col">
                    { currentLetter && <>
                    <div className="card mb-2 d-md-none">
                        <div className="card-header">
                            <h5 className="card-title">
                                Scrisoarea curentă
                            </h5>
                        </div>
                        <div className="card-body">
                            {currentLetter.type === "incoming" ? "Expeditor" : "Destinatar"}:&nbsp;
                            {retrieveDest(currentLetter.destinationId)?.name}<br />
                            Tip: {currentLetter.type === "incoming" ? "Primită" : "Trimisă"}
                            <button
                                className="btn btn-primary btn-block"
                                onClick={() => {
                                    history.push(composeNewQuery({id: null}));
                                }}
                            >
                                Înapoi la lista scrisorilor
                            </button>
                        </div>
                    </div>
                    <div className="card mb-2">
                        <div className="card-header">
                            <h5 className="card-title">Opțiuni</h5>
                        </div>
                        <div className="card-body d-flex flex-column">
                            <Link
                                className="btn btn-primary btn-sm mb-2"
                                to={"/letters/group?id=" + retrieveDest(currentLetter.destinationId)?._id + "#id_" + retrieveDest(currentLetter.destinationId)?._id}>
                                <span className="bi-card-list mr-2" />
                                Toate scrisorile destinatarului
                            </Link>
                            <Link
                                className="btn btn-primary btn-sm mb-2"
                                to={"/destinations?toid=" + retrieveDest(currentLetter.destinationId)?._id}>
                                <span className="bi-person mr-2" />
                                Detalii destinatar
                            </Link>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleRemove}
                            >
                                <span className="bi-file-minus mr-2" />
                                Șterge scrisoare
                            </button>
                        </div>
                    </div>
                    <ProperyEditor
                        subject={currentLetter}
                        onModify={(newObj, isOriginal) => {
                            dispatch({
                                type: "SET_IS_CURRENT_MODIFIED",
                                payload: !isOriginal
                            });
                        }}
                        onSubmit={handleSubmit}
                        translationTable={letterTranslationTable()}
                        orderTable={letterOrderTable()}
                        isHighlighted={state.isPropertyEditorHighlighted}
                        key={objectHash(currentLetter)}
                    />
                    </>}
                </div>
            </div>
        </>
    );
}

function stateReducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_ADD_NEW_MODAL_SHOWN":
            return {
                ...state,
                isAddNewModalShown: action.payload
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
        default:
            throw new Error();
    }
}