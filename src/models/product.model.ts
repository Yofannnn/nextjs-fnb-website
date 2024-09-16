import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true, required: true },
    options: { type: [String], default: [], required: false },
    rating: { type: [Number], default: [], required: false },
    reviews: { type: [String], default: [], required: false },
    totalSales: { type: Number, default: 0, required: false },
  },
  {
    timestamps: true,
  }
);

const ProductModel = models.Product || model("Product", ProductSchema);

export default ProductModel;
