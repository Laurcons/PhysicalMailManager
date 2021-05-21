import classNames from "classnames";
import { Link, useLocation } from "react-router-dom";
import { composeNewQuery } from "./utilities";

export default function PaginationControl(props: {
    pages: number;
    currentPage?: number;
    resetQueryParams?: {[key: string]: string};
}) {
    const query = new URLSearchParams(useLocation().search);
    const currentPage = props.currentPage ?? parseInt(query.get("p") ?? "0");
    return (
        <nav>
            <ul className="pagination mb-0 flex-wrap">
                {Array(props.pages).fill(0).map((val, index) => (
                    <li className={classNames({"page-item": true, "active": index === currentPage})} key={index}>
                        <Link to={composeNewQuery({p: index.toString()})} className="page-link">
                            {index+1}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );

}