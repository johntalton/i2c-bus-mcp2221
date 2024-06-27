import { I2CAddress, I2CBufferSource } from '@johntalton/and-other-delights'
import { MCP2221, Response } from '@johntalton/mcp2221'

import { delayMs } from './delay.js'

async function checkRead(device: MCP2221, expectedByteLength: number, result: Response, opaque: string) {
	// console.log(opaque, result.status, result.i2cStateName, expectedByteLength)
	if(result.status === 'success') {
		if(true) {
			// check for validation of read
			const status = await device.common.status({ opaque })

			if(status.i2c.transferredBytes !== expectedByteLength) {
				console.warn(opaque, 'transferred bytes not expected length', status.i2c.transferredBytes, status.i2c.requestedTransferLength, expectedByteLength)
			}

			// console.log(opaque + '::extra', {
			// 	length: expectedByteLength,
			// 	ack: status.i2c.ACKed,
			// 	ms: status.i2c.timeoutMs,
			// 	state: status.i2cStateName,
			// 	rtx: status.i2c.requestedTransferLength,
			// 	tx: status.i2c.transferredBytes,
			// 	count: status.i2c.dataBufferCounter
			// })
		}

		return
	}

	if(result.i2cStateName === undefined) {
		throw new Error('missing i2cStateName field in result')
	}

	if (result.i2cStateName === 'ADDRESS_NACK_STOP') {
		throw new Error('not acked')
	}

	const startReadStates = [
		'START',
	]

	if (!startReadStates.includes(result.i2cStateName)) {
		console.warn(opaque, 'not started', result.i2cStateName)
	}

	const status = await device.common.status({ opaque })

	if(status.i2cStateName === undefined) {
		throw new Error('missing i2cStateName field in status')
	}

	// console.log(opaque, status.i2c.timeoutMs, status.i2cStateName, expectedByteLength, status.i2c.requestedTransferLength, status.i2c.transferredBytes)

	const okReadStates = [
		'READ_DATA',
		'READ_DATA_',
		'READ_DATA_complete'
	]

	if(status.status !== 'success') {
		console.warn(opaque, 'read data status check error', status)
	}

	if(!okReadStates.includes(status.i2cStateName)) {
		console.warn(opaque, 'no data to read', status.i2cStateName)
	}

	throw new Error(`unknown i2c state ${status.i2cStateName}`)
}

async function getData(device: MCP2221, targetBuffer: I2CBufferSource|undefined, opaque: string) {
	//
	await delayMs(5)

	const { validData, buffer, readBackBytes } = await device.i2c.readGetData({ opaque }, targetBuffer)
	if (!validData) { throw new Error('data not valid') }

	return {
		bytesRead: readBackBytes,
		buffer
	}
}

export async function readRepeatedStart(device: MCP2221, address: I2CAddress, length: number, targetBuffer: I2CBufferSource|undefined = undefined, opaque: string) {
	// console.log(opaque)
	const result = await device.i2c.readRepeatedSTART({ opaque, address, length })
	await checkRead(device, length, result, opaque + '::checkRead')
	return getData(device, targetBuffer, opaque + '::getData')
}

export async function read(device: MCP2221, address: I2CAddress, length: number, targetBuffer: I2CBufferSource|undefined = undefined, opaque: string) {
	// console.log(opaque)
	const result = await device.i2c.readData({ opaque, address, length })
	await checkRead(device, length, result, opaque + '::checkRead')
	return getData(device, targetBuffer, opaque + '::getData')
}
