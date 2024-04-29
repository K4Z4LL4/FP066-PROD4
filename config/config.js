import { connect } from 'mongoose';
import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI;

const connDB = async () => {
    try {
        await connect(MONGODB_URI);
        console.log('DB Conectada');
    } catch (error) {
        console.log(error);
        throw new Error("Error connecting to DB");
    }
}

export { connDB };


