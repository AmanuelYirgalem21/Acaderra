import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any;

    // Prisma known errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = this.parseP2002(exception);
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          if (process.env.NODE_ENV === 'production') {
            message = "Invalid request";
          } else {
          message = exception.message;
          }
      }
    }
    // Prisma validation
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
        if (process.env.NODE_ENV === 'production') {
        message = "Invalid request";
      } else {
        message = exception.message;
   }
  
  }
    // Nest HttpException
    else if (exception instanceof HttpException) {
        const res = exception.getResponse();
        message = typeof res === 'string' ? res : (res as any).message;
    }
    // Normal JS Error
    else if (exception instanceof Error) {
        if (process.env.NODE_ENV === 'production') {
          message = "Invalid request";
        } else {
          message = exception.message;
    }
      }
    // Unknown error
    else {
      message = 'Something went wrong, Please try again!';
    }

    const isProd = process.env.NODE_ENV === 'production';

    // PRODUCTION => only return minimal info
    if (isProd) {
      return response.status(status).json({
        status: 'error',
        message: this.sanitizeMessage(message),
      });
    }

    // DEVELOPMENT => return full info
    return response.status(status).json({
      status: 'error',
      message,
      stack: (exception as any)?.stack,
    });
  }

  private parseP2002(exception: Prisma.PrismaClientKnownRequestError) {
    const target = (exception.meta as any)?.target;
    return `Duplicate field value: ${target}. Please use another value.`;
  }

  private sanitizeMessage(message: any): string {
    if (Array.isArray(message)) return message.join(', ');
    return typeof message === 'string' ? message : 'Something went wrong';
  }
}