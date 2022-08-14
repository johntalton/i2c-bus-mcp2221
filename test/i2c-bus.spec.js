import { describe, it } from 'mocha'
import { expect } from 'chai'

// import { I2CBus } from '@johntalton/and-other-delights'
import { MCP2221A } from '@johntalton/mcp2221'

import { I2CBusMCP2221 } from '@johntalton/i2c-bus-mcp2221'


describe('I2CBusMCP2221', () => {
  it('should', async () => {
    const binding = {
      read: byteLength => console.log({ byteLength }),
      write: bufferSource => console.log({ bufferSource })
    }

    const device = MCP2221A.from(binding)
    const bus /* {I2CBus} */ = I2CBusMCP2221.from(device)

    const address = 0x77
    const cmd = 0x00
    const buffer = new Uint8Array(1)
    const result = await bus.readI2cBlock(address, cmd, buffer.byteLength, buffer)

  })
})