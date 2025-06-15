import List from "@/DataStructures/ts/List";
import Queue from "@/DataStructures/ts/Queue";

// questDB
// duckDB

type TOrderState = "fulfilled" | "shipped" | "canceled" | "returned";

class Order {
    symbol!: string;
    quantity!: number;
    price!: number;
}

type TOrder = typeof Order;

class OrderMatching {
    orderQueue = new Queue<Order>();
    orderBook: List<Order>;

    constructor() {
        this.orderBook = new List<Order>();
        // this.orderBook.
    }

    priceTimePriority() {
    }

    execute() {

    }
}