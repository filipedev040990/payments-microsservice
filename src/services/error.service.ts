export class MissingParamError extends Error {
  constructor (param: string) {
    super(`Missing param: ${param}`)
    this.name = 'MissingParamError'
  }
}

export class InvalidParamError extends Error {
  constructor (param: string) {
    super(`Invalid param: ${param}`)
    this.name = 'InvalidParamError'
  }
}

export class ProcessPaymentError extends Error {
  constructor () {
    super('Error processing payment')
    this.name = 'ProcessPaymentError'
  }
}
