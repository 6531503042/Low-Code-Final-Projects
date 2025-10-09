import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly classToUse?: new () => T) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this.classToUse && data) {
          if (Array.isArray(data)) {
            return data.map((item) => plainToClass(this.classToUse, item));
          }
          return plainToClass(this.classToUse, data);
        }
        return data;
      }),
    );
  }
}
