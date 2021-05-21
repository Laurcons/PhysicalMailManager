import { FormEvent, useState } from "react";
import { Modal } from "react-bootstrap";
import { DestinationData, LetterType } from "../apiTypes";

export default function NewLetterModal(props: {
    show: boolean;
    onHide: () => void;
    onSubmit: (type: LetterType, destinationId: number) => void;
    destinations: DestinationData[]
}) {
    let [letterType, setLetterType] = useState<LetterType>("incoming");
    let [destination, setDestination] = useState<number>(-1);

    function isValid() {
        return destination !== -1;
    }

    function handleSubmit(ev: FormEvent) {
        ev.preventDefault();
        props.onSubmit(letterType, destination);
    }

    return (
        <Modal show={props.show} onHide={props.onHide}>
            <form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Adaugă scrisoare nouă</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <div className="form-group">
                            <label>Tip scrisoare:</label>
                            <select className="form-control" value={letterType} onChange={ev => setLetterType(ev.target.value as LetterType)}>
                                <option value="incoming">Primită</option>
                                <option value="outgoing">Trimisă</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{letterType === "incoming" ? "Expeditor:" : "Destinatar:"}</label>
                            <select className="form-control" value={destination ?? 0} onChange={ev => setDestination(parseInt(ev.target.value))}>
                                <option value={-1} key={-1} disabled={true}>Selectează...</option>
                                {props.destinations.map(dest => (
                                    <option value={dest._id} key={dest._id}>
                                        {dest.name}, {dest.street} {dest.number}, {dest.locality} {dest.commune} {dest.postalCode}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p>Acestea reprezintă datele necesare pentru crearea unei scrisori. Celelalte date pot fi adăugate ulterior.</p>
                    </>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-primary" type="button" onClick={props.onHide}>Anulează</button>
                    <button className="btn btn-primary" type="submit" disabled={!isValid()}>Adaugă</button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}