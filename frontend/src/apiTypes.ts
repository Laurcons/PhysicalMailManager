
export interface UserData {
    _id: number;
    username: string;
    password: string;
    registerTimestamp: number;
    loginTimestamp: number;
};

export interface DestinationData {
    _id: number;
    userId: number;
    name: string;
    postalCode: string;
    number: string;
    street: string;
    block: string;
    stair: string; 
    apartment: string;
    locality: string;
    commune: string;
    county: string;
    observations: string;
}

export type LetterType = "outgoing" | "incoming";

export interface LetterData {
    _id: number;
    userId: number;
    destinationId: number;
    type: LetterType;
    code: string;
    price: string;
    handwritten: string;
    receivedDate: string;
    observations: string;
    writtenDate: string;
    sentDate: string;
    timestamp: number;
}