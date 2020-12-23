import { describe, it } from 'mocha'
import { expect } from 'chai'

import { I2CBus } from '@johntalton/and-other-delights'
import { MCP2221A } from '@johntalton/mcp2221'
import { I2CBusMCP2221 } from '../src'


describe('I2CBusMCP2221', () => {
  it('', async () => {
    const binding = {
      read: undefined,
      write: undefined
    }

    const device = await MCP2221A.openPromisified(binding)
    const bus: I2CBus = await I2CBusMCP2221.openPromisified(device)

    const address = 0x77
    const cmd = 0x00
    const buffer = new Uint8Array(1)
    const result = await bus.readI2cBlock(address, cmd, buffer.byteLength, buffer)

  })
})