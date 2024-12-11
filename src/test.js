import React, { useState, useEffect } from "react";
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)
import { ReactTabulator } from "react-tabulator";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const editableColumns = [
  {
    title: "ID",
    field: "id",
    width: 100,
    hozAlign: "center",
    cssClass: "text-gray-800 font-medium",
  },
  {
    title: "Title",
    field: "title",
    width: 200,
    editor: "input",
    headerFilter: "input",
  },
  {
    title: "Status",
    field: "status",
    hozAlign: "center",
    cssClass: "text-green-600 font-bold w-[30px]", // Ensure this is non-empty
    editor: (cell, onRendered, success, cancel) => {
      // Create the select element
      const editor = document.createElement("select");
      const values = ["To Do", "In Progress", "Done"];

      // Populate the select options
      values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        if (value === cell.getValue()) {
          option.selected = true;
        }
        editor.appendChild(option);
      });

      // Style and position the editor
      editor.style.width = "100%"; // Ensure it spans the full width
      editor.style.boxSizing = "border-box";
      onRendered(() => {
        editor.focus();
        editor.style.position = "absolute"; // Ensure proper positioning
        editor.style.right = "0.1rem"; // Fix positioning if necessary
      });

      // Handle events
      editor.addEventListener("change", () => success(editor.value));
      editor.addEventListener("blur", () => cancel());

      return editor;
    },
  },
  {
    title: "Actions",
    field: "actions",
    hozAlign: "center",
    formatter: (cell) => {
      const rowData = cell.getRow().getData();
      return `<button class="delete-btn" data-id="${rowData.id}" style="background: red; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius:12px;">Delete</button>`;
    },
    cellClick: (e, cell) => {
      const taskId = cell.getRow().getData().id;
      cell.getTable().options.deleteTask(taskId);
    },
  },
];


const Home = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTask, setNewTask] = useState({
    id: 21,
    title: "",
    status: "To Do",
  });

  // Fetch data from the API
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.slice(0, 20).map((task) => ({
          id: task.id,
          title: task.title,
          status: task.completed ? "Done" : "To Do",
        }));
        setTableData(formattedData);
        setFilteredData(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const updatedData = [...tableData, newTask];
      setTableData(updatedData);
      setFilteredData(applyFilters(updatedData, searchTerm, filter));
      setNewTask({
        id: newTask.id + 1,
        title: "",
        status: "To Do",
      });
      toast.success("Task added successfully!");
    } else {
      alert("Please enter a title!");
    }
  };

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    setFilteredData(applyFilters(tableData, searchTerm, selectedFilter));
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredData(applyFilters(tableData, term, filter));
  };

  const applyFilters = (data, search, status) => {
    return data.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search);
      const matchesStatus = status === "All" || task.status === status;
      return matchesSearch && matchesStatus;
    });
  };

  const deleteTask = (taskId) => {
    const updatedData = tableData.filter((task) => task.id !== taskId);
    setTableData(updatedData);
    setFilteredData(applyFilters(updatedData, searchTerm, filter));
    toast.success("Task deleted successfully!");
  };

  const taskCounters = () => {
    const counts = { "To Do": 0, "In Progress": 0, Done: 0 };
    tableData.forEach((task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return counts;
  };

  const counts = taskCounters();

  return (
    <div className="p-4 bg-gray-100">
      <ToastContainer />
      <h3 className="text-4xl font-thin text-center text-gray-900 mb-4">Task Manager</h3>

      {/* Task Counters */}
      <div className="w-[100%] flex justify-center">

        <div className="mb-4 flex items-center justify-evenly w-[50%] gap-4">
          <div className="bg-white p-4 rounded shadow">
            <span className="font-thin">To Do:</span> {counts["To Do"]}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="font-thin">In Progress:</span> {counts["In Progress"]}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <span className="font-thin">Done:</span> {counts["Done"]}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex  items-center gap-4">
        <div className="flex items-center justify-center w-[85%]">

          <input
            type="text"
            placeholder="Search by Title or Description"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        {/* Filter Dropdown */}
        <div className=" flex items-center gap-4">
          <label htmlFor="filter" className="text-gray-700 font-thin">
            Filter :
          </label>
          <select
            id="filter"
            value={filter}
            onChange={handleFilterChange}
            className=" border border-gray-300 rounded"
          >
            <option value="All">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

      </div>



      {/* Add New Task */}
      <div className="mb-4 border border-gray-300 shadow-md rounded-md bg-white p-4">
        <h4 className="font-thin text-gray-800 mb-2">Add New Task</h4>
        <div className="flex gap-4">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="p-2 border border-gray-300 rounded w-[60%]"
          />
          <select
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded w-[20%]"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <button
            onClick={addTask}
            className="p-2 bg-gray-500 text-white rounded w-[20%]"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="border border-gray-300 shadow-md rounded-md bg-white w-full  overflow-y-auto">
        <ReactTabulator
          columns={editableColumns}
          data={filteredData}
          layout="fitColumns"
          options={{
            deleteTask: deleteTask, // Pass deleteTask function
          }}
          footerElement={
            <span className="text-sm text-gray-600 p-2 block">Footer</span>
          }
        />
      </div>
    </div>
  );
};

export default Home;
