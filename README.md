# I²C Bus MCP2221

An [I²C interface](https://github.com/johntalton/and-other-delights) `I2CBus` implementation over [MCP2221](https://github.com/johntalton/mcp2221)


[![npm Version](http://img.shields.io/npm/v/@johntalton/i2c-bus-mcp2221.svg)](https://www.npmjs.com/package/@johntalton/i2c-bus-mcp2221)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/i2c-bus-mcp2221)
![CI](https://github.com/johntalton/i2c-bus-mcp2221/workflows/CI/badge.svg?branch=master&event=push)
![GitHub](https://img.shields.io/github/license/johntalton/i2c-bus-mcp2221)
[![Downloads Per Month](http://img.shields.io/npm/dm/@johntalton/i2c-bus-mcp2221.svg)](https://www.npmjs.com/package/@johntalton/i2c-bus-mcp2221)
![GitHub last commit](https://img.shields.io/github/last-commit/johntalton/i2c-bus-mcp2221)

#

```js

import { MCP2221 } from '@johntalton/mcp2221'
import { I2CBusMCP2221 } from '@johntalton/i2c-bus-mcp2221'

const hidDevice = /* navigator.hid.request ... */
const source = new WebHIDStreamSource(hidDevice) // or NodeHIDStreamSource
const device = MCP2221.from(source)
const bus = I2CBusMCP2221.from(device)

// bus.readI2CBlock(...) and friends
```