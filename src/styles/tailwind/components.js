const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.375rem',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
};

const inputBase = {
  appearance: 'none',
  backgroundColor: '#fff',
  borderColor: 'rgb(209 213 219)',
  borderWidth: '1px',
  borderRadius: '0.375rem',
  paddingTop: '0.5rem',
  paddingRight: '0.75rem',
  paddingBottom: '0.5rem',
  paddingLeft: '0.75rem',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
};

const cardBase = {
  overflow: 'hidden',
  backgroundColor: '#fff',
  borderRadius: '0.5rem',
  borderWidth: '1px',
  borderColor: 'rgb(229 231 235)',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
};

export default {
  '.btn': {
    ...buttonBase,
  },
  '.btn-primary': {
    ...buttonBase,
    backgroundColor: 'rgb(59 130 246)',
    color: '#fff',
    '&:hover': {
      backgroundColor: 'rgb(37 99 235)',
    },
  },
  '.btn-secondary': {
    ...buttonBase,
    backgroundColor: 'rgb(229 231 235)',
    color: 'rgb(17 24 39)',
    '&:hover': {
      backgroundColor: 'rgb(209 213 219)',
    },
  },
  '.btn-outline': {
    ...buttonBase,
    backgroundColor: 'transparent',
    borderWidth: '1px',
    borderColor: 'rgb(209 213 219)',
    '&:hover': {
      backgroundColor: 'rgb(243 244 246)',
    },
  },
  '.input': {
    ...inputBase,
    '&:focus': {
      outline: 'none',
      ringColor: 'rgb(59 130 246)',
      ringWidth: '2px',
      borderColor: 'rgb(59 130 246)',
    },
  },
  '.card': {
    ...cardBase,
  },
};
