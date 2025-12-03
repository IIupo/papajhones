import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'ready', 'delivered', 'at_restaurant'],
        default: 'pending'
    },
    address: {
        type: String,
        required: true
    },
    courierId: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Order = model('Order', orderSchema);

export default Order;