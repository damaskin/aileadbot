import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Messenger API',
            version: '1.0.0',
        },
        components: {
            // Define your components based on the given Swagger object here
        },
        paths: {
            // Define your paths based on the given Swagger object here
        },
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
