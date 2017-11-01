class ExtendableError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else { 
      this.stack = (new Error(message)).stack
    }
  }
} 

class SchemaIsNotDefinedError extends ExtendableError {
  constructor (name) {
    super(`Schema "${name}" is not defined!`)
  }
}

class WrongRefTypeError extends ExtendableError {
  constructor (refValue) {
    super(`Expected "$ref" to be string, get ${typeof refValue} type`)
  }
}

class WrongFormatterError extends ExtendableError {
  constructor (formatter) {
    super(`Expected formatter to be function or object, get ${typeof formatter} type`)
  }
}

class AttributeNotFoundError extends ExtendableError {
  constructor (attribute) {
    super(`Attribute "${attribute}" required in strict mode`)
  }
}

class WrongTypeError extends ExtendableError {
  constructor (name, type, data) {
    super(`Expected "${name}" to be ${type}, get ${typeof data} type`)
  }
}

exports.SchemaIsNotDefinedError = SchemaIsNotDefinedError
exports.WrongRefTypeError = WrongRefTypeError
exports.WrongFormatterError = WrongFormatterError
exports.AttributeNotFoundError = AttributeNotFoundError
exports.WrongTypeError = WrongTypeError
