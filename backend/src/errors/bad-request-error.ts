import HttpError from './http-error';

export default class BadRequestError extends HttpError {
  constructor(message = 'Переданы некорректные данные') {
    super(400, message);
  }
}
