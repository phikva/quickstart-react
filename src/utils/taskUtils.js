export function categorizeTasksByDate(tasks) {
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAhead = new Date(currentDate);
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);

    const pastWeekTasks = [];
    const thisWeekTasks = [];
    const upcomingWeekTasks = [];
    const withoutDateTasks = [];

    tasks.forEach((task) => {
      const deadlineColumn = task.column_values.find(
        (column) => column.title === "Deadline" && column.text
      );

      if (deadlineColumn) {
        const deadlineDate = new Date(deadlineColumn.text);

        if (deadlineDate < oneWeekAgo) {
          pastWeekTasks.push(task);
        } else if (deadlineDate >= oneWeekAgo && deadlineDate <= currentDate) {
          thisWeekTasks.push(task);
        } else if (deadlineDate > currentDate && deadlineDate <= oneWeekAhead) {
          upcomingWeekTasks.push(task);
        }
      } else {
        withoutDateTasks.push(task); 
      }
    });

    return {
      pastWeekTasks,
      thisWeekTasks,
      upcomingWeekTasks,
      withoutDateTasks, 
    };
  }
  