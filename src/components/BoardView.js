import React, { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";

import { fetchData } from "../api/api";
import TaskTable from "./TaskTable";
import { calculateDateRange } from "../utils/dateUtils";
import { categorizeTasksByDate } from "../utils/taskUtils";

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
        const query = `query {
          boards {
            id
            name
          }
        }`;
        const boardsResponse = await fetchData(query);
        setBoards(boardsResponse.boards);
      } catch (error) {
        setError(error.message);
      }
    }

    // Fetch initial data
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoardId) {
      // Fetch the owners of the selected board
      fetchSelectedBoardOwners(selectedBoardId);

      // Fetch tasks for the selected board
      fetchTasksForBoard(selectedBoardId);
    }
  }, [selectedBoardId]);

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

  const dateRange = calculateDateRange();
  const categorizedTasks = categorizeTasksByDate(tasks, dateRange);

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
        <h2>People:</h2>
        {error ? (
          <p>{error}</p>
        ) : selectedBoardOwners.length > 0 ? (
          <ul>
            {selectedBoardOwners.map((owner) => (
              <li key={owner.id}>{owner.name}</li>
            ))}
          </ul>
        ) : (
          <p>No people found for the selected board.</p>
        )}
      </div>
      <div>
        <h2>Tasks:</h2>
        <TaskTable
          title="Past Week"
          tasks={categorizedTasks.pastWeekTasks}
          columns={tasks.length > 0 ? tasks[0].column_values : []}
          isTabOpen={isTabsOpen.pastWeek}
          toggleTab={() => toggleTab("pastWeek")}
        />
        <TaskTable
          title="This Week"
          tasks={categorizedTasks.thisWeekTasks}
          columns={tasks.length > 0 ? tasks[0].column_values : []}
          isTabOpen={isTabsOpen.thisWeek}
          toggleTab={() => toggleTab("thisWeek")}
        />
        <TaskTable
          title="Upcoming Weeks"
          tasks={categorizedTasks.upcomingWeekTasks}
          columns={tasks.length > 0 ? tasks[0].column_values : []}
          isTabOpen={isTabsOpen.upcomingWeeks}
          toggleTab={() => toggleTab("upcomingWeeks")}
        />
        <TaskTable
          title="Without a Date"
          tasks={categorizedTasks.withoutDateTasks}
          columns={tasks.length > 0 ? tasks[0].column_values : []}
          isTabOpen={isTabsOpen.withoutDate}
          toggleTab={() => toggleTab("withoutDate")}
        />
      </div>
    </div>
  );
};

export default BoardView;
