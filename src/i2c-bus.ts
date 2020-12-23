import { I2CBus, I2CReadResult, I2CWriteResult } from '@johntalton/and-other-delights'
import { MCP2221 } from '@johntalton/mcp2221'

export class I2CBusMCP2221 implements I2CBus {
  public readonly busNumber: number;
  private readonly device: MCP2221

  // factory
  static async openPromisified(device: MCP2221) {
    return Promise.resolve(new I2CBusMCP2221(device))
  }

  constructor(device: MCP2221) {
    this.busNumber = 0
    this.device = device
  }

  close(): void {
    const opaque = ''
    // await this.device.i2c.close()
  }

  async sendByte(address: number, byte: number): Promise<void> {
    const opaque = ''
    await this.device.i2c.writeData({ opaque, address, buffer: Uint8Array.from([byte]) })
  }

  async readI2cBlock(address: number, cmd: number, length: number, buffer: Buffer): Promise<I2CReadResult> {
    const opaque = ''
    const { status } = await this.device.i2c.writeNoSTOP({ opaque, address, buffer: Uint8Array.from([cmd]) }) // [cmd]
    const res = await this.device.i2c.readRepeatedSTART({ opaque, address, length }) // length
    return {
      bytesRead: -1,
      buffer
    }
  }

  async writeI2cBlock(address: number, cmd: number, length: number, buffer: Buffer): Promise<I2CWriteResult> {
    const opaque = ''
    const { status } = await this.device.i2c.writeNoSTOP({ opaque, address, buffer: Uint8Array.from([cmd]) }) // [cmd]
    const res = await this.device.i2c.writeRepeatedSTART({ opaque, address, buffer })
    return {
      bytesWritten: -1,
      buffer
    }
  }

  async i2cRead(address: number, length: number, buffer: Buffer): Promise<I2CReadResult> {
    const opaque = ''
    const res = await this.device.i2c.readGetData({ opaque, address })
    return {
      bytesRead: -1,
      buffer
    }
  }

  async i2cWrite(address: number, length: number, buffer: Buffer): Promise<I2CWriteResult> {
    const opaque = ''
    const res = await this.device.i2c.writeData({ opaque, address, buffer })
    return {
      bytesWritten: -1,
      buffer
    }
  }
}