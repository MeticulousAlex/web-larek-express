import HttpError from './http-error';

export default class NotFoundError extends HttpError {
  constructor(message = 'Ресурс не найден') {
    super(404, message);
  }
}
