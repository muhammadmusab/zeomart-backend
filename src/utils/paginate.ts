export const getPaginated = (query: any) => {
  const page = query.page && !isNaN(+query.page) ? +query.page : 1;
  const limit = query.limit && !isNaN(+query.limit) ? +query.limit : 10;
  const offset = limit * (page - 1);
  return { limit, offset ,page};
};
