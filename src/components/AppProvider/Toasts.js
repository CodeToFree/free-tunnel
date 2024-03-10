import React from 'react'
import classnames from 'classnames'
import { Toast, Button, Spinner } from 'flowbite-react'
import { HiCheck, HiX } from 'react-icons/hi'

const COLORS = {
  error: 'bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200',
  success: 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200',
  loading: 'bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200',
}

export default function Toasts ({ toasts }) {
  const now = Date.now()
  return (
    <div className='fixed z-20 top-20 right-5 grid gap-2'>
      {toasts.filter(t => t.expire > now).map((toast) => (
        <Toast key={toast.id} className='overflow-hidden shadow-lg'>
          <div className={classnames('inline-flex h-8 w-8 shrink-0 items-center self-start justify-center rounded-lg', COLORS[toast.type])}>
          {
            toast.type === 'loading'
              ? <Spinner size='sm' className='' />
              : toast.type === 'error' ? <HiX className='h-5 w-5' /> : <HiCheck className='h-5 w-5' />
          }
          </div>
          <div className='mx-3 text-sm font-normal flex-1 overflow-hidden max-h-20'>
            <div className='text-gray-900 font-medium'>{toast.content}</div>
            <div className='flex-start flex mt-1 gap-2'>
            {
              toast.buttons?.map((btn, index) => (
                <div key={`toast-btn-${index}`} className='w-auto'>
                  <Button size='xs' onClick={btn.onClick}>{btn.text}</Button>
                </div>
              ))
            }
            </div>
          </div>
          {
            toast.type !== 'loading' && <Toast.Toggle className='shrink-0' />
          }
        </Toast>
      ))}
    </div>
  )
}

export function useToast () {
  const [toasts, setToasts] = React.useState([])

  const removeToast = React.useCallback((id) => {
    setToasts(toasts => toasts.filter(toast => toast.id !== id))
  }, [])

  const addToast = React.useCallback(({ type = 'success', content, buttons, timeout = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    if (type !== 'loading') {
      setTimeout(() => removeToast(id), [timeout])
    }
    const now = Date.now()
    const expire = type === 'loading' ? Infinity : now + timeout
    setToasts(toasts => [...toasts.filter(t => t.expire > now), { id, expire, type, content, buttons }])
    return id
  }, [removeToast])

  return { toasts, addToast, removeToast }
}