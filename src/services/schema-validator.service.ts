import { SchemaValidatorInterface } from '@/domain/services/schema-validator.interface'
import { join } from 'path'
import { readdirSync } from 'fs'
import { z } from 'zod'
import { InvalidParamError } from './error.service'
import { LoggerService } from './logger.service'

const logger = new LoggerService()

const schemaDirectory = join(__dirname, '../shared/schemas')

const loadSchemas = (): Record<string, z.ZodType<any, any, any>> => {
  const schemas: Record<string, z.ZodType<any, any, any>> = {}
  const files = readdirSync(schemaDirectory)

  for (const file of files) {
    if (file.endsWith('.schema.js')) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const schemaModule = require(join(schemaDirectory, file))
      const defaultExportName = Object.keys(schemaModule).find(key => key.endsWith('Schema'))
      if (defaultExportName && schemaModule[defaultExportName]) {
        schemas[defaultExportName] = schemaModule[defaultExportName]
      }
    }
  }

  return schemas
}

const schemaMap = loadSchemas()

export class SchemaValidator implements SchemaValidatorInterface {
  validate (input: any, schemaName: string): void {
    const schema = schemaMap[schemaName]

    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`)
    }

    try {
      schema.parse(input)
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      logger.error('Schema validation error', {
        schemaName: schemaName,
        input,
        error: handleError(error)
      })

      throw new InvalidParamError(handleError(error)[0].param)
    }
  }
}

const handleError = (error: any): any => {
  if (!error.issues) {
    return null
  }

  return error.issues.map((issue: any) => {
    return {
      code: issue.code,
      expected: issue.expected,
      received: issue.received,
      param: issue.path[0]
    }
  })
}
