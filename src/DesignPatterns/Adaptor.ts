/**
 * Adaptor Pattern
 * It bridges the gap between incompatible interfaces or classes, enabling them to work together seamlessly.
 */
export class OldCalculator {

    constructor() { }

    operations = function (term1: number, term2: number, operation: string) {
        switch (operation) {
            case 'add':
                return term1 + term2;
            case 'sub':
                return term1 - term2;
            default:
                return NaN;
        }
    }
}

class NewCalculator {
    constructor() { }
    add = function (_term1: number, _term2: number) {}
    sub = function (_term1: number, _term2: number) {}
}

export class CalculatorAdapter extends NewCalculator {
    #oldCalculator: OldCalculator;

    constructor(oldCalculator: OldCalculator) {
        super();
        this.#oldCalculator = oldCalculator;
    }
    
    add =  (term1: number, term2: number) => {
        return this.#oldCalculator.operations(term1, term2, 'add')
    }
    sub =  (term1: any, term2: any) => {
        return this.#oldCalculator.operations(term1, term2, 'sub')
    }
}

