

const createUser = ({firstName, lastName, email}) => ({
    firstName,
    lastName,
    email,
    fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
});

const user1 = createUser({
    firstName: "John",
    lastName: "Doe",
    email: "john@dow.com"
})

console.log(user1.fullName());

const createObjectFromArray = ([key, value]) => ({
    [key]: value
});

const user2 = createObjectFromArray(["name", "john"])
console.log(user2)