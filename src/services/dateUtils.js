// services/dateUtils.js

// Функция для конвертации времени в UTC с учетом разницы между локальным временем и UTC
export function convertToUTC(timestamp) {
  const date = new Date(timestamp);

  const localTime = date.getTime();


  const utcTime = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );


  const timeDifference = utcTime - localTime;


  const newUtcDate = new Date(localTime + timeDifference);
  
  console.log(newUtcDate);
  return newUtcDate.toISOString(); // Преобразуем в ISO формат
}

// Функция для форматирования в строку вида HH:mm:ss YYYY-MM-DD
export function convertToUTCFormatted(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}г.`;
}