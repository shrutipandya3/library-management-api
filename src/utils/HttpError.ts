export default class HttpError extends Error {
    statusCode: number;
    errors?: any;
  
    constructor(message: string, statusCode = 500, errors?: any) {
      super(message);
      this.statusCode = statusCode;
      if (errors) this.errors = errors;
    }
  }
  