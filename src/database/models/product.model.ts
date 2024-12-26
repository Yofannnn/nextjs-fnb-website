import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    productId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, required: true },
    options: { type: [String], required: false },
    reviews: {
      type: [
        {
          userId: { type: String, required: true },
          rating: { type: Number, required: true }, // 1-5
          review: { type: String, required: true },
        },
      ],
      required: false,
      default: [],
    },
    totalSales: { type: Number, default: 0, required: false },
  },
  {
    timestamps: true,
  }
);

const ProductModel = models.Product || model("Product", ProductSchema);

export default ProductModel;
