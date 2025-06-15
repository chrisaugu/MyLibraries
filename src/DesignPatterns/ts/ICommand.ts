export default abstract class Command<T> {
    execute: T;

    constructor(execute: T) {
        this.execute = execute;
    }
}