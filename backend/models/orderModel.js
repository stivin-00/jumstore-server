import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: String },
      },
    ],
    shippingAddress: {
      State: { type: String },
      LGA: { type: String },
      Bustop: { type: String },
      Street: { type: String },
    },
    paymentMethod: { type: String, required: true },
    deliverytMethod: { type: String },
    itemsPrice: { type: Number },
    userEmail: { type: String },
    userPhone: { type: Number },
    userName: { type: String },
    shippingPrice: { type: Number },
    taxPrice: { type: Number },
    totalPrice: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
