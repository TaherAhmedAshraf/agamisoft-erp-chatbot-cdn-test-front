import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: any;
    meta?: {
        timestamp: string;
        requestId?: string;
        version?: string;
        pagination?: PaginationMeta;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ErrorDetail {
    field?: string;
    message: string;
    code?: string;
}

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

export class ResponseHandler {

    // Success responses
    static success<T>(
        res: Response,
        data: T,
        message = 'Request successful',
        status = HttpStatus.OK,
    ) {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
        };
        return res.status(status).json(response);
    }

    static created<T>(
        res: Response,
        data: T,
        message = 'Resource created successfully',
    ) {
        return this.success(res, data, message, HttpStatus.CREATED);
    }

    static noContent(res: Response, message = 'No content') {
        const response: ApiResponse = {
            success: true,
            message,
        };
        return res.status(HttpStatus.NO_CONTENT).json(response);
    }

    // Error responses
    static error(
        res: Response,
        error: any,
        message = 'An error occurred',
        status = HttpStatus.INTERNAL_SERVER_ERROR,
    ) {
        const response: ApiResponse = {
            success: false,
            message,
            error: this.formatError(error),
        };
        return res.status(status).json(response);
    }

    static badRequest(
        res: Response,
        error: any = null,
        message = 'Bad request',
    ) {
        return this.error(res, error, message, HttpStatus.BAD_REQUEST);
    }

    static unauthorized(
        res: Response,
        message = 'Unauthorized access',
    ) {
        return this.error(res, null, message, HttpStatus.UNAUTHORIZED);
    }

    static forbidden(
        res: Response,
        message = 'Access forbidden',
    ) {
        return this.error(res, null, message, HttpStatus.FORBIDDEN);
    }

    static notFound(
        res: Response,
        message = 'Resource not found',
    ) {
        return this.error(res, null, message, HttpStatus.NOT_FOUND);
    }

    static conflict(
        res: Response,
        error: any = null,
        message = 'Resource conflict',
    ) {
        return this.error(res, error, message, HttpStatus.CONFLICT);
    }

    static validationError(
        res: Response,
        errors: ErrorDetail[],
        message = 'Validation failed',
    ) {
        return this.error(res, errors, message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    static internalError(
        res: Response,
        error: any = null,
        message = 'Internal server error',
    ) {
        // Log the actual error for debugging but don't expose it to client
        console.error('Internal Server Error:', error);

        const sanitizedError = process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error;

        return this.error(res, sanitizedError, message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Helper methods
    private static formatError(error: any): any {
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
            };
        }
        return error;
    }

    // Utility method to create pagination metadata
    static createPagination(
        page: number,
        limit: number,
        total: number
    ): PaginationMeta {
        const totalPages = Math.ceil(total / limit);
        return {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

}