export type RemoveIndex<T> = {
  [P in keyof T as string extends P
    ? never
    : number extends P
      ? never
      : P]: T[P];
};
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ArrayItem<T> = T extends (infer U)[] ? U : never;
