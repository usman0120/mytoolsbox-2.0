import { ProcessingResult } from "@/lib/processing/types";

export const HTTP_STATUS_CODES: Record<number, { code: number; name: string; description: string; category: string }> = {
  // 1xx Informational
  100: { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body.", category: "1xx Informational" },
  101: { code: 101, name: "Switching Protocols", description: "The server is switching protocols as requested by the client.", category: "1xx Informational" },
  102: { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet.", category: "1xx Informational" },
  103: { code: 103, name: "Early Hints", description: "Used to return some response headers before the final HTTP message.", category: "1xx Informational" },

  // 2xx Success
  200: { code: 200, name: "OK", description: "The request has succeeded. The meaning depends on the HTTP method.", category: "2xx Success" },
  201: { code: 201, name: "Created", description: "The request has been fulfilled and a new resource has been created.", category: "2xx Success" },
  202: { code: 202, name: "Accepted", description: "The request has been accepted for processing, but processing is not complete.", category: "2xx Success" },
  203: { code: 203, name: "Non-Authoritative Information", description: "The returned metadata is from a third-party copy, not the origin server.", category: "2xx Success" },
  204: { code: 204, name: "No Content", description: "The server successfully processed the request but is not returning any content.", category: "2xx Success" },
  205: { code: 205, name: "Reset Content", description: "The server successfully processed the request and asks the client to reset the document view.", category: "2xx Success" },
  206: { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource due to a range header.", category: "2xx Success" },
  207: { code: 207, name: "Multi-Status", description: "The response conveys multiple independent status codes for different operations.", category: "2xx Success" },
  208: { code: 208, name: "Already Reported", description: "Members of a DAV binding have already been enumerated in a previous reply.", category: "2xx Success" },
  226: { code: 226, name: "IM Used", description: "The server has fulfilled a GET request and the response is a representation of the result of one or more instance-manipulations.", category: "2xx Success" },

  // 3xx Redirection
  300: { code: 300, name: "Multiple Choices", description: "There are multiple options for the resource that the client may follow.", category: "3xx Redirection" },
  301: { code: 301, name: "Moved Permanently", description: "The resource has been permanently moved to a new URL.", category: "3xx Redirection" },
  302: { code: 302, name: "Found", description: "The resource is temporarily located at a different URL.", category: "3xx Redirection" },
  303: { code: 303, name: "See Other", description: "The response can be found at another URL using a GET method.", category: "3xx Redirection" },
  304: { code: 304, name: "Not Modified", description: "The resource has not been modified since the last request.", category: "3xx Redirection" },
  305: { code: 305, name: "Use Proxy", description: "The requested resource must be accessed through the specified proxy.", category: "3xx Redirection" },
  307: { code: 307, name: "Temporary Redirect", description: "The resource is temporarily at a different URL. The method should not change.", category: "3xx Redirection" },
  308: { code: 308, name: "Permanent Redirect", description: "The resource has been permanently moved. The method should not change.", category: "3xx Redirection" },

  // 4xx Client Errors
  400: { code: 400, name: "Bad Request", description: "The server cannot process the request due to a client error (malformed syntax).", category: "4xx Client Error" },
  401: { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or not been provided.", category: "4xx Client Error" },
  402: { code: 402, name: "Payment Required", description: "Reserved for future use. Originally intended for digital payment systems.", category: "4xx Client Error" },
  403: { code: 403, name: "Forbidden", description: "The server understood the request but refuses to authorize it.", category: "4xx Client Error" },
  404: { code: 404, name: "Not Found", description: "The requested resource could not be found on the server.", category: "4xx Client Error" },
  405: { code: 405, name: "Method Not Allowed", description: "The HTTP method is not supported for the requested resource.", category: "4xx Client Error" },
  406: { code: 406, name: "Not Acceptable", description: "The server cannot produce a response matching the Accept headers.", category: "4xx Client Error" },
  407: { code: 407, name: "Proxy Authentication Required", description: "The client must authenticate with the proxy first.", category: "4xx Client Error" },
  408: { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request.", category: "4xx Client Error" },
  409: { code: 409, name: "Conflict", description: "The request conflicts with the current state of the server.", category: "4xx Client Error" },
  410: { code: 410, name: "Gone", description: "The resource is no longer available and will not be available again.", category: "4xx Client Error" },
  411: { code: 411, name: "Length Required", description: "The server requires a Content-Length header.", category: "4xx Client Error" },
  412: { code: 412, name: "Precondition Failed", description: "A precondition in the request headers was not met.", category: "4xx Client Error" },
  413: { code: 413, name: "Payload Too Large", description: "The request entity is larger than the server is willing to process.", category: "4xx Client Error" },
  414: { code: 414, name: "URI Too Long", description: "The request URI is longer than the server is willing to interpret.", category: "4xx Client Error" },
  415: { code: 415, name: "Unsupported Media Type", description: "The media format of the request data is not supported.", category: "4xx Client Error" },
  416: { code: 416, name: "Range Not Satisfiable", description: "The range specified in the Range header cannot be fulfilled.", category: "4xx Client Error" },
  417: { code: 417, name: "Expectation Failed", description: "The server cannot meet the requirements of the Expect request header.", category: "4xx Client Error" },
  418: { code: 418, name: "I'm a teapot", description: "The server refuses to brew coffee because it is, permanently, a teapot. (RFC 2324 April Fools)", category: "4xx Client Error" },
  421: { code: 421, name: "Misdirected Request", description: "The request was directed at a server that cannot produce a response.", category: "4xx Client Error" },
  422: { code: 422, name: "Unprocessable Entity", description: "The request was well-formed but contains semantic errors.", category: "4xx Client Error" },
  423: { code: 423, name: "Locked", description: "The resource being accessed is locked.", category: "4xx Client Error" },
  424: { code: 424, name: "Failed Dependency", description: "The request failed because it depended on another request that failed.", category: "4xx Client Error" },
  425: { code: 425, name: "Too Early", description: "The server is unwilling to risk processing a request that might be replayed.", category: "4xx Client Error" },
  426: { code: 426, name: "Upgrade Required", description: "The client should switch to a different protocol.", category: "4xx Client Error" },
  428: { code: 428, name: "Precondition Required", description: "The server requires the request to be conditional.", category: "4xx Client Error" },
  429: { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting).", category: "4xx Client Error" },
  431: { code: 431, name: "Request Header Fields Too Large", description: "The server refuses to process the request because header fields are too large.", category: "4xx Client Error" },
  451: { code: 451, name: "Unavailable For Legal Reasons", description: "The server is denying access to the resource as a consequence of a legal demand.", category: "4xx Client Error" },

  // 5xx Server Errors
  500: { code: 500, name: "Internal Server Error", description: "The server encountered an unexpected condition that prevented it from fulfilling the request.", category: "5xx Server Error" },
  501: { code: 501, name: "Not Implemented", description: "The server does not support the functionality required to fulfill the request.", category: "5xx Server Error" },
  502: { code: 502, name: "Bad Gateway", description: "The server received an invalid response from an upstream server.", category: "5xx Server Error" },
  503: { code: 503, name: "Service Unavailable", description: "The server is temporarily unable to handle the request (overloaded or down for maintenance).", category: "5xx Server Error" },
  504: { code: 504, name: "Gateway Timeout", description: "The server did not receive a timely response from an upstream server.", category: "5xx Server Error" },
  505: { code: 505, name: "HTTP Version Not Supported", description: "The server does not support the HTTP protocol version used in the request.", category: "5xx Server Error" },
  506: { code: 506, name: "Variant Also Negotiates", description: "Transparent content negotiation results in a circular reference.", category: "5xx Server Error" },
  507: { code: 507, name: "Insufficient Storage", description: "The server is unable to store the representation needed to complete the request.", category: "5xx Server Error" },
  508: { code: 508, name: "Loop Detected", description: "The server detected an infinite loop while processing the request.", category: "5xx Server Error" },
  510: { code: 510, name: "Not Extended", description: "Further extensions to the request are required for the server to fulfill it.", category: "5xx Server Error" },
  511: { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access.", category: "5xx Server Error" },
};

export function lookupStatus(code: number): ProcessingResult {
  const status = HTTP_STATUS_CODES[code];
  if (!status) {
    return { status: "error", error: `HTTP status code ${code} not found.` };
  }
  return { status: "success", message: `${code} ${status.name}`, data: status };
}

export function searchStatuses(query: string): ProcessingResult {
  const q = query.toLowerCase();
  const results = Object.values(HTTP_STATUS_CODES).filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      String(s.code).includes(q)
  );
  return {
    status: "success",
    message: `Found ${results.length} status code(s)`,
    data: results,
  };
}

export function getStatusCategories(): string[] {
  return ["1xx Informational", "2xx Success", "3xx Redirection", "4xx Client Error", "5xx Server Error"];
}