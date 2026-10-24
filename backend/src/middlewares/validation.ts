import { celebrate, Joi, Segments } from 'celebrate';
import { ValidationOptions } from 'joi';

const messages = {
  'any.required': 'Поле "{{#label}}" должно быть заполнено',
  'any.only': 'Поле "{{#label}}" содержит недопустимое значение',
  'string.base': 'Поле "{{#label}}" должно быть строкой',
  'string.empty': 'Поле "{{#label}}" не может быть пустым',
  'string.min': 'Минимальная длина поля "{{#label}}" - {{#limit}}',
  'string.max': 'Максимальная длина поля "{{#label}}" - {{#limit}}',
  'string.email': 'Поле "{{#label}}" должно содержать корректный email',
  'string.hex': 'Поле "{{#label}}" должно быть корректным идентификатором',
  'string.length': 'Поле "{{#label}}" должно быть корректным идентификатором',
  'number.base': 'Поле "{{#label}}" должно быть числом',
  'array.base': 'Поле "{{#label}}" должно быть массивом',
  'array.min': 'Поле "{{#label}}" не должно быть пустым',
  'object.unknown': 'Поле "{{#label}}" не предусмотрено',
};

const options: ValidationOptions = { messages, errors: { wrap: { label: false } } };

const validate = (schema: Parameters<typeof celebrate>[0]) => celebrate(schema, options);

const id = Joi.string().hex().length(24).required();
const image = Joi.object({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

export const productIdParams = validate({ [Segments.PARAMS]: Joi.object({ productId: id }) });

export const createProduct = validate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: image.required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }),
});

export const updateProduct = validate({
  [Segments.PARAMS]: Joi.object({ productId: id }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30),
    image,
    category: Joi.string(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }),
});

export const createOrder = validate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  }),
});

export const login = validate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

export const register = validate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});
