import { Filters } from '../types/sequelize-custom-types';

export const getFiltersAndSearch = (filterArray: Filters[]) => {
  let filters = [] as any;
  let search = null as any;
  filterArray.forEach((filter) => {
    if(filter.value){
      if (filter.type === 'range' && filter.parent && filter.parentOperator) {
        const foundFilterItemIndex = filters.findIndex((item: any) => {
          let parentPropertyKey;
          let parentOperatorKey;
          if (item && filter.parent) {
            parentPropertyKey = Object.keys(item).toString();
            parentOperatorKey = Object.keys(item[filter.parent] || {}).toString();
          }
          return parentPropertyKey === filter.parent && parentOperatorKey === filter.parentOperator;
        });
        if (foundFilterItemIndex >= 0 && filter.parent) {
          filters = filters.map((item: any) => {
            let parentPropertyKey = Object.keys(item).toString();
  
            let parentOperatorKey = Object.keys(item[filter.parent as string] || {}).toString();
  
            if (parentPropertyKey && parentOperatorKey) {
              if (
                parentPropertyKey === filter.parent &&
                parentOperatorKey === (filter.parentOperator  as string)
              ) {
                item = {
                  [parentPropertyKey]: {
                    [parentOperatorKey]: {
                      ...item[filter.parent][filter.parentOperator as string],
                      [filter.operator]: +filter.value,
                    },
                  },
                };
                console.log(item)
                return item;
              }
            }
            return item;
          });
        } else {
          filters.push({
            [filter.parent]: {
              [filter.parentOperator]: {
                [filter.operator]: filter.value,
              },
            },
          });
        }
      } else if (filter.type === 'search' && filter.parentOperator) {
        if (search) {
          search[filter.parentOperator].push({
            [filter.property]: {
              [filter.operator]: `%${filter.value}%`,
            },
          });
        } else {
          search = {
            [filter.parentOperator]: [
              {
                [filter.property]: {
                  [filter.operator]: `%${filter.value}%`,
                },
              },
            ],
          };
        }
      } else if (filter.type === 'normal') {
        filters.push({
          [filter.property]: {
            [filter.operator]: filter.value,
          },
        });
      }
    }
  });
  return { filters, search };
};
