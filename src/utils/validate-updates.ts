export const getValidUpdates = (updatesAllowed: any[], body: Record<string, any>) => {
    const updates = Object.keys(body);
    const validBody = {} as Record<string, any>;
    updates.forEach((update) => {
      const isValidUpdate = updatesAllowed.indexOf(update) > -1;
      if (isValidUpdate && body[update] != null) validBody[update] = body[update];
    });
  
    return validBody;
  };
  