export class ApiError extends Error {
  public status: number;
  public isOperational: boolean;
  public details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.isOperational = true;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
