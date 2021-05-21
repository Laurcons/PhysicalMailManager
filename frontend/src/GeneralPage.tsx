import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import API from "./api";

function GeneralPage(props: {
    onLogout: (reason?: string) => void
}) {

    let [changelogShow, setChangelogShow] = useState(false);

    return (
        <>
            <p>Bine ați venit în Managerul de Poștă Fizică!</p>
            <p>
                Acesta reprezintă proiectul lui Pricop Laurențiu pentru Atestatul de sfârșit de clasa a XII-a. Însă, am dorit să fac această aplicație capabilă
                de a fi hostată public, și probabil va primi actualizări de-a lungul timpului!
            </p>
            <p>
                Versiunea aplicației: v1.2<br />
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setChangelogShow(true)}>Changelog</button>
            </p>
            <Button variant="secondary" onClick={logout}>
                Deautentificare
            </Button>
            <Modal show={changelogShow} onHide={() => setChangelogShow(false)} scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>Log de schimbări</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Versiunea v1.2</h4>
                    <ul className="list-group mb-3">
                        <li className="list-group-item bi-plus">
                            &nbsp;S-au adăugat iconițe pe majoritatea butoanelor aplicației
                        </li>
                        <li className="list-group-item bi-check">
                            &nbsp;Linkurile care trimit de la destinatar la scrisori sau invers acum funcționează corect în toate circumstanțele
                        </li>
                        <li className="list-group-item bi-check">
                            &nbsp;S-au reparat probleme de pe pagina de autentificare/înregistrare
                        </li>
                        <li className="list-group-item bi-check">
                            &nbsp;Ordinea câmpurilor în editorul de scrisori este acum logică
                        </li>
                        <li className="list-group-item bi-check">
                            &nbsp;Vizualizarea grupată a scrisorilor este acum mai ușor și logic de navigat
                        </li>
                    </ul>
                    <h4>Versiunea v1.1</h4>
                    <ul className="list-group">
                        <li className="list-group-item bi-check">
                            &nbsp;Linkurile care trimit de la destinatar la scrisori sau invers acum funcționează corect în toate circumstanțele
                        </li>
                        <li className="list-group-item bi-check">
                            &nbsp;„Toate scrisorile destinatarului” de pe pagina Destinatari acum trimite la vizualizarea Tabel a scrisorilor
                        </li>
                        <li className="list-group-item bi-plus">
                            &nbsp;Pagina cu scrisorile grupate acum afișează mesaje de eroare relevante
                        </li>
                        <li className="list-group-item bi-check">
                            &nbsp;Pagina cu scrisorile tabelate acum reacționează mai bine în timpul filtrării
                        </li>
                        <li className="list-group-item bi-plus">
                            &nbsp;Pagina cu scrisorile grupate acum afișează „(fără)” dacă codul scrisorii nu este completat
                        </li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <div className="btn btn-primary" onClick={() => setChangelogShow(false)}>
                        Închide
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );

    function logout() {
        API.post("/logout").then(() => {
            props.onLogout("user-initiated");
        });
    }

}

export default GeneralPage;