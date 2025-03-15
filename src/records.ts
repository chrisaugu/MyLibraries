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


type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};
type RemoveKindField<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property]
};

type typeD = Getters<TProjectManager>;


interface Circle {
    kind: "circle";
    radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;

type EventConfig<Events extends { kind: string }> = {
    [E in Events as E["kind"]]: (event: E) => void;
}

type SquareEvent = { kind: "square", x: number, y: number };
type CircleEvent = { kind: "circle", radius: number };

type Config = EventConfig<SquareEvent | CircleEvent>


type PropEventSource<Type> = {
    on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

/// Create a "watched object" with an `on` method
/// so that you can watch for changes to properties.
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;

const person = makeWatchedObject({
    firstName: "Saoirse",
    lastName: "Ronan",
    age: 26,
});

// makeWatchedObject has added `on` to the anonymous Object

person.on("firstNameChanged", (newValue) => {
    console.log(`firstName was changed to ${newValue}!`);
});
