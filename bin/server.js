#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/naming-convention
const test = require('../dist/src/index');
const AppRunner = test.AppRunner;
new AppRunner().runCli(process);