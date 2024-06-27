import { MCP2221 } from '@johntalton/mcp2221'

import { delayMs } from './delay.js'

export async function ready(device: MCP2221, opaque: string): Promise<void> {
	// console.log(opaque, '?')
	const status = await device.common.status({ opaque })

	// console.log(opaque, {
	// 	ack: status.i2c.ACKed,
	// 	ms: status.i2c.timeoutMs,
	// 	state: status.i2cStateName,
	// 	rtx: status.i2c.requestedTransferLength,
	// 	tx: status.i2c.transferredBytes,
	// 	count: status.i2c.dataBufferCounter
	// })

	if(status.status !== 'success') {
		throw new Error('device status error')
	}

	if (status.i2cState !== 0) {
		// console.warn(opaque, 'i2c status not clean (attempt cancel)', status)
		await device.common.status({ opaque, cancelI2c: true })

		await delayMs(100)
	}
}