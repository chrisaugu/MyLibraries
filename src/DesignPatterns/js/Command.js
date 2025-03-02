
// class OrderManager {
//     #orders;
//
//     constructor() {
//         this.#orders = [];
//     }
//
//     placeOrder(order, id) {
//         this.#orders.push(id);
// console.log(`You have successfully ordered ${order} (${id})`);
//     }
//
//     trackOrder(id) {
//         console.log(`Your order ${id} will arrive in 20 minutes.`);
//     }
//
//     cancelOrder(id) {
//         this.#orders = this.#orders.filter(order => order.id !== id);
//         console.log(`You have cancelled your order ${id}`);
//     }
// }
//
// const manager = new OrderManager();
// console.log(manager)
// let order = manager.placeOrder("Pad Thai", "1234");
// console.log(order)
// let track = manager.trackOrder("1234");
// console.log(track)
// let cancel = manager.cancelOrder( "1234");
// console.log(cancel)

class OrderManager {
    #orders;
    constructor() {
        this.#orders = [];
    }

    execute(command, ...args) {
        return command.execute(this.#orders, ...args);
    }
}


class Command {
    constructor(execute) {
        this.execute = execute;
    }
}

function PlaceOrderCommand(order, id) {
    return new Command((orders) => {
        orders.push(id);
        console.log(`You have successfully ordered ${order} (${id})`);
    })
}

function TrackOrderCommand(id) {
    return new Command((orders) => console.log(`Your order ${id} will arrive in 20 minutes.`));
}

function CancelOrderCommand(id) {
    return new Command((orders) => {
        orders = orders.filter(order => order.id !== id);
        console.log(`You have cancelled your order ${id}`);
    });
}

const manager = new OrderManager();
manager.execute(new PlaceOrderCommand("Pad Thai", "1234"));
manager.execute(new TrackOrderCommand("1234"));
manager.execute(new CancelOrderCommand("1234"));