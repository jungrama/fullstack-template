import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'
export { default as AlertIcon } from './AlertIcon.vue'

export const alertVariants = cva(
  // Nuxt Icon wraps SVG in a <span>, so `has-[>svg]` never matches — use first-child
  // without data-slot (AlertTitle / AlertDescription set data-slot) to enable the icon column.
  'relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[0_1fr] has-[>:first-child:not([data-slot])]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>:first-child:not([data-slot])]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current [&>:first-child:not([data-slot])]:inline-flex [&>:first-child:not([data-slot])]:size-4 [&>:first-child:not([data-slot])]:shrink-0 [&>:first-child:not([data-slot])]:translate-y-0.5 [&>:first-child:not([data-slot])]:text-current [&>:first-child:not([data-slot])]:[&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        info: 'bg-blue-500/10 text-blue-900 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-100 dark:border-blue-400/20',
        success:
          'bg-green-500/10 text-green-900 border-green-500/20 dark:bg-green-400/10 dark:text-green-100 dark:border-green-400/20',
        warning:
          'bg-amber-500/10 text-amber-900 border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-100 dark:border-amber-400/20',
        error:
          'bg-destructive/10 border-destructive/30 text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 dark:bg-destructive/20',
        destructive:
          'bg-destructive/10 border-destructive/30 text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 dark:bg-destructive/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type AlertVariants = VariantProps<typeof alertVariants>
