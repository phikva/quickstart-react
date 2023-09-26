import React, { useState } from "react";

const TaskTable = ({
  title,
  tasks,
  columns,
  isTabOpen,
  disabled,
  toggleTab,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskDropdown = (task) => {
    setSelectedTask(selectedTask === task ? null : task);
  };

  const renderSubitemsHeader = () => {
    return (
      <tr>
        <th>Subitem Name</th>
        {columns.map((column) => (
          <th key={column.title}>{column.title}</th>
        ))}
      </tr>
    );
  };

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
              <React.Fragment key={task.id}>
                <tr>
                  <td
                    onClick={() => handleTaskDropdown(task)}
                    style={{
                      cursor: task.subitems?.length ? "pointer" : "default",
                    }}
                  >
                    {task.name}
                    {task.subitems?.length > 0 && (selectedTask === task ? "▲" : "▼")}
                  </td>
                  {columns.map((column, index) => (
                    <td key={index}>
                      {task.column_values.find((col) => col.title === column.title)?.text}
                    </td>
                  ))}
                </tr>
                {selectedTask === task && task.subitems?.length > 0 && renderSubitemsHeader()}
                {selectedTask === task &&
                  task.subitems?.map((subitem) => (
                    <tr key={subitem.id} className="subitem">
                      <td>{subitem.name}</td>
                      {columns.map((column, index) => (
                        <td key={index}>
                          {subitem.column_values.find((col) => col.title === column.title)?.text}
                        </td>
                      ))}
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskTable;
