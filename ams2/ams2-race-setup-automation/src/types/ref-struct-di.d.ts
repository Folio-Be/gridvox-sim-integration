declare module 'ref-struct-di' {
  import ref from 'ref-napi';

  type FieldDefinition = Record<string, string | ref.Type>;

  interface StructType extends ref.Type {
    new (): any;
  }

  function createStruct(refInstance: typeof ref): (fields: FieldDefinition) => StructType;

  export default createStruct;
}
