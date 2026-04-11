import { Modal } from './Modal'
import { VStack } from '../layout/VStack'
import { HStack } from '../layout/HStack'
import { Text } from '../typography/Text'
import { Button } from '../forms/Button'

interface AlertDialogProps {
  isOpen:          boolean
  onClose:         () => void
  onConfirm:       () => void
  title?:          string
  description?:    string
  confirmLabel?:   string
  confirmVariant?: 'danger' | 'primary'
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
}: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <VStack gap="gap-5">
        <VStack gap="gap-1.5">
          <Text className="font-semibold text-fg">{title}</Text>
          {description && (
            <Text as="p" className="text-sm text-muted">{description}</Text>
          )}
        </VStack>
        <HStack gap="gap-2" className="justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={() => { onConfirm(); onClose() }}
          >
            {confirmLabel}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  )
}
