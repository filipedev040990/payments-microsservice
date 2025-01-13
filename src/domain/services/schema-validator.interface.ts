export interface SchemaValidatorInterface {
  validate: (input: any, schemaName: string) => void
}
