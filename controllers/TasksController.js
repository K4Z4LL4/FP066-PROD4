import Task from "../models/Task.js";
import Panel from "../models/Panel.js";

const TasksController = {
    getTaskById: async id => {
        return await Task.findById(id);
    },
    getTasksByPanelId: async panId => {
        return await Task.find({ panId });
    },
    addTask: async newTask => {
        const task = await Task.create(newTask);
        // Añade la tarea en el panel
        await Panel.findByIdAndUpdate(
            newTask.panId,
            { $push: { tasks: task._id } }
        );
        return task;
    },
    updateTask: async (id, updatedTask) => {
        return await Task.findByIdAndUpdate(id, updatedTask, {new: true});
    },
    updateTaskStatus: async (id, status) => {
        return await Task.findByIdAndUpdate(id, {status}, {new: true});
    },
    deleteTask: async id => {
        return Task.findByIdAndDelete(id);
    },
};

export default TasksController;