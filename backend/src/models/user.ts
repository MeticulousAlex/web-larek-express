import bcrypt from 'bcryptjs';
import { model, Schema } from 'mongoose';
import validator from 'validator';

interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    default: 'Юзернейм',
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Поле "email" должно быть заполнено'],
    validate: { validator: (v: string) => validator.isEmail(v), message: 'Некорректный email' },
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    minlength: [6, 'Минимальная длина поля "password" - 6'],
    select: false,
  },
  tokens: { type: [{ _id: false, token: { type: String, required: true } }], select: false },
});

userSchema.pre('save', async function hash(next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>('user', userSchema);
