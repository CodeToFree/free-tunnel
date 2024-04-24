import { Button } from 'flowbite-react'

export default function PaginationButtons ({ page, pages, total, onPageChange }) {
  return (
    <div className='mt-3 flex-1 flex justify-between items-center'>
      <Button
        rounded
        size='sm'
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <div className='text-sm text-gray-500'>Page {page+1}{total ? `/${pages}` : ''}</div>
      <Button
        rounded
        size='sm'
        disabled={page >= pages - 1}
        className='ml-3'
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
