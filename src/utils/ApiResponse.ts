export class ApiResponse  {
  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
  
  statusCode: number;
  data: any;
  message: string;
}
