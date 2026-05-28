import mongoose from 'mongoose'

const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URI , {
        dbName : "PORTFOLIO"
    }).then(() => {
        console.log("connected to database.")
    }).catch((error)=>{
        console.log(`Error occured while connecting to database : ${error}`);
    })
}

export default dbConnection;