import Panel from "../models/Panel.js";
import Task from "../models/Task.js";

const PanelsController = {
    getPanelsList: async () => {
         return await Panel.find({});
    },
    getPanelById: async id => {
         return await Panel.findById(id)
            .populate("tasks");
    },
    addPanel: async newPanel => {
        return await Panel.create(newPanel);
    },
    updatePanel: async (id, updatedPanel) => {
        return await Panel.findByIdAndUpdate(id, updatedPanel, {new: true});
    },
    deletePanel: async id => {
        // Se borran primero las tareas que contiene el tablero a eliminar
        await Task.deleteMany({panId: id});
        return await Panel.findByIdAndDelete(id);
    },

};

export default PanelsController;