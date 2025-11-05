import { pool } from '../../server.js';
import tables from '../utils/tables.js';

const SCHEMA = process.env.SCHEMA;

async function SELECT(table, queryParams, orderBy = "") {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        let query = `SELECT * FROM "${SCHEMA}".${table}`;
        let values = [];

        if (queryParams) {
            const keys = Object.keys(queryParams);
            values = Object.values(queryParams);
            const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
        }

        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }

        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        console.error({ error: error.message });
        return [];
    }
};

async function INSERT(table, queryParams) {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        const keys = Object.keys(queryParams);
        const values = Object.values(queryParams);
        const columns = keys.join(', ');
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

        const query = `INSERT INTO "${SCHEMA}".${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error({ error: error.message });
        return [];
    }
};

async function UPDATE(table, queryParams, condition) {
  try {
    if (!tables[table]) throw new Error(`Table ${table} does not exist`);

    const keys = Object.keys(queryParams);
    const values = Object.values(queryParams);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const conditionKeys = Object.keys(condition);
    const conditionValues = Object.values(condition);
    const conditionClause = conditionKeys
      .map((key, index) => `${key} = $${keys.length + index + 1}`)
      .join(' AND ');

    const query = `UPDATE "${SCHEMA}".${table} SET ${setClause} WHERE ${conditionClause} RETURNING *`;
    const result = await pool.query(query, [...values, ...conditionValues]);

    if (!result.rows || result.rows.length === 0) {
      return { success: false, message: "Nenhuma linha foi atualizada" };
    }

    return { success: true, row: result.rows[0] };
  } catch (error) {
    console.error("db.UPDATE erro:", error.message);
    return { success: false, error: error.message };
  }
}

async function DELETE(table, condition) {
    try {
        if (!tables[table]) throw new Error(`Table ${table} does not exist`);

        const keys = Object.keys(condition);
        const values = Object.values(condition);
        const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

        const query = `DELETE FROM "${SCHEMA}".${table} WHERE ${conditions} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error({ error: error.message });
        return [];
    }
};

async function SELECT_IN(table, baseWhere, inField, inValues, columns = ["*"]) {
    if (!Array.isArray(inValues) || inValues.length === 0) return [];

    const whereKeys = Object.keys(baseWhere);
    const whereValues = Object.values(baseWhere);

    const whereClauseParts = whereKeys.map((key, i) => `${key} = $${i + 1}`);
    const inClauseStart = whereKeys.length + 1;

    const inClause = `${inField} IN (${inValues.map((_, i) => `$${inClauseStart + i}`).join(', ')})`;

    const query = `
        SELECT ${columns.join(', ')}
        FROM "${SCHEMA}".${table}
        WHERE ${[...whereClauseParts, inClause].join(' AND ')}
    `;

    const allValues = [...whereValues, ...inValues];
    const result = await pool.query(query, allValues);
    return result.rows;
};

export default { SELECT, INSERT, UPDATE, DELETE, SELECT_IN};