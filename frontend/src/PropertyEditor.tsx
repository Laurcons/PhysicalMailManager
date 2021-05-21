import classnames from "classnames";
import React, { useState } from "react";


export default function ProperyEditor(props: {
    subject: {[key: string]: any};
    onSubmit: (newVal: {[key: string]: any}) => void;
    onModify?: (newVal: {[key: string]: any}, isOriginal: boolean) => void;
    isHighlighted?: boolean;
    children?: React.ReactElement;
    translationTable: {[key: string]: string};
    orderTable?: string[];
}) {
    let [newSubject, setNewSubject] = useState<typeof props.subject>(Object.assign({}, props.subject));
    let [modified, setModified] = useState(false);

    function handleModify(prop: string, value: any) {
        let copy = Object.assign({}, newSubject);
        copy[prop] = value;
        modifySubject(copy);
    }

    function modifySubject(copy: {[key: string]: any}) {
        let modified = Object.keys(props.subject).some((prop) => props.subject[prop] !== copy[prop]);
        setNewSubject(copy);
        setModified(modified);
        props.onModify && props.onModify(copy, !modified);
    }

    function handleSubmit() {
        props.onSubmit(newSubject);
    }

    function handleReset() {
        let copy = Object.assign({}, props.subject);
        modifySubject(copy);
    }

    let differences: string[] =
        Object.keys(props.subject)
        .filter((prop) => props.subject[prop] !== newSubject[prop]);

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h5 className="card-title">Detalii</h5>
            </div>
            <div className="card-body p-0">
                {props.children}
                <table className="table table-sm table-bordered mb-0">
                    <tbody>
                        {Object
                        .keys(newSubject)
                        .sort((a, b) => props.orderTable ? props.orderTable?.findIndex(x => x === a) - props.orderTable?.findIndex(x => x === b) : 0)
                        .map((prop) => {
                            if (!Object.keys(props.translationTable).includes(prop))
                                return null;
                            return (
                                <tr className={classnames({"bg-danger": props.isHighlighted && differences.includes(prop) })} key={prop}>
                                    <td>{props.translationTable[prop]}</td>
                                    <td>
                                        <input
                                            className="form-control form-control-sm"
                                            type="text"
                                            value={newSubject[prop] ?? ""}
                                            onChange={(ev) => { handleModify(prop, ev.target.value) }}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="card-footer">
                {modified && "Modificat"}
                <div className="btn-group float-right">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm float-right"
                        onClick={handleReset}
                    >
                        <span className="bi-x-circle mr-2" />
                        Resetează
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm float-right"
                        onClick={handleSubmit}
                    >
                        <span className="bi-check-circle mr-2" />
                        Salvează
                    </button>
                </div>
            </div>
        </div>
    );
}