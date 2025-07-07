import type * as ConjureIr from "conjure-api";

export function field(
  fieldName: string,
  type: ConjureIr.IType,
): ConjureIr.IFieldDefinition {
  return {
    fieldName,
    type,
  };
}

export function typeName(
  name: string,
  packageName: string,
): ConjureIr.ITypeName {
  return {
    name,
    package: packageName,
  };
}

export function primitive(
  primitive: ConjureIr.PrimitiveType,
): ConjureIr.IType_Primitive {
  return {
    type: "primitive",
    primitive,
  };
}

export function findObject(
  defs: ConjureIr.ITypeDefinition[],
  name: string,
  packageName: string,
): ConjureIr.ITypeDefinition_Object | undefined {
  return defs.find((def): def is ConjureIr.ITypeDefinition_Object => {
    if (def.type === "object") {
      return (
        def.object.typeName.name === name
        && def.object.typeName.package === packageName
      );
    }
    return false;
  });
}

export function requireObject(
  defs: ConjureIr.ITypeDefinition[],
  name: string,
  packageName: string,
): ConjureIr.ITypeDefinition_Object {
  const obj = findObject(defs, name, packageName);
  if (!obj) {
    throw new Error(`Could not find object ${packageName}.${name}`);
  }
  return obj;
}

export function findAlias(
  defs: ConjureIr.ITypeDefinition[],
  name: string,
  packageName: string,
): ConjureIr.ITypeDefinition_Alias | undefined {
  return defs.find((def): def is ConjureIr.ITypeDefinition_Alias => {
    if (def.type === "alias") {
      return (
        def.alias.typeName.name === name
        && def.alias.typeName.package === packageName
      );
    }
    return false;
  });
}

export function requireAlias(
  defs: ConjureIr.ITypeDefinition[],
  name: string,
  packageName: string,
): ConjureIr.ITypeDefinition_Alias {
  const alias = findAlias(defs, name, packageName);
  if (!alias) {
    throw new Error(`Could not find alias ${packageName}.${name}`);
  }
  return alias;
}

export function reference(
  name: string,
  packageName: string,
): ConjureIr.IType_Reference {
  return {
    type: "reference",

    reference: {
      name,
      package: packageName,
    },
  };
}

export function external(fqJavaName: string, fallback: ConjureIr.IType): ConjureIr.IType_External {
  return {
    type: "external",
    external: {
      externalReference: {
        name: fqJavaName.substring(fqJavaName.lastIndexOf(".") + 1),
        package: fqJavaName.substring(0, fqJavaName.lastIndexOf(".")),
      },
      fallback,
    },
  };
}

export function map(
  keyType: ConjureIr.IType,
  valueType: ConjureIr.IType,
): ConjureIr.IType_Map {
  return {
    type: "map",
    map: {
      keyType,
      valueType,
    },
  };
}
export function list(itemType: ConjureIr.IType): ConjureIr.IType_List {
  return {
    type: "list",
    list: {
      itemType,
    },
  };
}

export const stringType = primitive("STRING");
