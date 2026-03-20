import { defineCommand, option } from '@bunli/core'
import { z } from 'zod'

// Bunli infers everything
export default defineCommand({
    name: 'deploy',
    description: '',
    options: {
        env: option(
            z.enum(['dev', 'staging', 'prod']),
            { description: 'Target environment' }
        )
    },
    handler: async ({ flags }) => {
        // TypeScript knows flags.env is 'dev' | 'staging' | 'prod'
        switch (flags.env) {
            case 'dev': // ✅ Autocompleted
            case 'staging': // ✅ Autocompleted
            case 'prod': // ✅ Autocompleted
        }
    }
})