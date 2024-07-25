export const getPaginated = (query: any) => {
  let page;
  let limit;
  let offset;

  if (query.page && query.limit) {
    page = +query?.page as number;
    limit = +query?.limit as number;
  } else {
    page = 1;
    limit = 10;
  }
  offset = limit * (page - 1);

  return { limit, offset };
};
