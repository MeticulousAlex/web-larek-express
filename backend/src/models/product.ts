import fs from 'fs';
import path from 'path';
import { model, Schema } from 'mongoose';
import { PUBLIC_DIR } from '../config';

export interface IProduct {
  title: string;
  image: { fileName: string; originalName: string };
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: {
      fileName: { type: String, required: [true, 'Поле "fileName" должно быть заполнено'] },
      originalName: { type: String, required: [true, 'Поле "originalName" должно быть заполнено'] },
    },
    required: [true, 'Поле "image" должно быть заполнено'],
    _id: false,
  },
  category: { type: String, required: [true, 'Поле "category" должно быть заполнено'] },
  description: { type: String },
  price: { type: Number, default: null },
});

productSchema.post('findOneAndDelete', (doc: IProduct | null) => {
  if (doc) fs.unlink(path.join(PUBLIC_DIR, doc.image.fileName), () => {});
});

export default model<IProduct>('product', productSchema);
