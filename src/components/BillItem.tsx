import { Card, CardBody, HStack, VStack, Heading, Caption, Badge } from './ui'
import { Formatters } from '../utils/formatters'
import type { BillGroup, BillStatus } from '../types'

export const BILL_STATUS: Record<BillStatus, { label: string; color: string }> = {
  paid:     { label: 'Paid',     color: '#10b981' },
  due_soon: { label: 'Due Soon', color: '#f59e0b' },
  overdue:  { label: 'Overdue',  color: '#ef4444' },
  upcoming: { label: 'Upcoming', color: '#6b7280' },
}

interface BillItemProps {
  bill: BillGroup
}

export function BillItem({ bill }: BillItemProps) {
  const { merchant, category, subcategory, lastPaidDate, estimatedNextDue, status } = bill
  const { label, color } = BILL_STATUS[status] ?? BILL_STATUS.upcoming

  return (
    <Card>
      <CardBody>
        <HStack className="justify-between items-start">
          <VStack gap="gap-1">
            <Heading level={4} className="text-sm font-medium">{merchant}</Heading>
            <Caption>{subcategory || category}</Caption>
          </VStack>
          <VStack gap="gap-1" className="items-end">
            <Badge color={color}>{label}</Badge>
            <Caption>Due: {Formatters.date(estimatedNextDue)}</Caption>
            <Caption>Last: {Formatters.date(lastPaidDate)}</Caption>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}
