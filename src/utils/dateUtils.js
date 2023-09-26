export function calculateDateRange() {
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAhead = new Date(currentDate);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
  
    return {
      currentDate,
      oneWeekAgo,
      oneWeekAhead,
    };
  }
  