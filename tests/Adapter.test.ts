import {describe, expect, test} from '@jest/globals';
import {OldCalculator, CalculatorAdapter} from "../src/DesignPatterns/Adaptor";

const oldCalculator = new OldCalculator();
const adapter = new CalculatorAdapter(oldCalculator);

describe('testing Adapter Pattern', () => {
    test('empty string should result in zero', () => {
        // oldCalculator.operations(2, 3, 'add')
        expect(adapter.add(2, 3)).toBe(5)
    })
})