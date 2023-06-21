import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    try {
      const status = exception.getStatus();

      if (status === 400) {
        try {
          const errorResponse = {
            errorsMessages: [],
          };
          const responseBody: any = exception.getResponse();
          responseBody.message.forEach((m) =>
            errorResponse.errorsMessages.push(m),
          );

          return response.status(status).json(errorResponse);
        } catch (e) {
          const errorResponse = {
            errorsMessages: [],
          };
          const responseBody: any = exception.getResponse();
          responseBody.errorsMessages.forEach((m) =>
            errorResponse.errorsMessages.push(m),
          );

          return response.status(status).json(errorResponse);
        }
      } else {
        console.log(exception.getResponse());
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    } catch (e) {
      console.log(e);
      return response.sendStatus(404);
    }
  }
}
