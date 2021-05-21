import classNames from "classnames";
import React, { useEffect, useReducer } from "react";
import { Link, Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import API from "../api";
import { DestinationData, LetterData, LetterType } from "../apiTypes";
import { formData } from "../utilities";
import LettersCategorizedSubpage from "./LettersCategorizedSubpage";
import LettersTableSubpage from "./LettersTableSubpage";

interface State {
    isLoading: boolean;
    letters: LetterData[];
    destinations: DestinationData[];
}

type Action =
    | { type: "SET_LOADING"; payload: boolean; }
    | { type: "PUSH_LETTERS", payload: LetterData[] }
    | { type: "PUSH_DESTINATIONS", payload: DestinationData[] }
    | { type: "REMOVE_LETTERS", payload: LetterData[] }
    | { type: "REMOVE_LETTER_ID", payload: number };

    
export default function LettersPageRouter() {
    let match = useRouteMatch();
    let [state, dispatch] = useReducer(stateReducer, {
        isLoading: true,
        letters: [],
        destinations: []
    });

    useEffect(() => {
        Promise.all([
            API.get("/letters").then(response => {
                const letters = response.data.letters as LetterData[];
                dispatch({
                    type: "PUSH_LETTERS",
                    payload: letters
                });
            }),
            API.get("/destinations").then(response => {
                const dests = response.data.data as DestinationData[];
                dispatch({
                    type: "PUSH_DESTINATIONS",
                    payload: dests.sort((a, b) => a.name > b.name ? 1 : -1)
                });
            })
        ]).then(() => {
            dispatch({
                type: "SET_LOADING",
                payload: false
            })
        });
    }, []);

    function handleAddNew(type: LetterType, destId: number) {
        Promise.all([
            API.post("/letter", formData({
                type,
                destinationId: destId
            })),
            (state.destinations.map(dest => dest._id).includes(destId)) ? undefined :
            API.get("/destination/" + destId).then(response => {
                dispatch({
                    type: "PUSH_DESTINATIONS",
                    payload: [response.data.data]
                });
            })
        ]).then(result => {
            dispatch({
                type: "PUSH_LETTERS",
                payload: [result[0].data.letter]
            });
        });
    }

    function handleModify(newSubject: {[key: string]: any}, currentLetter: LetterData) {
        let newLetter = newSubject as LetterData;
        // send patch request then update DOM
        let formData = new FormData();
        let differences: string[] =
            Object.keys(currentLetter ?? {})
            .filter((prop) => (currentLetter as {[key: string]: any})[prop] !== newSubject[prop]);
        for (let diff of differences) {
            formData.append(diff, newSubject[diff] ?? "");
        }
        formData.append("_method", "patch");
        return API.post("/letter/" + newLetter._id, formData)
        .then(response => {
            dispatch({
                type: "PUSH_LETTERS",
                payload: [response.data.letter]
            });
        });
    }

    function handleRemove(currentLetter: LetterData) {
        if (!window.confirm("Sunteți sigur că doriți să ștergeți scrisoarea?\nNumele: " + retrieveDest(currentLetter?.destinationId ?? -1)?.name))
            return;
        API.post("/letter/" + currentLetter?._id, formData({
            _method: "delete"
        })).then(response => {
            dispatch({
                type: "REMOVE_LETTER_ID",
                payload: response.data.letter._id
            });
        });
    }

    function retrieveDest(destId: number) {
        return state.destinations.find(dest => dest._id === destId);
    }

    if (state.isLoading) {
        return <>
            <span className="spinner-border"></span>
        </>;
    }

    return (
        <>
            <ul className="nav nav-pills mb-2">
                <li className="nav-item">
                    <ActivablePill text="Toate" icon={"bi-table"} to={`${match.url}/all`} />
                </li>
                <li className="nav-item">
                    <ActivablePill text="Grupate" icon={"bi-card-list"} to={`${match.url}/group`} />
                </li>
            </ul>
            <Switch>
                <Route path={match.url} exact>
                    <Redirect to={`${match.url}/all`} />
                </Route>
                <Route path={`${match.url}/all`}>
                    <LettersTableSubpage
                        letters={state.letters}
                        destinations={state.destinations}
                        onAddNew={handleAddNew}
                        onModify={handleModify}
                        onRemove={handleRemove}
                    />
                </Route>
                <Route path={`${match.url}/group`}>
                    <LettersCategorizedSubpage
                        letters={state.letters}
                        destinations={state.destinations}
                        onAddNew={handleAddNew}
                        onModify={handleModify}
                        onRemove={handleRemove}
                    />
                </Route>
            </Switch>
        </>
    );
}

function ActivablePill(props: {
    text: string;
    to: string;
    activeOnlyWhenExact?: boolean;
    icon: string;
}) {
    let match = useRouteMatch({
        path: props.to,
        exact: props.activeOnlyWhenExact
    });
    return (
        <Link to={props.to} className={classNames({"nav-link": true, "active": match})}>
            {props.icon && <span className={`${props.icon} mr-2`} />}
            {props.text}
        </Link>
    );
}

function stateReducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.payload
            };
        case "PUSH_LETTERS": {
            let newLetts = [...state.letters];
            [...action.payload].forEach(letter => {
                let index = state.letters.findIndex(lett => lett._id === letter._id);
                if (index === -1)
                    newLetts.push(letter);
                else newLetts[index] = letter;
            });
            newLetts.sort((a, b) => (
                -(a.timestamp !== b.timestamp ?
                    a.timestamp - b.timestamp :
                    a._id - b._id)
            ));
            return {
                ...state,
                letters: newLetts
            };
        }
        case "PUSH_DESTINATIONS": {
            let newDests = [...state.destinations];
            [...action.payload].forEach(destination => {
                let index = state.destinations.findIndex(dest => dest._id === destination._id);
                if (index === -1)
                    newDests.push(destination);
                else newDests[index] = destination;
            });
            return {
                ...state,
                destinations: newDests
            };
        }
        case "REMOVE_LETTER_ID":
            let newLetts = [...state.letters];
            newLetts = newLetts.filter(lett => lett._id !== action.payload);
            return {
                ...state,
                letters: newLetts
            };
        default: throw new Error();
    }
}