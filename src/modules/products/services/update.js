import { instance } from '../../shared/api/axiosInstance';

export const updateProduct = async (id, formData) => {
  try {
    const payload = {
      sku: formData.sku,
      internalCode: formData.cui || formData.internalCode,
      name: formData.name,
      description: formData.description || '',
      currentUnitPrice: Number(formData.price ?? formData.currentUnitPrice),
      stockQuantity: Number(formData.stock ?? formData.stockQuantity),
    };

    const response = await instance.put(`/api/products/${id}`, payload);

    return response.data;
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw error;
  }
};
