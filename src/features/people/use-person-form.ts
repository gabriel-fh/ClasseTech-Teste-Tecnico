import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';

import { emptyPersonFormValues, personFormSchemaFor, type PersonFormValues } from './schema';

export type PersonFormApi = UseFormReturn<PersonFormValues>;
const resolver: Resolver<PersonFormValues> = (values, context, options) => {
  const schema = personFormSchemaFor(values.type);

  const schemaResolver = zodResolver(schema) as unknown as Resolver<PersonFormValues>;

  return schemaResolver(values, context, options);
};

export function usePersonForm(defaultValues?: PersonFormValues): PersonFormApi {
  return useForm<PersonFormValues>({
    mode: 'onTouched',
    defaultValues: defaultValues ?? emptyPersonFormValues('PF'),
    resolver,
  });
}
