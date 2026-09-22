import { useState, useEffect } from 'react';
import Modal from '../../shared/components/Modal';
import Button from '../../shared/components/Button';
import { updateOrderStatus, ORDER_STATUSES, getOrderById } from '../services/listServices';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-800 border-blue-300',
  Shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  Delivered: 'bg-green-100 text-green-800 border-green-300',
  Cancelled: 'bg-red-100 text-red-800 border-red-300',
};

function EditOrderModal({ isOpen, onClose, order, onOrderUpdated }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
      setSelectedStatus(order.status || '');
      setErrorMessage('');

      // Si la orden no tiene los items cargados, obtenerlos por ID
      if (!order.orderItems || order.orderItems.length === 0) {
        setIsLoadingDetails(true);
        getOrderById(order.id)
          .then(({ data }) => {
            if (data) {
              setCurrentOrder((prev) => ({ ...prev, ...data }));

              if (data.status) {
                setSelectedStatus(data.status);
              }
            }
          })
          .catch((err) => {
            console.error('Error cargando detalles de la orden:', err);
          })
          .finally(() => {
            setIsLoadingDetails(false);
          });
      }
    }
  }, [order]);

  if (!isOpen || !currentOrder) {
    return null;
  }

  const isSameStatus = selectedStatus === currentOrder.status;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (isSameStatus) {
      setErrorMessage('Seleccione un estado diferente al actual para actualizar.');

      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const { data, error } = await updateOrderStatus(currentOrder.id, selectedStatus);

      if (error) {
        const errorData = error.response?.data;
        const msg = errorData?.message || errorData?.Message || errorData?.error || error.message || 'Error al actualizar el estado de la orden';

        setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));

        return;
      }

      const updated = data || { ...currentOrder, status: selectedStatus };

      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }

      onClose();
    } catch (err) {
      console.error('Error al modificar orden:', err);
      setErrorMessage(err.message || 'Error inesperado al modificar la orden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadgeClass = STATUS_COLORS[currentOrder.status] || 'bg-gray-100 text-gray-800 border-gray-300';
  const orderDate = currentOrder.createDate || currentOrder.date;
  const formattedDate = orderDate ? new Date(orderDate).toLocaleString() : 'Fecha no disponible';
  const items = currentOrder.orderItems || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth='max-w-2xl'>
      <div className='mb-4 border-b pb-3 flex flex-wrap justify-between items-center gap-2'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Modificar Orden</h2>
          <p className='text-xs text-gray-500 font-mono mt-1'>
            ID: <span className='text-gray-700'>{currentOrder.id}</span>
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
          {currentOrder.status}
        </span>
      </div>

      <div className='flex flex-col gap-4'>
        {/* Información General */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-sm'>
          <div>
            <span className='font-semibold text-gray-600 block'>Cliente ID:</span>
            <span className='font-mono text-xs text-gray-800 break-all'>{currentOrder.customerId || 'N/A'}</span>
          </div>

          <div>
            <span className='font-semibold text-gray-600 block'>Fecha:</span>
            <span className='text-gray-800'>{formattedDate}</span>
          </div>

          <div>
            <span className='font-semibold text-gray-600 block'>Dirección de Envío:</span>
            <span className='text-gray-800'>{currentOrder.shippingAddress || 'No especificada'}</span>
          </div>

          <div>
            <span className='font-semibold text-gray-600 block'>Dirección de Facturación:</span>
            <span className='text-gray-800'>{currentOrder.billingAddress || 'No especificada'}</span>
          </div>

          {currentOrder.notes && (
            <div className='col-span-1 sm:col-span-2'>
              <span className='font-semibold text-gray-600 block'>Notas:</span>
              <span className='text-gray-700 italic'>{currentOrder.notes}</span>
            </div>
          )}
        </div>

        {/* Desglose de Productos / Ítems */}
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-2'>Productos de la orden:</h3>

          {isLoadingDetails ? (
            <p className='text-xs text-gray-500 italic p-2 bg-gray-50 rounded'>Cargando detalles de ítems...</p>
          ) : items.length > 0 ? (
            <div className='border rounded-lg overflow-hidden'>
              <table className='w-full text-left text-xs'>
                <thead className='bg-gray-100 text-gray-700 uppercase'>
                  <tr>
                    <th className='p-2'>Producto</th>
                    <th className='p-2 text-center'>Cant.</th>
                    <th className='p-2 text-right'>Precio Unit.</th>
                    <th className='p-2 text-right'>Subtotal</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {items.map((item, idx) => (
                    <tr key={item.productId || idx} className='hover:bg-gray-50'>
                      <td className='p-2 font-mono text-[11px] text-gray-700 break-all'>
                        {item.productId}
                      </td>
                      <td className='p-2 text-center font-medium'>{item.quantity}</td>
                      <td className='p-2 text-right'>${Number(item.unitPrice || 0).toFixed(2)}</td>
                      <td className='p-2 text-right font-semibold text-purple-700'>
                        ${Number(item.subtotal || (item.quantity * item.unitPrice) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='text-xs text-gray-500 italic p-2 bg-gray-50 rounded'>Sin ítems detallados.</p>
          )}

          <div className='flex justify-end items-center gap-2 mt-2'>
            <span className='text-sm font-semibold text-gray-600'>Total:</span>
            <span className='text-lg font-bold text-purple-700'>
              ${Number(currentOrder.totalAmount ?? currentOrder.total ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Sección de Modificación de Estado */}
        <form onSubmit={handleUpdateStatus} className='border-t pt-3 flex flex-col gap-3'>
          <div>
            <label htmlFor='order-status-select' className='block text-sm font-semibold text-gray-700 mb-1'>
              Modificar Estado de la Orden
            </label>
            <div className='relative'>
              <select
                id='order-status-select'
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setErrorMessage('');
                }}
                className='w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-200 focus:outline-none'
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
            {isSameStatus && (
              <p className='text-xs text-gray-500 mt-1'>
                El estado seleccionado es el estado actual de la orden.
              </p>
            )}
          </div>

          {errorMessage && (
            <div className='p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm'>
              {errorMessage}
            </div>
          )}

          <div className='flex justify-end gap-3 mt-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={onClose}
              disabled={isSubmitting}
              className='px-4 py-2 rounded-lg'
            >
              Cerrar
            </Button>

            <Button
              type='submit'
              disabled={isSubmitting || isSameStatus}
              className={`px-5 py-2 rounded-lg text-white ${
                isSameStatus || isSubmitting
                  ? 'bg-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Estado'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default EditOrderModal;
