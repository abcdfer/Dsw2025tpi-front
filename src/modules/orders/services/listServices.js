import { instance } from '../../shared/api/axiosInstance';

export const listOrders = async (statusOrParams = null, pageNumber = null, pageSize = null, search = null) => {
  try {
    const params = new URLSearchParams();
    let status = null;
    let pNum = pageNumber;
    let pSize = pageSize;
    let searchVal = search;

    if (statusOrParams && typeof statusOrParams === 'object') {
      status = statusOrParams.status;
      pNum = statusOrParams.pageNumber ?? pNum;
      pSize = statusOrParams.pageSize ?? pSize;
      searchVal = statusOrParams.search ?? searchVal;
    } else {
      status = statusOrParams;
    }

    if (status && status !== 'all' && status !== 'null' && String(status).trim() !== '') {
      params.append('status', String(status).trim());
    }

    if (pNum != null) {
      params.append('pageNumber', pNum);
    }

    if (pSize != null) {
      params.append('pageSize', pSize);
    }

    if (searchVal && searchVal !== 'null' && String(searchVal).trim() !== '') {
      params.append('search', String(searchVal).trim());
    }

    const query = params.toString();
    const url = query ? `/api/orders?${query}` : '/api/orders';

    const response = await instance.get(url);

    return { data: response.data, error: null };
  } catch (error) {
    if (error.response && (error.response.status === 404 || error.response.status === 204)) {
      return { data: [], error: null };
    }

    console.error('Error al listar órdenes:', error);

    return { data: null, error };
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await instance.get(`/api/orders/${id}`);

    return { data: response.data, error: null };
  } catch (error) {
    if (error.response && (error.response.status === 404 || error.response.status === 400 || error.response.status === 204)) {
      return { data: null, error: null };
    }

    console.error('Error al obtener orden por ID:', error);

    return { data: null, error };
  }
};

export const ORDER_STATUSES = [
  { value: 'Pending', label: 'Pending (Pendiente)' },
  { value: 'Processing', label: 'Processing (En proceso)' },
  { value: 'Shipped', label: 'Shipped (Enviado)' },
  { value: 'Delivered', label: 'Delivered (Entregado)' },
  { value: 'Cancelled', label: 'Cancelled (Cancelado)' },
];

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await instance.put(`/api/orders/${id}/status`, { status });

    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);

    return { data: null, error };
  }
};