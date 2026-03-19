#!/usr/bin/env bun
import { createCLI } from '@bunli/core'
import pkg from '../package.json' with { type: 'json' }
import helloCommand from './commands/hello'
import greetCommand from './commands/greet'
import deployCommand from './commands/deploy'

const cli = await createCLI({
  name: pkg.name,
  version: pkg.version,
  description: pkg.description
});

cli.command(helloCommand);
cli.command(greetCommand);
cli.command(deployCommand);

await cli.run();