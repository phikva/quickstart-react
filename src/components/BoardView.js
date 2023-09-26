import React, { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

const BoardView = () => {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedBoardOwners, setSelectedBoardOwners] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isTabsOpen, setIsTabsOpen] = useState({
    pastWeek: false,
    thisWeek: false,
    upcomingWeeks: false,
    withoutDate: false,
  });

  useEffect(() => {
    // Fetch boards
    async function fetchBoards() {
      try {
        const boardsResponse = await monday.api(
          `query {
            boards {
              id
              name
            }
          }`
        );
        setBoards(boardsResponse.data.boards);
      } catch (error) {
        console.error("Error fetching boards:", error);
        setError("Error fetching data. Please try again.");
      }
    }

    // Fetch initial data
    fetchBoards();
  }, []);

  // Handle board selection change
  useEffect(() => {
    if (selectedBoardId) {
      // Fetch the owners of the selected board
      fetchSelectedBoardOwners(selectedBoardId);

      // Fetch tasks for the selected board
      fetchTasksForBoard(selectedBoardId);
    }
  }, [selectedBoardId]);

  // Fetch owners of the selected board
  async function fetchSelectedBoardOwners(boardId) {
    try {
      const boardResponse = await monday.api(
        `query {
          boards(ids: [${boardId}]) {
            owners {
              id
              name
            }
          }
        }`
      );

      if (boardResponse.data.boards.length === 1) {
        setSelectedBoardOwners(boardResponse.data.boards[0].owners);
      }
    } catch (error) {
      console.error("Error fetching board owners:", error);
      setError("Error fetching data. Please try again.");
    }
  }

  // Fetch tasks for the selected board
  async function fetchTasksForBoard(boardId) {
    try {
      const tasksResponse = await monday.api(
        `query {
          boards(ids: [${boardId}]) {
            items {
              id
              name
              column_values {
                title
                text
                value
              }
            }
          }
        }`
      );

      if (tasksResponse.data.boards.length === 1) {
        setTasks(tasksResponse.data.boards[0].items);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Error fetching data. Please try again.");
    }
  }

  // Filter tasks by date categories (past weeks, this week, upcoming weeks)
  function categorizeTasksByDate(tasks) {
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
      const isSubtask = task.column_values.some(
        (column) =>
          column.title === "Subitems" && column.text === "Yes" // Adjust this based on your column value
      );

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
        withoutDateTasks.push(task); // Task without a date
      }
    });

    return {
      pastWeekTasks,
      thisWeekTasks,
      upcomingWeekTasks,
      withoutDateTasks, // Add the category for tasks without a date
    };
  }

  // Function to toggle tab open/close state
  function toggleTab(tabName) {
    setIsTabsOpen((prevState) => ({
      ...prevState,
      [tabName]: !prevState[tabName],
    }));
  }

  return (
    <div className="board-view">
      <h1>Board View</h1>
      <div>
        <h2>Select a Board:</h2>
        <select
          onChange={(e) => setSelectedBoardId(e.target.value)}
          value={selectedBoardId || ""}
        >
          <option value="">Select a board</option>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h2>Board Owners:</h2>
        {error ? (
          <p>{error}</p>
        ) : selectedBoardOwners.length > 0 ? (
          <ul>
            {selectedBoardOwners.map((owner) => (
              <li key={owner.id}>{owner.name}</li>
            ))}
          </ul>
        ) : (
          <p>No owners found for the selected board.</p>
        )}
      </div>
      <div>
        <h2>Tasks:</h2>
        <div className="tab">
          <div className="tab-header" onClick={() => toggleTab("pastWeek")}>
            <h3>Past Week ({categorizeTasksByDate(tasks).pastWeekTasks.length})</h3>
            <span> {isTabsOpen.pastWeek ? "▼" : "►"}</span>
          </div>
          {isTabsOpen.pastWeek && (
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  {tasks.length > 0 &&
                    tasks[0].column_values.map((column) => (
                      <th key={column.title}>{column.title}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {categorizeTasksByDate(tasks).pastWeekTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.name}</td>
                    {task.column_values.map((column, index) => (
                      <td key={index}>{column.text}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="tab">
          <div className="tab-header" onClick={() => toggleTab("thisWeek")}>
            <h3>This Week ({categorizeTasksByDate(tasks).thisWeekTasks.length})</h3>
            <span> {isTabsOpen.thisWeek ? "▼" : "►"}</span>
          </div>
          {isTabsOpen.thisWeek && (
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  {tasks.length > 0 &&
                    tasks[0].column_values.map((column) => (
                      <th key={column.title}>{column.title}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {categorizeTasksByDate(tasks).thisWeekTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.name}</td>
                    {task.column_values.map((column, index) => (
                      <td key={index}>{column.text}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="tab">
          <div className="tab-header" onClick={() => toggleTab("upcomingWeeks")}>
            <h3>Upcoming Weeks ({categorizeTasksByDate(tasks).upcomingWeekTasks.length})</h3>
            <span> {isTabsOpen.upcomingWeeks ? "▼" : "►"}</span>
          </div>
          {isTabsOpen.upcomingWeeks && (
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  {tasks.length > 0 &&
                    tasks[0].column_values.map((column) => (
                      <th key={column.title}>{column.title}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {categorizeTasksByDate(tasks).upcomingWeekTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.name}</td>
                    {task.column_values.map((column, index) => (
                      <td key={index}>{column.text}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="tab">
          <div className="tab-header" onClick={() => toggleTab("withoutDate")}>
            <h3>Without a Date ({categorizeTasksByDate(tasks).withoutDateTasks.length})</h3>
           <span>{isTabsOpen.withoutDate ? "▼" : "►"} </span> 
          </div>
          {isTabsOpen.withoutDate && (
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  {tasks.length > 0 &&
                    tasks[0].column_values.map((column) => (
                      <th key={column.title}>{column.title}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {categorizeTasksByDate(tasks).withoutDateTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.name}</td>
                    {task.column_values.map((column, index) => (
                      <td key={index}>{column.text}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardView;
