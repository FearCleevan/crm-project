// src/utils/validation.js
export const validateForeignKey = async (pool, table, column, value) => {
  if (!value) return true; // Allow null/empty values
  
  const [result] = await pool.query(
    `SELECT ${column} FROM ${table} WHERE ${column} = ?`,
    [value]
  );
  return result.length > 0;
};

export const getValidValues = async (pool, table, column) => {
  const [result] = await pool.query(`SELECT ${column} FROM ${table}`);
  return result.map(item => item[column]);
};