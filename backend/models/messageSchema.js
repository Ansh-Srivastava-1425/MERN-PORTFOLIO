import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    senderName: {
        type: String,
        // required: [true, "Sender name is required"],
        minLength: [2, "Name must contain at least 2 characters"],
    },

    subject: {
        type: String,
        // required: [true, "Subject is required"],
        minLength: [2, "Subject must contain at least 2 characters"],
    },

    message: {
        type: String,
        // required: [true, "Message is required"],
        minLength: [2, "Message must contain at least 2 characters"],
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

});

export const Message = mongoose.model("Message", messageSchema);