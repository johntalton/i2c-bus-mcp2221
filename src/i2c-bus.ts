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
    await this.device.i2c.writeData({ opaque, address, buffer: Uint8Array.from([ byteValue ]) })
  }

  /**
   * i2c_smbus_read_i2c_block_data
   * S Addr Wr [A] Comm [A]
           S Addr Rd [A] [Data] A [Data] A ... A [Data] NA P
   */
  async readI2cBlock(address: number, cmd: number, length: number, bufferSource: I2CBufferSource): Promise<I2CReadResult> {
    const opaque = ''
    const { status } = await this.device.i2c.writeNoSTOP({ opaque, address, buffer: Uint8Array.from([ cmd ]) }) // [cmd]
    if(status !== 'success') { throw new Error('write failed: ' + status) }

    const result = await this.device.i2c.readData({ opaque, address, length }) // length
    console.log('readData', { result })
    if(result.status !== 'success') { throw new Error('not successfull readData') }

    const dv = ArrayBuffer.isView(bufferSource) ?
      new DataView(bufferSource.buffer, bufferSource.byteOffset, bufferSource.byteLength) :
      new DataView(bufferSource)

    const someByte = dv.getUint8(0)
    console.log({ someByte })

    return {
      bytesRead: -1,
      buffer: dv.buffer
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

    const buffer = Uint8Array.from([ cmd, ...userData ])
    const { status } = await this.device.i2c.writeData({ opaque, address, buffer })
    if(status !== 'success') { throw new Error('write failed') }

    return {
      bytesWritten: length,
      buffer
    }
  }

  async i2cRead(address: number, length: number, _bufferSource: I2CBufferSource): Promise<I2CReadResult> {
    const opaque = ''
    const res = await this.device.i2c.readData({ opaque, address, length })
    console.log({ res })
    return {
      bytesRead: -1,
      buffer: new ArrayBuffer(0)
    }
  }

  async i2cWrite(address: number, _length: number, bufferSource: I2CBufferSource): Promise<I2CWriteResult> {
    const opaque = ''
    const res = await this.device.i2c.writeData({ opaque, address, buffer: bufferSource })
    console.log({ res })
    return {
      bytesWritten: -1,
      buffer: new ArrayBuffer(0)
    }
  }
}
