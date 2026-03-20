'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FORM_OPTIONS } from '@/lib/landing/constants'

// Zod schema for form validation
const contactFormSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    workEmail: z.string().email('Please enter a valid work email address'),
    hearAboutUs: z.string().min(1, 'Please select how you heard about us'),
    otherSource: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hearAboutUs === 'Other') {
        return data.otherSource && data.otherSource.length >= 2
      }
      return true
    },
    {
      message: 'Please specify how you heard about us',
      path: ['otherSource'],
    }
  )

type ContactFormValues = z.infer<typeof contactFormSchema>

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      workEmail: '',
      hearAboutUs: '',
      otherSource: '',
    },
  })

  const watchHearAboutUs = useWatch({
    control: form.control,
    name: 'hearAboutUs',
  })

  const onSubmit = async (data: ContactFormValues) => {
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast.success('Thank you for your interest!', {
      description: "We'll be in touch soon to schedule your demo.",
    })

    setSubmitted(true)
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative z-[101] space-y-4 w-full max-w-md text-left bg-background p-6 rounded-lg shadow-sm border"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your full name"
                  autoComplete="name"
                  className="bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                  className="bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hearAboutUs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about us?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {FORM_OPTIONS.HEAR_ABOUT_US.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchHearAboutUs === 'Other' && (
          <FormField
            control={form.control}
            name="otherSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please specify</FormLabel>
                <FormControl>
                  <Input
                    placeholder="How did you hear about us?"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="submit"
            variant="cta"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          {submitted && <Check className="h-5 w-5 text-green-500" />}
        </div>
      </form>
    </Form>
  )
}
