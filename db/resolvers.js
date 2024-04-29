import PanelsController from "../controllers/PanelsController.js";
import TasksController from "../controllers/TasksController.js";
import { DateResolver } from "graphql-scalars";


const resolvers = {

    Date: DateResolver,

    Query: {
        panels: async () => {
            return await PanelsController.getPanelsList()
        },
        getPanelById: async (obj, { id }) => {
            return await PanelsController.getPanelById(id);
        },
        getTasksByPanelId: async (obj, { panId }) => {
            return await TasksController.getTasksByPanelId(panId);
        },
        getTaskById: async (obj, { id }) => {
            return await TasksController.getTaskById(id);
        },

    },
    Mutation:  {
        addPanel: async (obj, panData) => {
            panData.tasks = [];
            return await PanelsController.addPanel(panData);
        },
        updatePanel: async (obj, panData) => {
            return await PanelsController
                .updatePanel(panData.id, panData);
        },
        deletePanel: async (obj, { id }) => {
            return await PanelsController.deletePanel(id);
        },

        addTask: async (obj, taskData) => {
            return await TasksController
                .addTask(taskData);
        },
        updateTask: async (obj, taskData) => {
            return await TasksController
                .updateTask(taskData.id, taskData);
        },
        updateTaskStatus: async (obj, taskData) => {
            return await TasksController
                .updateTaskStatus(taskData.id, taskData.status);
        },
        deleteTask: async (obj, { id }) => {
            return await TasksController.deleteTask(id);
        },
    },

};

export default resolvers;

