import mongoose from "mongoose" ;

const connectDatabase = async() => {
    try {
        const connect =  await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDb is connected on ${connect.connection.host}`)
        
    } catch (error) {
        console.log("MongoDb connection error", error)
    }

}


export default connectDatabase ;