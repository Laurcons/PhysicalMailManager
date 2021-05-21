import classNames from "classnames";
import React from "react";
import { Nav } from "react-bootstrap";
import { Link, Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { UserData } from "./apiTypes";
import DestinationsPage from "./DestinationsPage";
import GeneralPage from "./GeneralPage";
import LettersPageRouter from "./letters/LettersPageRouter";

function Panel(props: {
    user: UserData,
    onLogout: (reason?: string) => void
}) {
    return (
        <>
            <Nav variant="tabs" className="">
                <Nav.Item>
                    <CustomNavLink label="General" to="/general" />
                </Nav.Item>
                <Nav.Item>
                    <CustomNavLink label="Destinatari" to="/destinations" />
                </Nav.Item>
                <Nav.Item>
                    <CustomNavLink label="Scrisori" to="/letters" />
                </Nav.Item>
            </Nav>
            <div className="border-right border-left border-bottom p-2">
                <Switch>
                        <Route path="/general">
                            <GeneralPage onLogout={props.onLogout}/>
                        </Route>
                        <Route path="/destinations">
                            <DestinationsPage />
                        </Route>
                        <Route path="/letters">
                            <LettersPageRouter />
                        </Route>
                        <Route>
                            <Redirect to="/general" />
                        </Route>
                </Switch>
            </div>
            <div className="float-right border border-top-0 px-2 py-0 text-muted">
                <small>Platformă de Pricop Laurențiu</small>
            </div>
        </>
    )
}

function CustomNavLink({label, to, activeOnlyWhenExact}: {
    label: string,
    to: string,
    activeOnlyWhenExact?: boolean
}) {
    let match = useRouteMatch({
      path: to,
      exact: activeOnlyWhenExact
    });
    return (
        <li className="nav-item">
            <Link className={classNames({
                "nav-link": true,
                "active": match
            })} to={to}>{label}</Link>
        </li>
    );
}

export default Panel;