import HttpError from './http-error';

export default class UnauthorizedError extends HttpError {
  constructor(message = 'Необходима авторизация') {
    super(401, message);
  }
}
