import {describe, expect, test} from '@jest/globals';

import Set from "@/DataStructures/ts/Set";
import { Card } from './fixtures';

const deck = new Set<Card>();

describe('testing Set data structure', () => {
    test('add 1 10 of spade to deck of cards so count is 1', () => {
        deck.add(new Card("10 Spade"))
        expect(deck.size()).toBe(1)
    })
})