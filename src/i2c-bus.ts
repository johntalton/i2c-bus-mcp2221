/* eslint-disable fp/no-this */
/* eslint-disable fp/no-mutation */
/* eslint-disable immutable/no-this */
/* eslint-disable no-magic-numbers */
/* eslint-disable fp/no-unused-expression */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable immutable/no-mutation */
/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-class */
import { I2CBufferSource, I2CBus, I2CReadResult, I2CWriteResult } from '@johntalton/and-other-delights'
import { MCP2221 } from '@johntalton/mcp2221'

const delayMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


export type MCP2221Options = { opaquePrefix: string }
const DEFAULT_OPTIONS: MCP2221Options = {
	opaquePrefix: ''
}

export class I2CBusMCP2221 implements I2CBus {
	private readonly device: MCP2221
	private readonly options: MCP2221Options

	// factory
	static from(device: MCP2221, options: Partial<MCP2221Options>): I2CBus {
		return new I2CBusMCP2221(device, options)
	}

	constructor(device: MCP2221, options: Partial<MCP2221Options>) {
		this.device = device
		this.options = { ...DEFAULT_OPTIONS, ...options }
	}

	// eslint-disable-next-line class-methods-use-this
	get name(): string { return '' }

	// eslint-disable-next-line class-methods-use-this
	close(): void {
		// await this.device.i2c.close()
	}

	/**
	 * i2c_smbus_write_byte
	 * S Addr Wr [A] Data [A] P
	 */
	async sendByte(address: number, byteValue: number): Promise<void> {
		const opaque = this.options.opaquePrefix
		await this.device.i2c.writeData({ opaque, address, buffer: Uint8Array.from([byteValue]) })
	}

	/**
	 * i2c_smbus_read_i2c_block_data
	 * S Addr Wr [A] Comm [A]
					 S Addr Rd [A] [Data] A [Data] A ... A [Data] NA P
	 */
	async readI2cBlock(address: number, cmd: number, length: number, _bufferSource: I2CBufferSource): Promise<I2CReadResult> {
		const opaque = ''
		console.log('readI2cBlock ', address, cmd, length)
		const { status } = await this.device.i2c.writeData({ opaque, address, buffer: Uint8Array.from([ cmd ]) })
		if (status !== 'success') { throw new Error('write failed: ' + status) }
		const statis = await this.device.common.status({ opaque })
		console.log('readI2cblock - wriete command', statis)

		const result = await this.device.i2c.readData({ opaque, address, length }) // length
		console.log('readI2cblock - request read', { result })
		//if(result.status !== 'success') { throw new Error('not successfull readData') }
		const statis2 = await this.device.common.status({ opaque })
		console.log(statis2)

		await delayMs(100)

		const data = await this.device.i2c.readGetData({ opaque })
		console.log('readI2cBlock - get data', data)
		//if(data.status !== 'success') { throw new Error('not successfull readData') }

		const { buffer, readBackBytes, validData } = data

		if (!validData) {
			console.log('invalid data', validData)
			return {
				bytesRead: -1,
				buffer: Uint8Array.from([])
			}
		}

		return {
			bytesRead: readBackBytes,
			buffer
		}
	}

	/**
	 * i2c_smbus_write_i2c_block_data
	 * S Addr Wr [A] Comm [A] Data [A] Data [A] ... [A] Data [A] P
	 */
	async writeI2cBlock(address: number, cmd: number, length: number, bufferSource: I2CBufferSource): Promise<I2CWriteResult> {
		const opaque = ''

		const userData = ArrayBuffer.isView(bufferSource) ?
			new Uint8Array(bufferSource.buffer, bufferSource.byteOffset, bufferSource.byteLength) :
			new Uint8Array(bufferSource)

		const { status } = await this.device.i2c.writeData({ opaque, address, buffer: Uint8Array.from([ cmd ]) })
		if (status !== 'success') { throw new Error('write failed') }

		const { status: status2 } = await this.device.i2c.writeData({ opaque, address, buffer: Uint8Array.from([ ...userData ]) })
		if (status2 !== 'success') { throw new Error('write failed') }


		const foo = await this.device.common.status({ opaque })
		console.log(foo)

		return {
			bytesWritten: length,
			buffer: userData.buffer
		}
	}

	async i2cRead(address: number, length: number, _bufferSource: I2CBufferSource): Promise<I2CReadResult> {
		const opaque = ''
		const res = await this.device.i2c.readData({ opaque, address, length })
		console.log({ res })
		return {
			bytesRead: length,
			buffer: new ArrayBuffer(0)
		}
	}

	async i2cWrite(address: number, length: number, bufferSource: I2CBufferSource): Promise<I2CWriteResult> {
		const opaque = ''
		const res = await this.device.i2c.writeData({ opaque, address, buffer: bufferSource })

		const status = await this.device.common.status({ opaque })
		console.log({ res, status })

		return {
			bytesWritten: length,
			buffer: new ArrayBuffer(0)
		}
	}
}
