import "server-only";
import { query } from "./db.js";
import {
  NO_ROWS,
  parseOrExpression,
  parseSelectColumns,
  quoteIdent,
  quoteTable,
  resolveEmbedConfig,
} from "./query-builder.js";

async function attachEmbeds(rows, table, embeds) {
  if (!embeds.length || !rows.length) return rows;

  return Promise.all(
    rows.map(async (row) => {
      const enriched = { ...row };
      for (const embed of embeds) {
        const config = resolveEmbedConfig(table, embed);
        if (!config) continue;

        if (config.aggregate === "count") {
          const countRes = await query(
            `SELECT COUNT(*)::int AS count FROM ${quoteTable(config.foreignTable)} WHERE ${quoteIdent(config.foreignKey)} = $1`,
            [row[config.localKey]],
          );
          enriched[embed.name] = [{ count: countRes.rows[0]?.count || 0 }];
          continue;
        }

        const fkValue = row[config.localKey];
        if (fkValue == null) {
          enriched[config.alias || embed.name] = null;
          continue;
        }

        const cols =
          embed.columns === "*"
            ? "*"
            : (config.columns || embed.columns).map(quoteIdent).join(", ");

        const foreignTable = config.foreignTable || config.table;
        const res = await query(
          `SELECT ${cols} FROM ${quoteTable(foreignTable)} WHERE ${quoteIdent(config.foreignKey)} = $1 LIMIT 1`,
          [fkValue],
        );

        const alias = config.alias || embed.name;
        enriched[alias] = res.rows[0] || null;
      }
      return enriched;
    }),
  );
}

export async function executeQuery(payload) {
  try {
    switch (payload.action) {
      case "select":
        return executeSelect(payload);
      case "insert":
        return executeInsert(payload);
      case "update":
        return executeUpdate(payload);
      case "delete":
        return executeDelete(payload);
      default:
        return { data: null, error: { message: `Unknown action: ${payload.action}` } };
    }
  } catch (err) {
    console.error("[db] Query error:", err);
    return { data: null, error: { message: err.message, code: err.code } };
  }
}

async function executeSelect(payload) {
  const table = payload.table;
  const tableAlias = "t";
  const parsed = parseSelectColumns(payload.selectColumns, table);
  const wantsCount = payload.selectOptions?.count === "exact";
  const headOnly = payload.selectOptions?.head === true;

  let paramIndex = 0;
  const params = [];
  const whereParts = [];

  for (const filter of payload.filters) {
    if (filter.type === "or") {
      const parsedOr = parseOrExpression(filter.expression, paramIndex, tableAlias, table);
      whereParts.push(`(${parsedOr.sql})`);
      params.push(...parsedOr.params);
      paramIndex = parsedOr.nextIndex;
      continue;
    }

    paramIndex++;
    const col = quoteIdent(filter.column);
    const tableRef = `${tableAlias}.${col}`;

    switch (filter.type) {
      case "eq":
        whereParts.push(`${tableRef} = $${paramIndex}`);
        params.push(filter.value);
        break;
      case "neq":
        whereParts.push(`${tableRef} <> $${paramIndex}`);
        params.push(filter.value);
        break;
      case "is":
        if (filter.value === null) whereParts.push(`${tableRef} IS NULL`);
        else {
          whereParts.push(`${tableRef} IS $${paramIndex}`);
          params.push(filter.value);
        }
        break;
      case "in":
        if (!filter.values?.length) {
          whereParts.push("FALSE");
          paramIndex--;
        } else {
          const placeholders = filter.values.map((_, i) => `$${paramIndex + i}`);
          whereParts.push(`${tableRef} IN (${placeholders.join(", ")})`);
          params.push(...filter.values);
          paramIndex += filter.values.length - 1;
        }
        break;
      case "ilike":
        whereParts.push(`${tableRef} ILIKE $${paramIndex}`);
        params.push(filter.value);
        break;
      case "gte":
        whereParts.push(`${tableRef} >= $${paramIndex}`);
        params.push(filter.value);
        break;
      case "lte":
        whereParts.push(`${tableRef} <= $${paramIndex}`);
        params.push(filter.value);
        break;
      case "lt":
        whereParts.push(`${tableRef} < $${paramIndex}`);
        params.push(filter.value);
        break;
      default:
        break;
    }
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  let count = null;

  if (wantsCount) {
    const countRes = await query(
      `SELECT COUNT(*)::int AS count FROM ${quoteTable(table)} ${tableAlias} ${whereSql}`,
      params,
    );
    count = countRes.rows[0]?.count ?? 0;
    if (headOnly) return { data: null, count, error: null };
  }

  if (headOnly) return { data: null, count: 0, error: null };

  const selectCols =
    parsed.columns[0] === "*"
      ? `${tableAlias}.*`
      : parsed.columns.map((c) => `${tableAlias}.${quoteIdent(c)}`).join(", ");

  let sql = `SELECT ${selectCols} FROM ${quoteTable(table)} ${tableAlias} ${whereSql}`;

  if (payload.orderBy?.column) {
    sql += ` ORDER BY ${tableAlias}.${quoteIdent(payload.orderBy.column)} ${payload.orderBy.ascending ? "ASC" : "DESC"}`;
  }

  const dataParams = [...params];
  if (payload.rangeFrom != null && payload.rangeTo != null) {
    sql += ` LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`;
    dataParams.push(payload.rangeTo - payload.rangeFrom + 1, payload.rangeFrom);
  } else if (payload.single || payload.maybeSingle) {
    sql += " LIMIT 1";
  }

  const result = await query(sql, dataParams);
  let rows = result.rows;

  if (parsed.embeds.length || parsed.aggregates.length) {
    rows = await attachEmbeds(rows, table, [...parsed.embeds, ...parsed.aggregates]);
  }

  if (payload.single) {
    if (!rows.length) {
      return { data: null, count, error: { message: "No rows found", code: NO_ROWS } };
    }
    return { data: rows[0], count, error: null };
  }

  if (payload.maybeSingle) {
    return { data: rows[0] ?? null, count, error: null };
  }

  return { data: rows, count, error: null };
}

async function executeInsert(payload) {
  const rows = Array.isArray(payload.insertPayload)
    ? payload.insertPayload
    : [payload.insertPayload];
  const inserted = [];

  for (const row of rows) {
    const cleanRow = Object.fromEntries(
      Object.entries(row).filter(([, value]) => value !== undefined),
    );
    const keys = Object.keys(cleanRow);
    const values = keys.map((k) => cleanRow[k]);
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${quoteTable(payload.table)} (${keys.map(quoteIdent).join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
    const result = await query(sql, values);
    inserted.push(result.rows[0]);
  }

  if (payload.selectColumns) {
    if (payload.single || !Array.isArray(payload.insertPayload)) {
      return { data: inserted[0], error: null };
    }
    return { data: inserted, error: null };
  }

  return {
    data: Array.isArray(payload.insertPayload) ? inserted : inserted[0],
    error: null,
  };
}

async function executeUpdate(payload) {
  const keys = Object.keys(payload.updatePayload || {});
  if (!keys.length) return { data: [], error: null };

  let paramIndex = 0;
  const setParts = [];
  const params = [];

  for (const key of keys) {
    paramIndex++;
    setParts.push(`${quoteIdent(key)} = $${paramIndex}`);
    params.push(payload.updatePayload[key]);
  }

  const whereParts = [];
  for (const filter of payload.filters) {
    paramIndex++;
    if (filter.type === "eq") {
      whereParts.push(`${quoteIdent(filter.column)} = $${paramIndex}`);
      params.push(filter.value);
    } else if (filter.type === "in") {
      const placeholders = filter.values.map((_, i) => `$${paramIndex + i}`);
      whereParts.push(`${quoteIdent(filter.column)} IN (${placeholders.join(", ")})`);
      params.push(...filter.values);
      paramIndex += filter.values.length - 1;
    }
  }

  const returning = payload.selectColumns ? " RETURNING *" : "";
  const sql = `UPDATE ${quoteTable(payload.table)} SET ${setParts.join(", ")} WHERE ${whereParts.join(" AND ")}${returning}`;
  const result = await query(sql, params);

  if (payload.single) {
    return { data: result.rows[0] ?? null, error: null };
  }
  return { data: result.rows, error: null };
}

async function executeDelete(payload) {
  let paramIndex = 0;
  const params = [];
  const whereParts = [];

  for (const filter of payload.filters) {
    paramIndex++;
    if (filter.type === "eq") {
      whereParts.push(`${quoteIdent(filter.column)} = $${paramIndex}`);
      params.push(filter.value);
    } else if (filter.type === "in") {
      const placeholders = filter.values.map((_, i) => `$${paramIndex + i}`);
      whereParts.push(`${quoteIdent(filter.column)} IN (${placeholders.join(", ")})`);
      params.push(...filter.values);
      paramIndex += filter.values.length - 1;
    }
  }

  const returning = payload.selectColumns ? " RETURNING *" : "";
  const sql = `DELETE FROM ${quoteTable(payload.table)} WHERE ${whereParts.join(" AND ")}${returning}`;
  const result = await query(sql, params);
  return { data: result.rows, error: null };
}
