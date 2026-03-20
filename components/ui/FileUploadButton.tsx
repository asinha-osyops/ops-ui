'use client'

import { InputHTMLAttributes } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LOADING, BUTTONS, FILE_ACCEPTANCE } from '@/lib/constants/ui-strings'

type EntityType = 'SOP' | 'Log'

interface FileUploadButtonProps {
  /** The entity type being uploaded */
  entityType: EntityType
  /** Whether upload is in progress */
  uploading: boolean
  /** Props to spread on the hidden file input */
  fileInputProps: InputHTMLAttributes<HTMLInputElement>
  /** Click handler for the upload button */
  onUploadClick: () => void
  /** Optional button className for styling */
  buttonClassName?: string
}

/**
 * Reusable file upload button component with hidden input, upload button, and file acceptance message.
 * Used by SOP and Log create pages.
 */
export function FileUploadButton({
  entityType,
  uploading,
  fileInputProps,
  onUploadClick,
  buttonClassName,
}: FileUploadButtonProps) {
  const acceptanceMessage =
    entityType === 'SOP' ? FILE_ACCEPTANCE.sop : FILE_ACCEPTANCE.log

  return (
    <div className="pt-2">
      <input {...fileInputProps} />
      <Button
        size="lg"
        className={buttonClassName}
        onClick={onUploadClick}
        disabled={uploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? LOADING.uploading : BUTTONS.upload(entityType)}
      </Button>
      <p className="text-sm text-muted-foreground mt-2">{acceptanceMessage}</p>
    </div>
  )
}
