import List from "@/DataStructures/ts/List";
import PriorityQueue from "@/DataStructures/ts/PriorityQueue";
import Queue from "@/DataStructures/ts/Queue";

// Order Matching algorithms are critical for financial markets and trading platforms.
// They determine how buy and sell orders are matched and executed.
// Commonly used databases for order matching systems include:
// - In-memory databases (e.g., Redis, Memcached) for fast access
// - Relational databases (e.g., PostgreSQL, MySQL) for structured data storage
// - NoSQL databases (e.g., MongoDB, Cassandra) for flexible schema
// - Time-series databases (e.g., InfluxDB, TimescaleDB) for time-series data
// - Specialized databases (e.g., QuestDB, DuckDB) for high-performance
//   analytics and real-time data processing

// questDB
// duckDB

// Commonly used data structures for order matching systems include:
// - Priority queues for managing orders based on price and time
// - Binary heaps for efficient order matching
// - Hash tables for quick order lookups

// Commonly used algorithms for order matching include:
// - Price-time priority: Orders are matched based on price first, then time of arrival.
// - Pro-rata matching: Orders are matched proportionally based on available quantity.
// - FIFO (First In, First Out): Orders are matched in the order they were received.

enum OrderState {
    Filled = "filled",
    Unfilled = "unfilled",
    Canceled = "canceled",
}
type TOrderState = keyof typeof OrderState;

enum OrderStatus {
    Open = "open",
    Closed = "closed",
    Cancelled = "cancelled",
    Expired = "expired",
}
type TOrderStatus = keyof typeof OrderStatus;

enum OrderType {
    Market = "market",
    Limit = "limit",
    Stop = "stop",
    "Stop-Loss-Market" = "stop-loss-market",
    "Stop-Loss-Limit" = "stop-loss-limit",
}
type TOrderType = keyof typeof OrderType;

enum OrderSide {
    Buy = "buy",
    Sell = "sell",
}
type TOrderSide = keyof typeof OrderSide;

interface Order {
    orderId: number;
    type: OrderType;
    side: OrderSide;
    code: string;
    price: number;
    unitPrice: number;
    quantity: number;
    filledQty: number;
    status: OrderStatus;
    filledAveragePrice: number;
    timestamp: Date;
}

type TOrder = typeof Order;

class Cancel extends Order {
    type: OrderType = OrderType.Stop;
    orderId!: string;
}

class MarketOrderQueue extends PriorityQueue<Order {
    constructor() {
        super();
    }

    enqueue(order: Order) {
        // Implementation for enqueuing market orders
    }

    dequeue(): Order | undefined {
        // Implementation for dequeuing market orders
        return super.dequeue();
    }
}

class FIFOQueue extends Queue<Order> {
    push(order: Order) {
        this.enqueue(order);
    }
    pop(): Order | undefined {
        return this.dequeue();
    }
}

class AVLTreeQueue extends Queue<Order> {
    private orderComparator: (a: Order, b: Order) => boolean;

    constructor(orderComparator: (a: Order, b: Order) => boolean) {
        super();
        this.orderComparator = orderComparator;
    }

    push(order: Order) {
        // Implementation for pushing orders into the AVL tree queue
        this.enqueue(order);
    }

    remove(order: Order, condition: (o: Order) => boolean) {
        this.remove(order);
    }

}

class MarketBuyOrderQueue extends FIFOQueue {
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
}
class MarketSellOrderQueue extends FIFOQueue {
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
}

const orderByNonDecreasing = (a: Order, b: Order) => {
    if (a.unitPrice === b.unitPrice) {
        if (a.timestamp === b.timestamp) {
            return a._id < b._id;
        }
        return a.timestamp < b.timestamp;
    }
    return a.unitPrice < b.unitPrice;
};

const orderByNonIncreasing = (a: Order, b: Order) => {
    if (a.unitPrice === b.unitPrice) {
        if (a.timestamp === b.timestamp) {
            return a._id < b._id;
        }
        return a.timestamp < b.timestamp;
    }
    return a.unitPrice > b.unitPrice;
};

class LimitBuyOrderQueue extends AVLTreeQueue {
    remove(order: Order, arg1: (o: any) => boolean) {
        throw new Error("Method not implemented.");
    }
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(orderByNonIncreasing); // decreasing order
    }
}
class LimitSellOrderQueue extends AVLTreeQueue {
    remove(order: Order, arg1: (o: any) => boolean) {
        throw new Error("Method not implemented.");
    }
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(orderByNonDecreasing); // increasing order
    }
}
class StopLossBuyMarketOrderQueue extends AVLTreeQueue {
    remove(order: Order) {
        throw new Error("Method not implemented.");
    }
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(orderByNonIncreasing); // decreasing order
    }
}
class StopLossSellMarketOrderQueue extends AVLTreeQueue {
    remove(order: Order) {
        throw new Error("Method not implemented.");
    }
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(orderByNonDecreasing); // increasing order
    }
}
class StopLossBuyLimitOrderQueue extends AVLTreeQueue {
    remove(order: Order) {
        throw new Error("Method not implemented.");
    }
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(orderByNonIncreasing); // decreasing order
    }
}
class StopLossSellLimitOrderQueue extends AVLTreeQueue {
    remove(order: Order) {
        throw new Error("Method not implemented.");
    }
    push(order: Order) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super(orderByNonDecreasing); // increasing order
    }
}

class OrderBook {
    // class OrderMatching {
    orderQueue = new Queue<Order>();
    orderBook: List<Order | undefined>;
    marketOrderBuyQueue = new Queue<Order>();
    marketOrderSellQueue = new Queue<Order>();
    limitOrderBuyQueue = new Queue<Order>();
    limitOrderSellQueue = new Queue<Order>();
    stopBuyMarketOrderQueue = new Queue<Order>();
    stopSellMarketOrderQueue = new Queue<Order>();
    stopBuyLimitOrderQueue = new Queue<Order>();
    stopSellLimitOrderQueue = new Queue<Order>();

    marketBuyOrderQueue: MarketBuyOrderQueue;
    marketSellOrderQueue: MarketSellOrderQueue;
    limitBuyOrderQueue: LimitBuyOrderQueue;
    limitSellOrderQueue: LimitSellOrderQueue;
    stopLossBuyMarketOrderQueue: StopLossBuyMarketOrderQueue;
    stopLossSellMarketOrderQueue: StopLossSellMarketOrderQueue;
    stopLossBuyLimitOrderQueue: StopLossBuyLimitOrderQueue;
    stopLossSellLimitOrderQueue: StopLossSellLimitOrderQueue;

    /**
     * OrderBook constructor
     * Initializes the order book with different order queues
     */
    constructor() {
        this.orderBook = new List<Order>();
        this.orderQueue.enqueue(new Order());
        this.orderQueue.enqueue(new Order());
        this.orderQueue.enqueue(new Order());
        this.orderQueue.enqueue(new Order());
        this.orderQueue.enqueue(new Order());
        this.orderBook.append(this.orderQueue.dequeue());
        this.orderBook.append(this.orderQueue.dequeue());

        this.marketBuyOrderQueue = new MarketBuyOrderQueue();
        this.marketSellOrderQueue = new MarketSellOrderQueue();
        this.limitBuyOrderQueue = new LimitBuyOrderQueue();
        this.limitSellOrderQueue = new LimitSellOrderQueue();
        this.stopLossBuyMarketOrderQueue = new StopLossBuyMarketOrderQueue();
        this.stopLossSellMarketOrderQueue = new StopLossSellMarketOrderQueue();
        this.stopLossBuyLimitOrderQueue = new StopLossBuyLimitOrderQueue();
        this.stopLossSellLimitOrderQueue = new StopLossSellLimitOrderQueue();
    }

    priceTimePriority() {
    }

    execute() {

    }

    cancelOrder(order: Order) {
        // remove the order from the matching queue
        switch (order.type) {
            case OrderType.Market:
                throw new Error("INVALID_ORDER_TYPE_FOR_CANCEL");
            case "limit":
                if (order.side === OrderSide.Buy) {
                    // remove only if filledQty is 0
                    this.limitBuyOrderQueue.remove(order, (o) => o.filledQty === 0);
                } else {
                    // remove only if filledQty is 0
                    this.limitSellOrderQueue.remove(order, (o) => o.filledQty === 0);
                }
                return;
            case OrderType["Stop-Loss-Market"]:
                if (order.side === OrderSide.Buy) {
                    this.stopLossBuyMarketOrderQueue.remove(order);
                } else {
                    this.stopLossSellMarketOrderQueue.remove(order);
                }
                return;
            case OrderType["Stop-Loss-Limit"]:
                if (order.side === OrderSide.Buy) {
                    this.stopLossBuyLimitOrderQueue.remove(order);
                } else {
                    this.stopLossSellLimitOrderQueue.remove(order);
                }
                return;
            default:
                throw new Error("INVALID_ORDER_TYPE");
        }
    }
    addOrder(order: Order) {
        // add the order to the matching queue
        switch (order.type) {
            case OrderType.Market:
                if (order.side === OrderSide.Buy) {
                    this.marketBuyOrderQueue.push(order);
                } else {
                    this.marketSellOrderQueue.push(order);
                }
                return;
            case OrderType.Limit:
                if (order.side === OrderSide.Buy) {
                    this.limitBuyOrderQueue.push(order);
                } else {
                    this.limitSellOrderQueue.push(order);
                }
                return;
            case OrderType["Stop-Loss-Market"]:
                if (order.side === OrderSide.Buy) {
                    this.stopLossBuyMarketOrderQueue.push(order);
                } else {
                    this.stopLossSellMarketOrderQueue.push(order);
                }
                return;
            case OrderType["Stop-Loss-Limit"]:
                if (order.side === OrderSide.Buy) {
                    this.stopLossBuyLimitOrderQueue.push(order);
                } else {
                    this.stopLossSellLimitOrderQueue.push(order);
                }
                return;
            default:
                throw new Error("INVALID_ORDER_TYPE");
        }
    }

    // Matching of market buy and sell
    matchMarketBuyWithMarketSell = () => {
        let marketBuyOrder = this.marketBuyOrderQueue.front();
        let marketSellOrder = this.marketSellOrderQueue.front();
        let currentPrice = 0.4; // TODO: get the current price from the market

        while (marketBuyOrder && marketSellOrder) {
            const marketBuyOrderRemainingQty =
                marketBuyOrder.qty - marketBuyOrder.filledQty;
            const marketSellOrderRemainingQty =
                marketSellOrder.qty - marketSellOrder.filledQty;
            if (marketBuyOrderRemainingQty === marketSellOrderRemainingQty) {
                // both orders will be completely filled
                marketBuyOrder.filledQty = marketBuyOrder.qty;
                marketSellOrder.filledQty = marketSellOrder.qty;
                marketBuyOrder.status = OrderStatus.Closed;
                marketSellOrder.status = OrderStatus.Closed;
                // calculate the filled average price from previously filled orders
                marketBuyOrder.filledAveragePrice =
                    (marketBuyOrder.filledQty * marketBuyOrder.filledAveragePrice +
                        marketBuyOrderRemainingQty * currentPrice) /
                    marketBuyOrder.qty;
                marketSellOrder.filledAveragePrice =
                    (marketSellOrder.filledQty * marketSellOrder.filledAveragePrice +
                        marketSellOrderRemainingQty * currentPrice) /
                    marketSellOrder.qty;
                // remove the orders from the matching queue
                this.marketBuyOrderQueue.pop();
                this.marketSellOrderQueue.pop();
                // TODO: save the orders to the database

                // move to the next orders
                marketBuyOrder = this.marketBuyOrderQueue.front();
                marketSellOrder = this.marketSellOrderQueue.front();
            }
            else if (marketBuyOrderRemainingQty < marketSellOrderRemainingQty) {
                // market buy order will be completely filled
                // market sell order will be partially filled
                marketBuyOrder.filledQty = marketBuyOrder.qty;
                marketSellOrder.filledQty += marketBuyOrderRemainingQty; //! check this - might not assign properly in the queue
                marketBuyOrder.status = OrderStatus.Closed;
                marketSellOrder.status = OrderStatus.Open;
                // calculate the filled average price from previously filled orders
                marketBuyOrder.filledAveragePrice =
                    (marketBuyOrder.filledQty * marketBuyOrder.filledAveragePrice +
                        marketBuyOrderRemainingQty * currentPrice) /
                    marketBuyOrder.qty;
                marketSellOrder.filledAveragePrice =
                    (marketSellOrder.filledQty * marketSellOrder.filledAveragePrice +
                        marketBuyOrderRemainingQty * currentPrice) /
                    marketSellOrder.filledQty;
                // remove the market buy order from the matching queue
                this.marketBuyOrderQueue.pop();
                // TODO: save the market buy order to the database

                // move to the next market buy order
                marketBuyOrder = this.marketBuyOrderQueue.front();
            }
            else {
                // market sell order will be completely filled
                // market buy order will be partially filled
                marketBuyOrder.filledQty += marketSellOrderRemainingQty; //! check this - might not assign properly in the queue
                marketSellOrder.filledQty = marketSellOrder.qty;
                marketBuyOrder.status = OrderStatus.Open;
                marketSellOrder.status = OrderStatus.Closed;
                // calculate the filled average price from previously filled orders
                marketBuyOrder.filledAveragePrice =
                    (marketBuyOrder.filledQty * marketBuyOrder.filledAveragePrice +
                        marketSellOrderRemainingQty * currentPrice) /
                    marketBuyOrder.filledQty;
                marketSellOrder.filledAveragePrice =
                    (marketSellOrder.filledQty * marketSellOrder.filledAveragePrice +
                        marketSellOrderRemainingQty * currentPrice) /
                    marketSellOrder.qty;
                // remove the market sell order from the matching queue
                this.marketSellOrderQueue.pop();
                // TODO: save the market sell order to the database

                // move to the next market sell order
                marketSellOrder = this.marketSellOrderQueue.front();
            }
        }
    };
}

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["market", "limit", "stop-loss-market", "stop-loss-limit"],
            required: true,
        },
        side: {
            type: String,
            enum: ["buy", "sell"],
            required: true,
        },
        symbol: {
            type: String,
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
        filledQty: {
            type: Number,
            required: true,
            default: 0,
        },
        filledAveragePrice: {
            type: Number,
            required: false,
        },
        limitPrice: {
            type: Number,
            required: false,
        },
        stopPrice: {
            type: Number,
            required: false,
        },
        status: {
            type: String,
            enum: ["open", "closed", "cancelled", "expired"],
            required: true,
            default: "open",
        },
    },
    {
        timestamps: true,
    }
);