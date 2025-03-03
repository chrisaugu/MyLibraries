interface State {
    count: number;
}

type Observer = (state: State) => void;

class Store {
    private state: State = {
        count: 0
    }

    private observers: Observer[] = [];

    public getState(): State {
        return { ...this.state }
    }

    public increment() {
        this.state.count++;
        this.notify();
    }

    public subscribe(observer: Observer) {
        this.observers.push(observer);
    }

    public unsubscribe(observer: Observer) {
        this.observers = this.observers.filter(item => item !== observer);
    }

    private notify() {
        this.observers.forEach(observer => observer(this.state))
    }
}

function observerFn(state: State) {
    const isEven = state.count % 2 === 0;
    console.log(`Number is ${isEven ? "even" : "odd"}`);
}

const stateStore = new Store();
stateStore.subscribe(observerFn)
stateStore.increment()
stateStore.increment()
stateStore.increment()
stateStore.increment()