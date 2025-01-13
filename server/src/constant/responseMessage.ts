export default {
  SUCCESS: 'Success: The request was processed successfully.',
  FAILED: 'Failed: The request could not be processed due to invalid data or constraints',
  UNAUTHORIZED: 'Unauthorized: You do not have the necessary credentials to access this resource.',
  UNAUTHENTICATED: 'Unauthenticated: Please log in to proceed with this action.',
  BAD_REQUEST: 'Bad Request: The request could not be understood or was missing required parameters.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error: Something went wrong on our end. Please try again later.',
  TOO_MANY_REQUESTS:
    'Too many requests! You have exceeded the allowed number of requests per minute. Please wait a moment before trying again. If you continue to experience issues, please contact support.',
  NOT_FOUND: (entity: string) => `${entity} not found`
};
