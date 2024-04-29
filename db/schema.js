const typeDefs = `#graphql

    scalar Date

    type Task {
        id: ID!
        panId: ID!
        status: Int!
        name: String
        descrip: String!
        member: String!
        dat: Date!
        file: String  
    }
    
     type Panel {
        id: ID!
        name: String!
        dat: Date!
        descrip: String!
        color: String!
        tasks: [Task]
    }

    type Query {
        # Tableros
        panels: [Panel]
        getPanelById(id: ID!): Panel
        # Tareas
        getTasksByPanelId(panId: ID): [Task]
        getTaskById(id: ID!): Task
    }
    
    type Mutation {
        # Tableros
        addPanel(
            name: String!,        
            dat: Date!,      
            descrip: String!, 
            color: String!): Panel  
        updatePanel(
            id: ID!, 
            name: String, 
            dat: Date, 
            descrip: String, 
            color: String): Panel        
        deletePanel(id: ID!): Panel

        # Tareas
        addTask(
            panId: ID!, 
            name: String, 
            descrip: String!, 
            status: Int!, 
            member: String!,
            dat: Date!,
            file: String): Task
        updateTask(
            id: ID!, 
            name: String, 
            descrip: String, 
            status: Int, 
            member: String,
            dat: Date,
            file: String): Task
        updateTaskStatus(
            id: ID!, status: Int!): Task
        deleteTask(
            id: ID!): Task
}
`;
export default typeDefs;

