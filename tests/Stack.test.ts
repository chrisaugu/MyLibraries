import {describe, expect, test} from '@jest/globals';

import Stack from "../src/DataStructures/esm/Stack";
import { Card } from './fixtures';

describe('Stack module', () => {
    let deck = new Stack<Card>();
    test('add 1 10 of spade to deck of cards so count is 1', () => {
        deck.push(new Card("10 Spade"))
        expect(deck.size()).toBe(1)
    })
})