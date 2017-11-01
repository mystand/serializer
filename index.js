const R = require('ramda')
const _ = require('lodash')

const {
  SchemaIsNotDefinedError,
  WrongRefTypeError,
  WrongFormatterError,
  AttributeNotFoundError,
  WrongTypeError
} = require('./errors')
const { arrayElementCount } = require('./utils')

class Serializer {
  constructor () {
    this.schemas = new Map([])
    this.stack = []
  }

  add (name, schema) {
    this.schemas.set(name, schema)

    this[name] = (data, options) => {
      const serializer = this.get(name)
      return serializer.serialize(data, options)
    }
  }

  remove (name) {
    return this.schemas.delete(name)
  }

  checkRecursion (name) {
    if (arrayElementCount(this.stack, name) > 1) {
      return false
    }
    return true
  }

  get (name) {
    const schema = this.schemas.get(name)
    this.stack.push(name)

    if (!this.checkRecursion(name)) {
      return {
        serialize: false
      }
    }

    if (!schema) {
      throw new SchemaIsNotDefinedError(name)
    }

    const serialize = (data, options = {}) => {
      if (!_.isObject(data)) {
        throw new WrongTypeError('data', 'object', data)
      }

      let serialized = {}
      let attributes = (schema.attributes) ? schema.attributes : Object.keys(data)

      if (!_.isObject(options)) {
        throw new WrongTypeError('options', 'object', options)
      }

      if (options.omit) {
        if (!Array.isArray(options.omit)) {
          throw new WrongTypeError('options.omit', 'array', options.omit)
        }

        attributes = attributes.filter(attribute => !options.omit.includes(attribute))
      }

      if (options.only) {
        if (!Array.isArray(options.only)) {
          throw new WrongTypeError('options.only', 'array', options.only)
        }

        attributes = options.only
      }

      if (schema.formatters) {
        for (let key of Object.keys(schema.formatters)) {
          if (attributes.includes(key)) {
            const formatter = schema.formatters[key]

            if (_.isFunction(formatter)) {
              serialized[key] = formatter(data)
            } else if (_.isObject(formatter)) {
              if (!_.isString(formatter['$ref'])) {
                throw new WrongRefTypeError(schema[key]['$ref'])
              }

              const fieldSerializer = this.get(formatter['$ref'])

              if (!fieldSerializer.serialize) {
                continue
              }

              if (Array.isArray(data[key])) {
                serialized[key] = data[key].map(el => fieldSerializer.serialize(el))
              } else {
                serialized[key] = fieldSerializer.serialize(data[key])
              }
            } else {
              throw new WrongFormatterError(schema[key])
            }
          }
        }
      }

      for (let key of attributes) {
        if (serialized[key] === undefined) {
          if (data[key]) {
            serialized[key] = data[key]
          } else {
            let strict = _.isBoolean(options.strict) ? options.strict : schema.strict

            if (strict) {
              throw new AttributeNotFoundError(key)
            }
          }
        }
      }

      this.stack.pop()
      return serialized
    }

    return {
      serialize
    }
  }
}

module.exports = Serializer
