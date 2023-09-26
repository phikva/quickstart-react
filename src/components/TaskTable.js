import React from "react";

const TaskTable = ({
  title,
  tasks,
  columns,
  isTabOpen,
  disabled,
  toggleTab,
}) => {
  return (
    <div className="tab">
      <div className="tab-header" onClick={toggleTab}>
        <h3>
          {title} ({tasks.length})<span>{isTabOpen ? "▼" : "►"}</span>
        </h3>
      </div>
      {isTabOpen && (
        <table>
          <thead>
            <tr>
              <th>Task Name</th>
              {columns.map((column) => (
                <th key={column.title}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
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
  );
};

export default TaskTable;
