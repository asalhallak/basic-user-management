export class User {
    id: number;
    loginName: string;
    displayName: string;
    country: string;
    isActive: boolean;
    salary: number;
    profilePictureUrl: string;
    address: {
        id: number,
        city: string;
        country: string;
        postalCode: string;
        state: string;
        streetName: string;
        streetNumber: string;
    }
}
