import { Card, Dropdown, Button, TextInput, Label, Spinner } from 'flowbite-react'

Card.defaultProps = {
  ...Dropdown.defaultProps,
  theme: {
    root: {
      base: 'bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-white dark:border-gray-700 rounded-2xl shadow-2xl overflow-y-auto'
    }
  }
}

Dropdown.defaultProps = {
  ...Dropdown.defaultProps,
  theme: {
    floating: {
      target: '',
      base: 'z-[100] w-fit divide-y divide-gray-100 rounded-lg shadow-lg focus:outline-none overflow-hidden',
      style: {
        auto: 'bg-white/80 dark:bg-gray-900/50 backdrop-blur border border-white dark:border-gray-700',
      }
    }
  }
}

Button.defaultProps = {
  ...Button.defaultProps,
  theme: {
    size: {
      lg: 'text-base px-5 h-[40px] font-[400]',
      md: 'text-[15px] px-3 h-[34px]',
      sm: 'text-sm px-2 py-1',
      xs: 'text-xs px-2 py-0.5',
    },
    color: {
      purple: 'text-white bg-gradient-to-r from-[#2A2CBF] via-primary to-[#AA68FF] border-0 border-transparent enabled:hover: focus:!ring-0 dark:from-dark dark:to-[#00AAFF] dark:enabled:hover:bg-purple-700',
      light: 'text-gray-900 bg-white border border-gray-300 enabled:hover:bg-gray-100 focus:!ring-0 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:hover:text-gray-200 dark:enabled:hover:bg-gray-800/60'
    },
    disabled: 'cursor-not-allowed opacity-60',
  }
}

Button.Group.defaultProps = {
  ...Button.Group.defaultProps,
  theme: {
    base: 'inline-flex w-full bg-primary-100/50 backdrop-blur dark:bg-dark-800/50 rounded-xl'
  }
}

TextInput.defaultProps = {
  ...TextInput.defaultProps,
  theme: {
    field: {
      input: {
        colors: {
          gray: 'bg-white border-primary-200 text-primary-700 font-medium focus:border-cyan-500 focus:!ring-0 dark:text-white dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-400 dark:hover:bg-gray-800/60 dark:focus:bg-gray-800/60 dark:focus:border-gray-500'
        }
      }
    }
  }
}

Label.defaultProps = {
  ...Label.defaultProps,
  theme: {
    root: {
      base: 'text-xs text-primary-400 dark:text-gray-400'
    }
  }
}

Spinner.defaultProps = {
  ...Spinner.defaultProps,
  theme: {
    color: {
      info: 'fill-cyan-600 dark:fill-gray-200'
    }
  }
}
