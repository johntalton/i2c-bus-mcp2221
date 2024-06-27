import { I2CAddress, I2CBufferSource } from '@johntalton/and-other-delights'
import { MCP2221, Response } from '@johntalton/mcp2221'

async function checkWrite(device: MCP2221, expectedByteLength: number, result: Response, opaque: string) {
	if(result.status !== 'success') { throw new Error('write failed') }
	const status = await device.common.status({ opaque })

	if(status.i2c.requestedTransferLength !== expectedByteLength) {
		console.warn(opaque, 'transferred bytes not expected length', status.i2c.transferredBytes, status.i2c.requestedTransferLength, expectedByteLength)
	}

	// console.log(opaque, {
	// 	length: expectedByteLength,
	// 	ack: status.i2c.ACKed,
	// 	ms: status.i2c.timeoutMs,
	// 	state: status.i2cStateName,
	// 	rtx: status.i2c.requestedTransferLength,
	// 	tx: status.i2c.transferredBytes,
	// 	count: status.i2c.dataBufferCounter
	// })

	if(status.i2cStateName === undefined) {
		throw new Error('missing i2cStateName field in status')
	}

	if (status.i2cStateName === 'ADDRESS_NACK_STOP') {
		throw new Error('not acked')
	}

	const okStates = [
		'IDLE',
		'WRITE_DATA_END_NO_STOP',
		'WRITE_DATA_WAIT_SEND'
		// 'WRITE_DATA_ACK'
	]

	if(!okStates.includes(status.i2cStateName)) {
		console.warn(opaque, 'not idle', status.i2cStateName)
		throw new Error('Not Idle-like')
	}
}

export async function writeNoSTOP(device: MCP2221, address: I2CAddress, buffer: I2CBufferSource, opaque: string) {
	// console.log(opaque)
	const result = await device.i2c.writeNoSTOP({ opaque, address, buffer })
	return checkWrite(device, buffer.byteLength, result, opaque + '::checkWrite')
}

export async function writeRepeatedSTART(device: MCP2221, address: I2CAddress, buffer: I2CBufferSource, opaque: string) {
	// console.log(opaque)
	const result = await device.i2c.writeRepeatedSTART({ opaque, address, buffer })
	return checkWrite(device, buffer.byteLength, result, opaque + '::checkWrite')
}

export async function write(device: MCP2221, address: I2CAddress, buffer: I2CBufferSource, opaque: string) {
	// console.log(opaque)
	const result = await device.i2c.writeData({ opaque, address, buffer })
	return checkWrite(device, buffer.byteLength, result, opaque + '::checkWrite')
}
