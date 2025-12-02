/**
 * Formatea un precio en pesos mexicanos
 * @param {number} price - El precio a formatear
 * @returns {string} - El precio formateado
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

/**
 * Formatea un número como porcentaje
 * @param {number} value - El valor a formatear
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} - El porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Formatea una fecha
 * @param {Date|string} date - La fecha a formatear
 * @param {object} options - Opciones de formato
 * @returns {string} - La fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('es-MX', defaultOptions).format(dateObj);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - El número a formatear
 * @returns {string} - El número formateado
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('es-MX').format(number);
};