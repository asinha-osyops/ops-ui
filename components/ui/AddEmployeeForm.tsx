'use client'

import {
  apiClient,
  CreateEmployeeRequestDto,
  EmployeeDto,
} from '@/lib/api-client'
import { Button } from './button'
import { useAppContext } from '@/lib/app-context'
import { useRoles } from '@/lib/hooks/useRoles'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  employeeFormSchema,
  type EmployeeFormData,
} from '@/lib/schemas/employee'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'
import { Input } from './input'

interface AddEmployeeFormProps {
  companyId: string
  employees: EmployeeDto[]
  onEmployeeAdded: () => void
}

export function AddEmployeeForm({
  companyId,
  employees,
  onEmployeeAdded,
}: AddEmployeeFormProps) {
  const { refreshEmployees } = useAppContext()
  const { roles, loadingRoles } = useRoles(companyId)

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      roleId: null,
      managerId: null,
    },
  })

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const employeeData: CreateEmployeeRequestDto = {
        companyId,
        ...data,
      }

      await apiClient.createEmployee(employeeData)

      form.reset()
      toast.success('Employee created successfully!')

      // Refresh employee cache
      await refreshEmployees()

      onEmployeeAdded()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create employee'
      toast.error('Failed to create employee', {
        description: message,
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-card rounded-lg p-4 space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter employee name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="+1-555-123-4567" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter email address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Field */}
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role (Optional)</FormLabel>
                <Select
                  value={field.value || '__none__'}
                  onValueChange={(value) =>
                    field.onChange(value === '__none__' ? null : value)
                  }
                  disabled={loadingRoles}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">No Role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingRoles && (
                  <p className="text-xs text-muted-foreground">
                    Loading roles...
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Manager Field */}
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manager (Optional)</FormLabel>
                <Select
                  value={field.value || '__none__'}
                  onValueChange={(value) =>
                    field.onChange(value === '__none__' ? null : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No Manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[280px]">
                    <SelectItem value="__none__">No Manager</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                        {employee.roleTitle ? ` - ${employee.roleTitle}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="default"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Creating...' : 'Add Employee'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Clear
          </Button>
        </div>
      </form>
    </Form>
  )
}
