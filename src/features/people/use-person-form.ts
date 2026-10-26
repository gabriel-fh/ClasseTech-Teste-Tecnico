import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';

import { emptyPersonFormValues, personFormSchemaFor, type PersonFormValues } from './schema';

export type PersonFormApi = UseFormReturn<PersonFormValues>;

/**
 * O schema é escolhido a cada validação pelo `type` que está no próprio formulário, porque
 * o wizard decide entre pessoa física e jurídica na primeira etapa. `z.object` descarta as
 * chaves do outro tipo, então os campos não usados ficam de fora sem gerar erro.
 */
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
