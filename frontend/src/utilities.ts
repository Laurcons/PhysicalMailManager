
import { DestinationData } from "./apiTypes";

/**
 * Takes a destination, and produces a multiline string containing a human-readable
 * representation of the address of the destination.
 */
export function destinationAddressToString(d: DestinationData) {
    let parts = [];
    let part = [];
    if (d.street)
        part.push(`Str. ${d.street}`);
    if (d.number)
        part.push(`Nr. ${d.number}`);
    parts.push(part);
    part = [];
    if (d.block)
        part.push(`Bloc ${d.block}`);
    if (d.stair)
        part.push(`Scara ${d.stair}`);
    if (d.apartment)
        part.push(`Ap. ${d.apartment}`);
    parts.push(part);
    part = [];
    if (d.locality && d.commune)
        part.push(`Sat ${d.locality}`);
    if (d.locality && !d.commune)
        part.push(`Oraș ${d.locality}`);
    if (d.commune)
        part.push(`Com. ${d.commune}`);
    parts.push(part);
    part = [];
    if (d.county)
        part.push(`Jud. ${d.county}`);
    if (d.postalCode)
        part.push(`Cod poștal ${d.postalCode}`);
    parts.push(part);
    return parts
        .filter(part => part.length > 0)
        .map(part => part.join(', '))
        .join('\n');
}

/**
 * Takes a key-value object, and returns a corresponding FormData class
 * filled with those key-values.
 * @param fields The key-value object
 * @returns The FormData class
 */
export function formData(fields: {[key: string]: any}) {
    let fd = new FormData();
    Object.keys(fields).forEach(field => {
        fd.append(field, fields[field]);
    });
    return fd;
}

/**
 * Takes an object with key-value pairs, adds them to the current query, then returns the new query.
 * @param params The key-value pairs
 * @returns The new query: `?key=value&key=value`
 */
export function composeNewQuery(params: {[key: string]: any}) {
    let currentParams = document.location.search
        .substr(1) // returns without leading ?
        .split('&') // returns ["key1=value1", "key2=value2"]
        .filter(p => p.length !== 0) // removes situations like ?&
        .map(p => ({[p.split('=')[0]]: p.split('=')[1] ?? ""})) // returns [{key1: value1}, {key2: value2}]
        .reduce((prev, curr) => Object.assign(prev, curr), {}); // returns {key1: value1, key2: value2}
    Object.assign(currentParams, params);
    return "?" +
        Object.keys(currentParams)
        .filter(key => currentParams[key] !== null && currentParams[key] !== undefined)
        .map(key => (
            key + "=" + currentParams[key]
        ))
        .join('&');
}

/**
 * Provides a translation table for letter objects. Returns an object, which maps each field
 * of a letter to a human-readable string.
 */
export function letterTranslationTable() {
    return {
        code: "Cod",
        handwritten: "De mână",
        receivedDate: "Primit",
        price: "Preț",
        observations: "Observații",
        writtenDate: "Scris",
        sentDate: "Trimis"
    };
}
/**
 * Provides a translation table for destination objects. Returns an object, which maps each field
 * of a letter to a human-readable string.
 */
export function destinationTranslationTable() {
    return {
        name: "Nume",
        street: "Strada",
        number: "Numărul",
        block: "Bloc",
        stair: "Scara",
        apartment: "Apartament",
        locality: "Localitate",
        commune: "Comuna",
        county: "Județul",
        postalCode: "Cod poștal",
        observations: "Observații"
    };
}
/**
 * Provides an order array for letter objects. Returns each relevant key, as strings, in the required order.
 */
export function letterOrderTable() {
    return [
        "code",
        "handwritten",
        "writtenDate",
        "sentDate",
        "receivedDate",
        "price",
        "observations"
    ];
}
/**
 * Provides an order array for destination objects. Returns each relevant key, as strings, in the required order.
 */
export function destinationOrderTable() {
    return [
        "name",
        "street",
        "number",
        "block",
        "stair",
        "apartment",
        "locality",
        "commune",
        "county",
        "postalCode",
        "observations"
    ];
}