import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB connected : ${mongoose.connection.host}`)
    } catch (error) {
        console.log(`MongoDB connection Error : ${error}`)
    }
}

export default connectDb;