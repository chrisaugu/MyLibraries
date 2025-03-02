type UserKeys = "username" | "email" | "firstName" | "lastName" | "address";

type TUser = {
    email: string;
    password: string;
}

type TUser = Record<UserKeys, string | TAddress>;

type TAddress = {
    addressLine1: string;
    addressLine2?: string;
    postCode: number | string;
    city: string;
    state: string;
    country: string;
};

type TProjectManager = {
    phone: string;
    email: string;
    password: string;
};

const user: Record<string, TUser> = {
    "a": {
        email: "a",
        password: "a"
    }
}

type ActiveUserIds =
    | "a"
    | "b"
    | "c"

const activeUsers: Record<ActiveUserIds, TUser | TProjectManager> = {
    "a": {
        email: "",
        password: ""
    },
    "b": {
        email: "",
        password: "",
    },
    "c": {
        email: "",
        password: ""
    },

}

activeUsers['a'].email

function deprecated(target: any, key: string, descriptor: PropertyDescriptor) {
    const originalDef = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.log(`Warning: ${key}() is deprecated. Use other methods instead.`);
        return originalDef.apply(this, args);
    };
    return descriptor;
}

function enumerable(isEnumerable: boolean) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        descriptor.enumerable = isEnumerable;
        console.log(
            "The enumerable property of this member is set to: " +
            descriptor.enumerable,
        );
    };
}

function required(target: any, key: string) {
    let currentValue = target[key];

    Object.defineProperty(target, key, {
        set: (newValue: string) => {
            if (!newValue) {
                throw new Error(`${key} is required.`);
            }
            currentValue = newValue;
        },
        get: () => currentValue,
    });
}

function frozen(target: Function) {
    Object.freeze(target);
    Object.freeze(target.prototype);
}

const joe = {
    username: "joe_hiyden",
    email: "joe@exmaple.com",
    firstName: "Joe",
    lastName: "Hiyden",
    address: {
        addressLine1: "1, New Avenue",
        addressLine2: "Old Avenue",
        postCode: 12345,
        city: "California",
        state: "California",
        country: "USA",
    },
} satisfies TUser;

console.log(joe.address.postCode); // 12345

type Roles = "admin" | "editor" | "viewer";
type Permissions = Record<Roles, boolean>;

const permissions = {
  admin: true,
  editor: false,
  viewer: true,
} satisfies Permissions;