// функции форматирования данных
//@ts-nocheck

/**
 * Форматирование числа в строку с разделением между тысяч и ограниченим количества цифр после запятой
 *
 * @param {number} value
 * @param {number} decimalCount Количество знаков после запятой
 * @param {number|string} decimal
 * @param {string} thousands Разделитель тысячных частей
 * @return {string}
 */
const formatMoney = (value, decimalCount = 0, decimal = '', thousands = ' ') => {
  decimalCount = Math.abs(decimalCount);
  decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

  const negativeSign = value < 0 ? '-' : '';
  const i = parseInt(value = Math.abs(Number(value) || 0)
    .toFixed(decimalCount)).toString();
  const j = i.length > 3 ? i.length % 3 : 0;

  return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j)
    .replace(/(\d{3})(?=\d)/g, `$1${ thousands}`) + (decimalCount ? decimal + Math.abs(value - i)
    .toFixed(decimalCount)
    .slice(2) : '');
};

/**
 * Возвращается число форматированное до num знаков после запятой
 * При отсутствии данных возвращает 0
 * @param {string|number} value
 * @param {int} num
 * @return {string}
 */
const numberFormatter = (value, num = 2) => {
  const val = typeof value === 'number' ? value : parseFloat(value?.toString() || 0);
  if (isNaN(val)) {
    return 0;
  }

  return formatMoney(value, num, ',', ' ');
};

/**
 * Возвращает целое число
 * При отсуствии данных возвращает 0
 */
const intFormatter = value => numberFormatter(value, 0);

/**
 * Возвращается число форматированное до 2-х знаков после запятой
 * При отсутствии данных возвращает 0
 * @param {string|number} value
 * @return {string|number}
 */
const floatFormatter = value => numberFormatter(value, 2);

/**
 * Возвращает целое число с приставкой "шт"
 * @param {number|string} value
 * @return {string}
 */
const qtyFormatter = value => `${intFormatter(value) } шт`;

/**
 * Форматирование объекта Date в строку по формату
 * @param {Date} x
 * @param {String} y
 * @return {string}
 */
const date2str = (x, y) => {
  const z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds(),
  };
  y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
    return ((v.length > 1 ? '0' : '') + eval(`z.${ v.slice(-1)}`)).slice(-2);
  });

  return y.replace(/(y+)/g, function(v) {
    return x.getFullYear().toString().slice(-v.length);
  });
};

/**
 * Форматирование даты в строку формата dd.MM.yyyy
 * @param {string|number} value
 * @return {string}
 */
const dateFormatter = value => {
  if (typeof value !== 'string' && !(value instanceof String)) {
    value = value * 1000;
  }

  return date2str(new Date(value), 'dd.MM.yyyy');
};

/**
 * Форматирование даты в строку формата dd.MM.yyyy hh:mm
 * @param {string|number} value
 * @return {string}
 */
const dateTimeFormatter = value => {
  if (typeof value !== 'string' && !(value instanceof String)) {
    value = value * 1000;
  }

  return date2str(new Date(value), 'dd.MM.yyyy hh:mm');
};

/**
 * Возвращается число форматированное до num знаков после запятой
 * При отсутствии данных возвращает 0
 * @param {string|number} value
 * @param {int} num
 * @return {string}
 */
const moneyFormatter = (value, num = 2) => numberFormatter(value, num);

/**
 * Форматирование вещественного числа с 2-мя знаками после запятой с добавлением приставки с символом рубля
 * @param {string|number} value
 * @param {string} currency
 * @return {string}
 */
const moneyFormatterWithSign = (value, currency = 'BYN') => {
  value = floatFormatter(value);

  return value.toString().length > 0 ? `${value } ${currency}` : '';
};

/**
 * Форматирование целого числа с добавлением приставки с символом рубля
 * @param {string|number} value
 * @param {string} currency
 * @return {string}
 */
const moneyFormatterWithSignInteger = (value, currency = 'BYN') => {
  value = intFormatter(value);

  return value.toString().length > 0 ? `${value } ${currency}` : '';
};

/**
 * Форматирование целого числа с добавлением приставки с символом процента
 * @param {string|number} value
 * @return {string}
 */
const moneyFormatterWithPercent = value => {
  value = intFormatter(value);

  return value.toString().length > 0 ? `${value }%` : '';
};

/**
 * Форматирование вещественного числа с 2-мя знаками после запятой с добавлением приставки с символом процента
 * @param {string|number} value
 * @return {string}
 */
const moneyFloatFormatterWithPercent = value => `${floatFormatter(value) }%`;

export {
  numberFormatter, intFormatter, floatFormatter, formatMoney, qtyFormatter, date2str, moneyFormatter, moneyFormatterWithSign, moneyFormatterWithSignInteger, moneyFormatterWithPercent, moneyFloatFormatterWithPercent, dateFormatter, dateTimeFormatter,
};
