import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { DestinationData, LetterData, LetterType } from "../apiTypes";


export default function LettersCategorizedSubpage(props: {
    destinations: DestinationData[];
    letters: LetterData[];
    onAddNew: (type: LetterType, destId: number) => void;
    onModify: (newSubject: {[key: string]: string}, currentLetter: LetterData) => Promise<void>;
    onRemove: (letterData: LetterData) => void;
}) {

    const history = useHistory();
    const query = new URLSearchParams(window.location.search);
    const currentId = query.get("id") ? parseInt(query.get("id") ?? "0") : null;
    const toId = query.get("toid") ? parseInt(query.get("toid") ?? "0") : null;
    const validDestinations = 
        props.destinations
        .filter(dest => props.letters.map(lett => lett.destinationId).includes(dest._id))
        .sort((a, b) => a.name > b.name ? 1 : -1);

    useEffect(() => {
        document.getElementById("id_" + currentId)?.scrollIntoView({
            behavior: "smooth"
        });
    }, [currentId]);

    if (toId !== null) {
        history.push(`?id=${toId}`);
        return null;
    }

    return (
        <>
            { (currentId !== null && !validDestinations.map(d => d._id).includes(currentId ?? -1)) &&
            <div className="alert alert-danger">
            {(() => {
                const dest = props.destinations.find(d => d._id === currentId);
                return <>
                    Destinatarul {dest?.name ?? "dorit"} nu are nicio scrisoare asociată, așadar nu se află în această listă.
                </>;
            })()}
            </div>
            }
            { validDestinations
            .map((destination, index) => {
                const letters = props.letters.filter(lett => lett.destinationId === destination._id);
                const incomingLetters = letters.filter(lett => lett.type === "incoming");
                const outgoingLetters = letters.filter(lett => lett.type === "outgoing");
                return <>
                    <div className="card mb-3" key={destination._id}>
                        <div className="card-header position-relative">
                            <h5 className="card-title d-inline" id={"id_" + destination._id}>
                                <span className="badge badge-danger">{index+1}</span>
                                <span className="badge badge-info mr-2">{destination._id}</span>
                                <span className="bi-person mr-2" />
                                {destination.name}
                                <span className="badge badge-info ml-2">{letters.length} scrisori</span>
                            </h5>
                            { currentId === destination._id ?
                                <Link className="btn btn-primary float-right stretched-link" to="?">
                                    <span className="bi-caret-up mr-2" />
                                    Ascunde
                                </Link>
                                :
                                <Link className="btn btn-primary float-right stretched-link" to={"?id=" + destination._id}>
                                    <span className="bi-caret-down mr-2" />
                                    Arată
                                </Link>
                            }
                        </div>
                        { currentId === destination._id &&
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md">
                                    <h5>Primite</h5>
                                    <table className="table table-striped table-bordered table-hover table-sm table-responsive-md">
                                        <thead><tr>
                                            <th>Cod</th>
                                            <th>Primită la</th>
                                            <th>De mână?</th>
                                            <th>Observații</th>
                                        </tr></thead>
                                        <tbody>
                                        { incomingLetters.map((letter, index) => (
                                            <tr>
                                                <td>
                                                    <span className="badge badge-danger">{index+1}</span>
                                                    <span className="badge badge-info mr-2">{letter._id}</span>
                                                    <Link to={"/letters/all?toid="+letter._id}>
                                                        {letter.code.length !== 0 ? letter.code : "(fără)"}
                                                    </Link>
                                                </td>
                                                <td>{letter.receivedDate}</td>
                                                <td>{letter.handwritten}</td>
                                                <td>{letter.observations}</td>
                                            </tr>
                                        ))}
                                        { incomingLetters.length === 0 &&
                                        <tr>
                                            <td colSpan={4}>
                                                <span className="bi-x-circle mr-2" />
                                                Nu sunt scrisori.
                                            </td>
                                        </tr>
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md">
                                    <h5>Trimise</h5>
                                    <table className="table table-striped table-bordered table-hover table-sm table-responsive-md">
                                        <thead><tr>
                                            <th>Cod</th>
                                            <th>Traseu</th>
                                            <th>De mână?</th>
                                            <th>Observații</th>
                                        </tr></thead>
                                        <tbody>
                                        { outgoingLetters.map((letter, index) => (
                                            <tr>
                                                <td>
                                                    <span className="badge badge-danger">{index+1}</span>
                                                    <span className="badge badge-info mr-2">{letter._id}</span>
                                                    <Link to={"/letters/all?toid="+letter._id}>
                                                        {letter.code.length !== 0 ? letter.code : "(fără)"}
                                                    </Link>
                                                </td>
                                                <td>
                                                    { letter.writtenDate && <>Scrisă: {letter.writtenDate}<br /></> }
                                                    { letter.sentDate && <>Trimisă: {letter.sentDate}<br /></> }
                                                    { letter.receivedDate && <>Primită: {letter.receivedDate}<br /></> }
                                                </td>
                                                <td>{letter.handwritten}</td>
                                                <td>{letter.observations}</td>
                                            </tr>
                                        ))}
                                        { outgoingLetters.length === 0 &&
                                        <tr>
                                            <td colSpan={4}>
                                                <span className="bi-x-circle mr-2" />
                                                Nu sunt scrisori.
                                            </td>
                                        </tr>
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </>;
            })
            }
        </>
    );
}

