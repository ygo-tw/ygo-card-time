import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseCalendarDataSchema } from './calendar-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseCalendarDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CalendarDataType = RemoveIndex<Type>;
