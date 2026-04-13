'use client'

import { useState } from 'react'
import { CompanyDto } from '@/lib/api-client'
import { useAppContext } from '@/lib/app-context'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanySelectorProps {
  onCompanySelect?: (company: CompanyDto) => void
  className?: string
  popoverClassName?: string
}

export function CompanySelector({
  onCompanySelect,
  className = '',
  popoverClassName,
}: CompanySelectorProps) {
  const { selectedCompany, setSelectedCompany, companies, isLoadingCompanies } =
    useAppContext()
  const [open, setOpen] = useState(false)

  const handleCompanySelect = (company: CompanyDto) => {
    setSelectedCompany(company)
    setOpen(false)
    onCompanySelect?.(company)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full md:w-96 justify-between', className)}
        >
          <span className="truncate">
            {selectedCompany ? selectedCompany.name : 'Select a Company'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-full md:w-96 p-0', popoverClassName)}
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            {isLoadingCompanies ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                Loading companies...
              </div>
            ) : companies.length === 0 ? (
              <CommandEmpty>No Companies</CommandEmpty>
            ) : (
              <CommandGroup>
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.name}
                    onSelect={() => handleCompanySelect(company)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCompany?.id === company.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {company.address}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
