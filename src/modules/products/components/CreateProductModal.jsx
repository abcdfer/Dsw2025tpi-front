import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../shared/components/Modal';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import { createProduct } from '../services/create';
import { frontendErrorMessage } from '../../shared/helpers/backendError';

const DEFAULT_FORM_VALUES = {
  sku: '',
  cui: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
};

function CreateProductModal({ isOpen, onClose, onProductCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBackendMessage, setErrorBackendMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      reset(DEFAULT_FORM_VALUES);
      setErrorBackendMessage('');
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    reset(DEFAULT_FORM_VALUES);
    setErrorBackendMessage('');
    onClose();
  };

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setErrorBackendMessage('');

      const createdProduct = await createProduct(formData);

      if (onProductCreated) {
        onProductCreated(createdProduct);
      }

      handleClose();
    } catch (error) {
      console.error('Error al crear producto:', error);
      const data = error.response?.data;
      const errorMsg = data?.error || data?.message || data?.Message || frontendErrorMessage[data?.code];

      if (errorMsg) {
        setErrorBackendMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      } else {
        setErrorBackendMessage('Error al crear el producto. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth='max-w-xl'>
      <div className='mb-4 border-b pb-3'>
        <h2 className='text-2xl font-bold text-gray-800'>Crear Producto</h2>
        <p className='text-xs text-gray-500 mt-1'>
          Complete los datos para registrar un nuevo producto en el sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Input
            label='SKU'
            error={errors.sku?.message}
            {...register('sku', {
              required: 'SKU es requerido',
            })}
          />

          <Input
            label='Código Único'
            error={errors.cui?.message}
            {...register('cui', {
              required: 'Código Único es requerido',
            })}
          />
        </div>

        <Input
          label='Nombre'
          error={errors.name?.message}
          {...register('name', {
            required: 'Nombre es requerido',
          })}
        />

        <Input
          label='Descripción'
          error={errors.description?.message}
          {...register('description')}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Input
            label='Precio'
            error={errors.price?.message}
            type='number'
            step='any'
            {...register('price', {
              required: 'El precio es requerido',
              validate: (value) => Number(value) > 0 || 'El precio debe ser mayor a 0',
            })}
          />

          <Input
            label='Stock'
            error={errors.stock?.message}
            type='number'
            {...register('stock', {
              min: {
                value: 0,
                message: 'No puede tener stock negativo',
              },
            })}
          />
        </div>

        {errorBackendMessage && (
          <div className='p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm'>
            {errorBackendMessage}
          </div>
        )}

        <div className='flex justify-end gap-3 mt-4 pt-3 border-t'>
          <Button
            type='button'
            variant='secondary'
            onClick={handleClose}
            disabled={isSubmitting}
            className='px-4 py-2 rounded-lg'
          >
            Cancelar
          </Button>

          <Button
            type='submit'
            disabled={isSubmitting}
            className='px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg'
          >
            {isSubmitting ? 'Creando...' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProductModal;
