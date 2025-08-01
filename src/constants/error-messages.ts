type ErrorMessages = {
    AUTH: {
        INVALID_CREDENTIALS: string;
        USER_NOT_FOUND: string;
        EMAIL_EXISTS: string;
        WEAK_PASSWORD: string;
        INVALID_EMAIL: string;
        SESSION_EXPIRED: string;
        UNAUTHORIZED: string;
        USERNAME_EXISTS: string;
        INVALID_USERNAME: string;
        REGISTRATION_FAILED: string;
    };
    VALIDATION: {
        REQUIRED_FIELD: string;
        INVALID_FORMAT: string;
        MIN_LENGTH: string;
        MAX_LENGTH: string;
        PASSWORD_MISMATCH: string;
        USERNAME_FORMAT: string;
        PASSWORD_WEAK: string;
        PASSWORD_SAME_AS_USERNAME: string;
    };
    NETWORK: {
        CONNECTION_ERROR: string;
        TIMEOUT: string;
        SERVER_ERROR: string;
        API_ERROR: string;
    };
    UPLOAD: {
        FILE_TOO_LARGE: string;
        INVALID_FILE_TYPE: string;
        UPLOAD_FAILED: string;
    };
    CHAT: {
        MESSAGE_NOT_FOUND: string;
        SEND_FAILED: string;
        INVALID_RECIPIENT: string;
    };
    GENERAL: {
        UNKNOWN_ERROR: string;
        OPERATION_FAILED: string;
        INVALID_INPUT: string;
    };
};

export const ERROR_MESSAGES: ErrorMessages = {
    AUTH: {
        INVALID_CREDENTIALS: 'Invalid username or password',
        USER_NOT_FOUND: 'User not found',
        EMAIL_EXISTS: 'Username already exists',
        WEAK_PASSWORD: 'Password must be at least 8 characters',
        INVALID_EMAIL: 'Invalid email format',
        SESSION_EXPIRED: 'Session has expired',
        UNAUTHORIZED: 'You do not have permission to access',
        USERNAME_EXISTS: 'Username is already taken',
        INVALID_USERNAME: 'Invalid username',
        REGISTRATION_FAILED: 'Registration failed',
    },
    VALIDATION: {
        REQUIRED_FIELD: 'This field is required',
        INVALID_FORMAT: 'Invalid format',
        MIN_LENGTH: 'Content is too short',
        MAX_LENGTH: 'Content is too long',
        PASSWORD_MISMATCH: 'Passwords do not match',
        USERNAME_FORMAT: 'Username can only contain letters, numbers, and underscores',
        PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        PASSWORD_SAME_AS_USERNAME: 'Password cannot be the same as username',
    },
    NETWORK: {
        CONNECTION_ERROR: 'Cannot connect to the server',
        TIMEOUT: 'Request timed out',
        SERVER_ERROR: 'Server error',
        API_ERROR: 'API call failed',
    },
    UPLOAD: {
        FILE_TOO_LARGE: 'File is too large',
        INVALID_FILE_TYPE: 'File type is not supported',
        UPLOAD_FAILED: 'Upload failed',
    },
    CHAT: {
        MESSAGE_NOT_FOUND: 'Message not found',
        SEND_FAILED: 'Failed to send message',
        INVALID_RECIPIENT: 'Invalid recipient',
    },
    GENERAL: {
        UNKNOWN_ERROR: 'An unknown error occurred',
        OPERATION_FAILED: 'Operation failed',
        INVALID_INPUT: 'Invalid input data',
    }
};
export type ErrorMessageKey = keyof ErrorMessages;
export type ErrorMessageCategory = keyof ErrorMessages;
export type ErrorMessageValue = ErrorMessages[ErrorMessageCategory][keyof ErrorMessages[ErrorMessageCategory]];
