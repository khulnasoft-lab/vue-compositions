# useStorage
The `useStorage` composition is a reactive wrapper around localStorage and sessionStorage. 

## Example
```typescript
import { useStorage } from '@prefecthq/vue-compositions'

const { values: foo } = useStorage('local', 'foo') // type is `unknown`
const { values: bar } = useStorage<boolean>('local', 'bar') // type is `boolean`
const { values: bas } = useStorage('local', 'bas', false) // type 'boolean'
```
Two additional compositions are exported as a convenience for each type of storage. `useLocalStorage` and `useSessionStorage`. 
```typescript
import { useLocalStorage, useSessionStorage } from '@prefect/vue-compositions'

// this
const { values: foo } = useLocalStorage('foo')

// is the same as this
const { values: foo } = useStorage('local', 'foo')

// and this
const { values: foo } = useSessionStorage('foo')

// is the same as this
const { values: foo } = useStorage('session', 'foo')

```

## Arguments
| Name         | Type               | Default | Required
|--------------|--------------------|---------|-----------|
| type         | `local \| session` | None    | true
| key          | `string`           | None    | true
| defaultValue | `any`              | None    | false

## Returns
```typescript
type UseStorage<T> = {
  value: Ref<T>,
  initialValue: T,
  remove: () => void,
  set: (value: NonNullable<T>) => void,
}
```