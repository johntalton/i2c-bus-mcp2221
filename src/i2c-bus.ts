import { I2CBufferSource, I2CScannableBus, I2CReadResult, I2CWriteResult, I2CBus } from '@johntalton/and-other-delights'
import { MCP2221 } from '@johntalton/mcp2221'

import { ready } from './utils/ready.js'
import { read, readRepeatedStart } from './utils/read.js'
import { write, writeNoSTOP } from './utils/write.js'

export type MCP2221Options = { opaquePrefix: string }
const DEFAULT_OPTIONS: MCP2221Options = {
	opaquePrefix: ''
}

export class I2CBusMCP2221 implements I2CScannableBus {
	private readonly device: MCP2221
	private readonly options: MCP2221Options

	// factory
	static from(device: MCP2221, options: Partial<MCP2221Options> = {}): I2CScannableBus {
		return new I2CBusMCP2221(device, options)
	}

	constructor(device: MCP2221, options: Partial<MCP2221Options> = {}) {
		this.device = device
		this.options = { ...DEFAULT_OPTIONS, ...options }
	}


	get name(): string { return 'I²C MCP2221' }

	close(): void {
		// await this.device.i2c.close()
	}

	async scan(): Promise<number[]> {
		function* range(start: number, end: number, step: number = 1): Generator<number, undefined, undefined> {
			yield start
			if (start >= end) return
			yield* range(start + step, end, step)
		}

		async function* _scan(bus: I2CBus): AsyncGenerator<number, undefined, undefined> {
			// console.log('_scan')
			for (const address of range(0x08, 0x77)) {
				// console.log('try', address)
				try {
					await bus.i2cRead(address, 1)
					// console.log('yield', address)
					yield address
				}
				catch {
					//
					// console.log('continue', address)
					continue
				}
			}
		}

		return Array.fromAsync(_scan(this))
	}

	async sendByte(address: number, byteValue: number): Promise<void> {
		const opaque = this.options.opaquePrefix + '::sendByte'
		await ready(this.device, opaque)
		return write(this.device, address,  Uint8Array.from([ byteValue ]), opaque + '::write')
			.then() // swallow return from call into void promise
	}

	async readI2cBlock(address: number, cmd: number, length: number, targetBuffer?: I2CBufferSource): Promise<I2CReadResult> {
		const opaque = this.options.opaquePrefix + '::readI2cBlock'
		// console.log(opaque, address, cmd)
		await ready(this.device, opaque + '::ready')
		const cmdBuffer = Array.isArray(cmd) ? Uint8Array.from(cmd) : Uint8Array.from([ cmd ])
		await writeNoSTOP(this.device, address, cmdBuffer, opaque + '::writeNoStop')
		// await ready(this.device, opaque + '::ready::interim')
		return readRepeatedStart(this.device, address, length, targetBuffer, opaque + '::readRepeatedStart')
	}

	async writeI2cBlock(address: number, cmd: number, length: number, bufferSource: I2CBufferSource): Promise<I2CWriteResult> {
		const opaque = this.options.opaquePrefix + '::writeI2cBlock'

		const userData = ArrayBuffer.isView(bufferSource) ?
			new Uint8Array(bufferSource.buffer, bufferSource.byteOffset, length) :
			new Uint8Array(bufferSource, 0, length)

		const cmdBuffer = Array.isArray(cmd) ? Uint8Array.from(cmd) : Uint8Array.from([ cmd ])
		const scratch = new Blob([ cmdBuffer, userData ])
		const futureBuffer = scratch.arrayBuffer()

		await ready(this.device, opaque + '::ready')
		const buffer = await futureBuffer
		await write(this.device, address, buffer, opaque + '::write')

		return {
			bytesWritten: length,
			buffer: userData
		}
	}

	async i2cRead(address: number, length: number, targetBuffer?: I2CBufferSource): Promise<I2CReadResult> {
		const opaque = this.options.opaquePrefix + '::i2cRead'
		await ready(this.device, opaque + '::ready')
		return read(this.device, address, length, targetBuffer, opaque + '::read')
	}

	async i2cWrite(address: number, length: number, bufferSource: I2CBufferSource): Promise<I2CWriteResult> {
		const opaque = this.options.opaquePrefix + '::i2cWrite'
		await ready(this.device, opaque + '::ready')
		await write(this.device, address, bufferSource, opaque + '::write')
		// console.log('i2cWrite', length)
		return {
			bytesWritten: length,
			buffer: new ArrayBuffer(0)
		}
	}
}
