const Modal = ({ isOpen = true, onClose, children, maxWidth = 'max-w-md', className = '' }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
      <div className={`bg-white p-6 rounded-xl shadow-2xl w-full ${maxWidth} relative max-h-[90vh] overflow-y-auto ${className}`.trim()}>
        <button
          onClick={onClose}
          type='button'
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold transition focus:outline-none'
          aria-label='Cerrar modal'
        >
          &times;
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
