import { I2CBus, I2CReadResult, I2CWriteResult } from '@johntalton/and-other-delights'
import { MCP2221 } from '@johntalton/mcp2221'

export class I2CBusMCP2221<T> implements I2CBus {
  public readonly busNumber: number;
  private readonly device: MCP2221<T>

  // factory
  static async openPromisified<T>(device: MCP2221<T>) {
    return Promise.resolve(new I2CBusMCP2221(device))
  }

  constructor(device: MCP2221<T>) {
    this.busNumber = 0
    this.device = device
  }

  close(): void {
    // await this.device.i2c.close()
  }

  async sendByte(address: number, byte: number): Promise<void> {
    await this.device.i2c.writeData({})
  }

  async readI2cBlock(address: number, cmd: number, length: number, buffer: Buffer): Promise<I2CReadResult> {
    const { status } = await this.device.i2c.writeNoSTOP({}) // [cmd]
    const res = await this.device.i2c.readRepeatedSTART({}) // length
    return {

    }
  }

  async writeI2cBlock(address: number, cmd: number, length: number, buffer: Buffer): Promise<I2CWriteResult> {
    const { status } = await this.device.i2c.writeNoSTOP({}) // [cmd]
    const res = await this.device.i2c.writeRepeatedSTART({})
    return {

    }
  }

  async i2cRead(address: number, length: number, buffer: Buffer): Promise<I2CReadResult> {
    const res = await this.device.i2c.readGetData({})
    return {

    }
  }

  async i2cWrite(address: number, length: number, buffer: Buffer): Promise<I2CWriteResult> {
    const res = await this.device.i2c.writeData({})
    return {

    }
  }
}