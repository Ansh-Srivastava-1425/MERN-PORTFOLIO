import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";
import mongoose from "mongoose";

// SEND MESSAGE
export const sendMessage = catchAsyncError(async (req, res, next) => {

    const { senderName, subject, message } = req.body;

    if (!senderName || !subject || !message) {
        return next(new ErrorHandler("Please fill all fields", 400));
    }

    const data = await Message.create({
        senderName,
        subject,
        message
    });

    res.status(200).json({
        success: true,
        message: "Message Sent",
        data
    });
});

// GET ALL MESSAGES
export const getAllMessage = catchAsyncError(async (req, res, next) => {

    const messages = await Message.find();

    res.status(200).json({
        success: true,
        messages,
    });
});

// DELETE MESSAGE
export const deleteMessage = catchAsyncError(async (req, res, next) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ID", 400));
    }

    const message = await Message.findById(id);

    if (!message) {
        return next(new ErrorHandler("Message Already Deleted", 404));
    }

    await message.deleteOne();

    res.status(200).json({
        success: true,
        message: "Message Deleted",
    });
});