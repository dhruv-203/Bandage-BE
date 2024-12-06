class ApiError extends Error {
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] | null
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.errors = errors;
  }
  statusCode: number;
  data: any;
  message: string;
  errors: any[] | null;

  get JSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
      error: this.errors,
    };
  }
}

export { ApiError };
