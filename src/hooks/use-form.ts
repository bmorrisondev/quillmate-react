import { useState, useCallback } from 'react'
import { z } from 'zod'

interface ValidationError {
  path: string[]
  message: string
}

interface UseFormProps<T> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void>
}

export function useForm<T>({ schema, onSubmit }: UseFormProps<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = useCallback((data: unknown) => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const formattedErrors: Record<string, string> = {}
      result.error.errors.forEach((error) => {
        const path = error.path.join('.')
        formattedErrors[path] = error.message
      })
      setErrors(formattedErrors)
      return false
    }
    setErrors({})
    return true
  }, [schema])

  const handleSubmit = useCallback(async (data: unknown) => {
    setIsSubmitting(true)
    try {
      if (!validate(data)) return
      const validData = schema.parse(data)
      await onSubmit(validData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {}
        err.errors.forEach((error) => {
          const path = error.path.join('.')
          formattedErrors[path] = error.message
        })
        setErrors(formattedErrors)
      } else if (err instanceof Error) {
        setErrors({ submit: err.message })
      } else {
        setErrors({ submit: 'An unknown error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [schema, onSubmit, validate])

  return {
    errors,
    isSubmitting,
    handleSubmit,
    validate
  }
}
