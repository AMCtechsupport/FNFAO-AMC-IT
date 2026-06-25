const NO_ROWS = "PGRST116";

export function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

const RELATIONS = {
  "Assigned Advocates": {
    Clients: { localKey: "client_id", foreignTable: "Clients", foreignKey: "client_id" },
  },
  Notes: {
    author: {
      table: "Advocates",
      localKey: "advocate_id",
      foreignKey: "advocate_id",
      columns: ["firstName", "lastName"],
    },
    editor: {
      table: "Advocates",
      localKey: "modified_by_advocate_id",
      foreignKey: "advocate_id",
      columns: ["firstName", "lastName"],
    },
    Files: {
      table: "Files",
      localKey: "file_id",
      foreignKey: "file_id",
      columns: ["fileName", "filePath"],
    },
  },
  "User Logs": {
    Advocates: {
      table: "Advocates",
      localKey: "advocate_id",
      foreignKey: "advocate_id",
      columns: ["firstName", "lastName"],
    },
  },
  Clients: {
    Childs: { aggregate: "count", localKey: "client_id", foreignKey: "client_id", foreignTable: "Childs" },
  },
};

export function quoteTable(name) {
  return quoteIdent(name);
}

export function parseSelectColumns(selectStr, table) {
  if (!selectStr || selectStr.trim() === "*") {
    return { columns: ["*"], embeds: [], aggregates: [] };
  }

  const embeds = [];
  const aggregates = [];
  const columns = [];

  const parts = selectStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    const aggMatch = part.match(/^(\w+)\(count\)$/);
    if (aggMatch) {
      aggregates.push({ name: aggMatch[1], type: "count" });
      continue;
    }

    const embedStar = part.match(/^(\w+)\(\*\)$/);
    if (embedStar) {
      embeds.push({ name: embedStar[1], columns: "*" });
      continue;
    }

    const embedHint = part.match(/^(\w+)(?:!([\w]+))?\(([^)]+)\)$/);
    if (embedHint) {
      embeds.push({
        name: embedHint[1],
        hint: embedHint[2] || null,
        columns: embedHint[3].split(",").map((c) => c.trim()),
      });
      continue;
    }

    columns.push(part);
  }

  return { columns, embeds, aggregates };
}

export function parseOrExpression(expr, paramStart, tableAlias = "t") {
  const params = [];
  let paramIndex = paramStart;
  const conditions = [];

  const chunks = splitOrExpression(expr);
  for (const chunk of chunks) {
    if (chunk.startsWith("and(") && chunk.endsWith(")")) {
      const inner = chunk.slice(4, -1);
      const andParts = splitOrExpression(inner);
      const andConds = [];
      for (const part of andParts) {
        const parsed = parseFilterPart(part, tableAlias, paramIndex);
        andConds.push(parsed.sql);
        params.push(...parsed.params);
        paramIndex += parsed.params.length;
      }
      conditions.push(`(${andConds.join(" AND ")})`);
      continue;
    }

    const parsed = parseFilterPart(chunk, tableAlias, paramIndex);
    conditions.push(parsed.sql);
    params.push(...parsed.params);
    paramIndex += parsed.params.length;
  }

  return { sql: conditions.join(" OR "), params, nextIndex: paramIndex };
}

function splitOrExpression(expr) {
  const parts = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseFilterPart(part, tableAlias, paramIndex) {
  const embedded = part.match(/^(\w+)\.(\w+)\.(ilike|eq|gte|lte|lt|gt)\.(.+)$/);
  if (embedded) {
    const [, embedTable, col, op, rawVal] = embedded;
    const colRef = `${quoteIdent(embedTable)}.${quoteIdent(col)}`;
    return buildCondition(colRef, op, rawVal, paramIndex);
  }

  const inMatch = part.match(/^(\w+)\.in\.\((.+)\)$/);
  if (inMatch) {
    const col = inMatch[1];
    const values = inMatch[2].split(",").map((v) => v.trim());
    const placeholders = values.map((_, i) => `$${paramIndex + i + 1}`);
    return {
      sql: `${tableAlias}.${quoteIdent(col)} IN (${placeholders.join(", ")})`,
      params: values.map((v) => coerceValue(v)),
    };
  }

  const match = part.match(/^(\w+)\.(ilike|eq|gte|lte|lt|gt)\.(.+)$/);
  if (match) {
    const [, col, op, rawVal] = match;
    const colRef = `${tableAlias}.${quoteIdent(col)}`;
    return buildCondition(colRef, op, rawVal, paramIndex);
  }

  throw new Error(`Unsupported filter expression: ${part}`);
}

function buildCondition(colRef, op, rawVal, paramIndex) {
  const val = coerceValue(rawVal);
  switch (op) {
    case "ilike":
      return { sql: `${colRef} ILIKE $${paramIndex + 1}`, params: [val] };
    case "eq":
      return { sql: `${colRef} = $${paramIndex + 1}`, params: [val] };
    case "gte":
      return { sql: `${colRef} >= $${paramIndex + 1}`, params: [val] };
    case "lte":
      return { sql: `${colRef} <= $${paramIndex + 1}`, params: [val] };
    case "lt":
      return { sql: `${colRef} < $${paramIndex + 1}`, params: [val] };
    case "gt":
      return { sql: `${colRef} > $${paramIndex + 1}`, params: [val] };
    default:
      throw new Error(`Unsupported operator: ${op}`);
  }
}

function coerceValue(raw) {
  if (raw.startsWith("%") || raw.includes("%")) return raw;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);
  return raw;
}

export function resolveEmbedConfig(table, embed) {
  const tableRelations = RELATIONS[table] || {};

  if (embed.name === "Clients" && tableRelations.Clients) {
    return { ...tableRelations.Clients, alias: "Clients" };
  }

  if (table === "Notes") {
    if (embed.hint === "Notes_advocate_id_fkey" || embed.name === "Advocates" && !embed.hint?.includes("modified")) {
      return { ...tableRelations.author, alias: embed.hint === "Notes_advocate_id_fkey" ? "author" : "Advocates" };
    }
    if (embed.hint === "fk_modified_by_advocate") {
      return { ...tableRelations.editor, alias: "editor" };
    }
    if (embed.name === "Files") {
      return { ...tableRelations.Files, alias: "Files" };
    }
  }

  if (table === "User Logs" && embed.name === "Advocates") {
    return { ...tableRelations.Advocates, alias: "Advocates" };
  }

  if (embed.name === "Clients" && tableRelations.Clients) {
    return { ...tableRelations.Clients, alias: "Clients" };
  }

  return null;
}

export { NO_ROWS };

export class QueryBuilder {
  constructor(table, executor) {
    this.table = table;
    this.executor = executor;
    this.action = "select";
    this.selectOptions = {};
    this.selectColumns = "*";
    this.filters = [];
    this.orderBy = null;
    this.rangeFrom = null;
    this.rangeTo = null;
    this.insertPayload = null;
    this.updatePayload = null;
    this.returnSingle = false;
    this.returnMaybeSingle = false;
  }

  select(columns = "*", options = {}) {
    if (this.action === "delete" || this.action === "update") {
      this.selectColumns = columns;
      this.selectOptions = options;
      return this;
    }
    this.action = "select";
    this.selectColumns = columns;
    this.selectOptions = options;
    return this;
  }

  insert(payload) {
    this.action = "insert";
    this.insertPayload = payload;
    return this;
  }

  update(payload) {
    this.action = "update";
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ type: "neq", column, value });
    return this;
  }

  is(column, value) {
    this.filters.push({ type: "is", column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: "in", column, values });
    return this;
  }

  ilike(column, value) {
    this.filters.push({ type: "ilike", column, value });
    return this;
  }

  gte(column, value) {
    this.filters.push({ type: "gte", column, value });
    return this;
  }

  lte(column, value) {
    this.filters.push({ type: "lte", column, value });
    return this;
  }

  lt(column, value) {
    this.filters.push({ type: "lt", column, value });
    return this;
  }

  or(expression) {
    this.filters.push({ type: "or", expression });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = { column, ascending };
    return this;
  }

  range(from, to) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single() {
    this.returnSingle = true;
    return this;
  }

  maybeSingle() {
    this.returnMaybeSingle = true;
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  serialize() {
    return {
      table: this.table,
      action: this.action,
      selectColumns: this.selectColumns,
      selectOptions: this.selectOptions,
      filters: this.filters,
      orderBy: this.orderBy,
      rangeFrom: this.rangeFrom,
      rangeTo: this.rangeTo,
      insertPayload: this.insertPayload,
      updatePayload: this.updatePayload,
      single: this.returnSingle,
      maybeSingle: this.returnMaybeSingle,
    };
  }

  static fromSerialized(payload, executor) {
    const qb = new QueryBuilder(payload.table, executor);
    const { single, maybeSingle, ...rest } = payload;
    Object.assign(qb, rest);
    qb.returnSingle = single ?? false;
    qb.returnMaybeSingle = maybeSingle ?? false;
    return qb;
  }

  async execute() {
    if (!this.executor) {
      throw new Error("Database executor is not configured");
    }
    return this.executor(this.serialize());
  }
}

export function createQueryClient(executor) {
  return {
    from(table) {
      return new QueryBuilder(table, executor);
    },
    channel(_name) {
      return {
        on(_event, _config, _callback) {
          return this;
        },
        subscribe() {
          return this;
        },
        unsubscribe() {},
      };
    },
  };
}
