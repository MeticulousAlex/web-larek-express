import HttpError from './http-error';

export default class ConflictError extends HttpError {
  constructor(message = 'Конфликт данных') {
    super(409, message);
  }
}
