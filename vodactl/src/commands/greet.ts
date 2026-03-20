import { defineCommand, option } from '@bunli/core'
import { z } from 'zod'

export default defineCommand({
    name: 'greet',
    description: 'Greet someone',
    options: {
        name: option(
            z.string().min(1),
            { description: 'Name to greet', short: 'n' }
        ),
        excited: option(
            z.coerce.boolean().default(false),
            { description: 'Add excitement', short: 'e' }
        )
    },
    handler: async ({ flags }) => {
        const greeting = `Hello, ${flags.name}${flags.excited ? '!' : '.'}`
        console.log(greeting)
    }
})