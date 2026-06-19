export type QueryResult<T = any> = {
  data: T;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

export declare class QueryBuilder<T = any> implements PromiseLike<QueryResult<T>> {
  select(columns?: string, options?: Record<string, unknown>): this;
  insert(payload: unknown): this;
  update(payload: Record<string, unknown>): this;
  delete(): this;
  eq(column: string, value: unknown): this;
  neq(column: string, value: unknown): this;
  is(column: string, value: unknown): this;
  in(column: string, values: unknown[]): this;
  ilike(column: string, value: string): this;
  gte(column: string, value: unknown): this;
  lte(column: string, value: unknown): this;
  lt(column: string, value: unknown): this;
  or(expression: string): this;
  order(column: string, options?: { ascending?: boolean }): this;
  range(from: number, to: number): this;
  single(): this;
  maybeSingle(): this;
  execute(): Promise<QueryResult<T>>;
  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;
}

export declare function createQueryClient(
  executor: (payload: unknown) => Promise<QueryResult>,
): {
  from(table: string): QueryBuilder;
  channel(name: string): {
    on: (...args: unknown[]) => unknown;
    subscribe: () => unknown;
    unsubscribe: () => void;
  };
};
