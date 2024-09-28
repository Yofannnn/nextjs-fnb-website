import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, required: true },
    options: { type: [String], required: false },
    rating: { type: [Number], required: false },
    reviews: { type: [String], required: false },
    totalSales: { type: Number, default: 0, required: false },
  },
  {
    timestamps: true,
  }
);

const ProductModel = models.Product || model("Product", ProductSchema);

export default ProductModel;
