import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface TableColumn {
  key: string
  header: string
  render?: (value: any, row: any, index?: number) => ReactNode
  className?: string
}

interface TableProps {
  columns: TableColumn[]
  data: any[]
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: any) => void
  rowClassName?: (row: any) => string
}

const Table = ({ columns, data, isLoading, emptyMessage = 'Tidak ada data', onRowClick, rowClassName }: TableProps) => {
  const filteredData = data.filter(row => row != null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cyan/20">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-sm font-semibold text-navy-light bg-navy/5',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => {
            const rowKey = row.id != null ? row.id : `row-${rowIndex}`
            return (
              <tr
                key={rowKey}
                className={cn(
                  'border-b border-cyan/10 transition-colors',
                  onRowClick ? 'hover:bg-cyan/5 cursor-pointer' : 'hover:bg-cyan/5',
                  rowClassName?.(row)
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowKey}-${column.key}`}
                    className={cn('px-4 py-3 text-sm text-navy', column.className)}
                  >
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
