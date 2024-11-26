import {describe, expect, test} from '@jest/globals';

import Set from "../src/DataStructures/esm/Set";
import { Card } from './fixtures';

let deck = new Set<Card>();

describe('testing Set data structure', () => {
    test('add 1 10 of spade to deck of cards so count is 1', () => {
        deck.add(new Card("10 Spade"))
        expect(deck.size()).toBe(1)
    })
})