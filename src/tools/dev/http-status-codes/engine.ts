import { ProcessingResult } from "@/lib/processing/types";

export interface HttpStatusDetail {
  code: number;
  name: string;
  description: string;
  category: string;
  rfc?: string;
  causes?: string[];
  solutions?: string[];
  snippets?: {
    express: string;
    nextjs: string;
    fastapi: string;
    go: string;
  };
}

export const HTTP_STATUS_CODES: Record<number, HttpStatusDetail> = {
  // 1xx Informational
  100: { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body.", category: "1xx Informational", rfc: "RFC 9110 §15.2.1" },
  101: { code: 101, name: "Switching Protocols", description: "The server is switching protocols as requested by the client (e.g. upgrading to WebSocket).", category: "1xx Informational", rfc: "RFC 9110 §15.2.2" },
  102: { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet.", category: "1xx Informational", rfc: "RFC 2518 §10.1" },
  103: { code: 103, name: "Early Hints", description: "Used to return some response headers before the final HTTP message (e.g. preloading assets).", category: "1xx Informational", rfc: "RFC 8297 §2" },

  // 2xx Success
  200: {
    code: 200,
    name: "OK",
    description: "The request has succeeded. The payload sent depends on the request method.",
    category: "2xx Success",
    rfc: "RFC 9110 §15.3.1",
    snippets: {
      express: `res.status(200).json({ success: true, data });`,
      nextjs: `return NextResponse.json({ success: true, data }, { status: 200 });`,
      fastapi: `return {"success": True, "data": data}`,
      go: `w.WriteHeader(http.StatusOK)\njson.NewEncoder(w).Encode(data)`,
    },
  },
  201: {
    code: 201,
    name: "Created",
    description: "The request has been fulfilled and resulted in one or more new resources being created.",
    category: "2xx Success",
    rfc: "RFC 9110 §15.3.2",
    snippets: {
      express: `res.status(201).json({ id: newItem.id });`,
      nextjs: `return NextResponse.json({ id: newItem.id }, { status: 201 });`,
      fastapi: `@app.post("/items", status_code=status.HTTP_201_CREATED)`,
      go: `w.WriteHeader(http.StatusCreated)`,
    },
  },
  202: { code: 202, name: "Accepted", description: "The request has been accepted for processing, but processing is not yet complete (asynchronous task).", category: "2xx Success", rfc: "RFC 9110 §15.3.3" },
  204: {
    code: 204,
    name: "No Content",
    description: "The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.",
    category: "2xx Success",
    rfc: "RFC 9110 §15.3.5",
    snippets: {
      express: `res.status(204).send();`,
      nextjs: `return new NextResponse(null, { status: 204 });`,
      fastapi: `@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)`,
      go: `w.WriteHeader(http.StatusNoContent)`,
    },
  },
  206: { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource due to a Range header sent by the client (video streaming / chunked downloads).", category: "2xx Success", rfc: "RFC 9110 §15.3.7" },

  // 3xx Redirection
  301: {
    code: 301,
    name: "Moved Permanently",
    description: "The target resource has been assigned a new permanent URI and any future references to this resource should use one of the returned URIs.",
    category: "3xx Redirection",
    rfc: "RFC 9110 §15.4.2",
    snippets: {
      express: `res.redirect(301, "https://newdomain.com/path");`,
      nextjs: `return NextResponse.redirect(new URL("/new-path", request.url), { status: 301 });`,
      fastapi: `return RedirectResponse(url="/new-path", status_code=301)`,
      go: `http.Redirect(w, r, "/new-path", http.StatusMovedPermanently)`,
    },
  },
  302: { code: 302, name: "Found (Temporary Redirect)", description: "The target resource resides temporarily under a different URI.", category: "3xx Redirection", rfc: "RFC 9110 §15.4.3" },
  304: { code: 304, name: "Not Modified", description: "A conditional GET or HEAD request has been received and would have resulted in a 200 OK response if not for the condition being false (client cache is fresh).", category: "3xx Redirection", rfc: "RFC 9110 §15.4.5" },
  307: { code: 307, name: "Temporary Redirect", description: "The request should be repeated with another URI; however, future requests should still use the original URI. The request method MUST NOT change.", category: "3xx Redirection", rfc: "RFC 9110 §15.4.8" },
  308: { code: 308, name: "Permanent Redirect", description: "The target resource has been assigned a new permanent URI and future requests should use this URI. The request method MUST NOT change (preserves POST).", category: "3xx Redirection", rfc: "RFC 9110 §15.4.9" },

  // 4xx Client Errors
  400: {
    code: 400,
    name: "Bad Request",
    description: "The server cannot or will not process the request due to an apparent client error (e.g. malformed JSON syntax, invalid query params).",
    category: "4xx Client Error",
    rfc: "RFC 9110 §15.5.1",
    causes: [
      "Malformed JSON or XML payload syntax.",
      "Missing required request parameters or header fields.",
      "Schema validation error (Zod/Joi/Pydantic failed validation).",
    ],
    solutions: [
      "Inspect payload formatting and check for quotes or commas.",
      "Verify query string parameters against the API documentation.",
    ],
    snippets: {
      express: `res.status(400).json({ error: "Invalid payload parameters" });`,
      nextjs: `return NextResponse.json({ error: "Validation failed" }, { status: 400 });`,
      fastapi: `raise HTTPException(status_code=400, detail="Invalid input")`,
      go: `http.Error(w, "Bad Request", http.StatusBadRequest)`,
    },
  },
  401: {
    code: 401,
    name: "Unauthorized",
    description: "The request has not been applied because it lacks valid authentication credentials for the target resource.",
    category: "4xx Client Error",
    rfc: "RFC 9110 §15.5.2",
    causes: [
      "Missing `Authorization: Bearer <token>` header.",
      "Expired JWT token or revoked API key.",
      "Invalid login credentials.",
    ],
    solutions: [
      "Refresh the authentication token.",
      "Ensure the Authorization header is set with the correct bearer scheme.",
    ],
    snippets: {
      express: `res.status(401).json({ error: "Unauthorized: Invalid or expired token" });`,
      nextjs: `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`,
      fastapi: `raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")`,
      go: `http.Error(w, "Unauthorized", http.StatusUnauthorized)`,
    },
  },
  403: {
    code: 403,
    name: "Forbidden",
    description: "The server understood the request but refuses to authorize it. Unlike 401, re-authenticating will not make a difference (insufficient permissions / RBAC).",
    category: "4xx Client Error",
    rfc: "RFC 9110 §15.5.4",
    causes: [
      "Authenticated user lacks necessary role/permission (e.g. admin vs member).",
      "IP address blocked by firewall or rate limits.",
      "CORS origin policy rejection.",
    ],
    solutions: [
      "Check user permissions in IAM/database.",
      "Verify CORS origin allowed headers on the server.",
    ],
    snippets: {
      express: `res.status(403).json({ error: "Forbidden: Insufficient privileges" });`,
      nextjs: `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`,
      fastapi: `raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")`,
      go: `http.Error(w, "Forbidden", http.StatusForbidden)`,
    },
  },
  404: {
    code: 404,
    name: "Not Found",
    description: "The origin server did not find a current representation for the target resource or is not willing to disclose that one exists.",
    category: "4xx Client Error",
    rfc: "RFC 9110 §15.5.5",
    causes: [
      "Typo in the endpoint path or URL route.",
      "Resource ID deleted or does not exist in database.",
      "Incorrect HTTP method used for this route.",
    ],
    solutions: [
      "Double-check route parameters and trailing slashes.",
      "Verify database records exist before querying.",
    ],
    snippets: {
      express: `res.status(404).json({ error: "Resource not found" });`,
      nextjs: `return NextResponse.json({ error: "Not Found" }, { status: 404 });`,
      fastapi: `raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")`,
      go: `http.Error(w, "Not Found", http.StatusNotFound)`,
    },
  },
  405: { code: 405, name: "Method Not Allowed", description: "The request method is known by the server but is not supported by the target resource (e.g. sending a POST to a GET-only route).", category: "4xx Client Error", rfc: "RFC 9110 §15.5.6" },
  408: { code: 408, name: "Request Timeout", description: "The server did not receive a complete request message within the time that it was prepared to wait.", category: "4xx Client Error", rfc: "RFC 9110 §15.5.9" },
  409: { code: 409, name: "Conflict", description: "The request could not be completed due to a conflict with the current state of the target resource (e.g. duplicate email address on registration).", category: "4xx Client Error", rfc: "RFC 9110 §15.5.10" },
  413: { code: 413, name: "Payload Too Large", description: "The server is refusing to process a request because the request payload is larger than the server is willing or able to process (e.g. upload limit).", category: "4xx Client Error", rfc: "RFC 9110 §15.5.14" },
  415: { code: 415, name: "Unsupported Media Type", description: "The origin server is refusing to service the request because the payload is in a format not supported by this method on the target resource (e.g. sent XML instead of JSON).", category: "4xx Client Error", rfc: "RFC 9110 §15.5.16" },
  418: { code: 418, name: "I'm a teapot", description: "The server refuses the attempt to brew coffee with a teapot (RFC 2324 Hyper Text Coffee Pot Control Protocol).", category: "4xx Client Error", rfc: "RFC 2324 §2.3.2" },
  422: {
    code: 422,
    name: "Unprocessable Content",
    description: "The server understands the content type of the request entity, and the syntax is correct, but was unable to process the contained instructions (semantic errors).",
    category: "4xx Client Error",
    rfc: "RFC 9110 §15.5.21",
    snippets: {
      express: `res.status(422).json({ error: "Validation failed", fields: errors });`,
      nextjs: `return NextResponse.json({ error: "Unprocessable Entity", errors }, { status: 422 });`,
      fastapi: `raise HTTPException(status_code=422, detail="Semantic error")`,
      go: `http.Error(w, "Unprocessable Entity", http.StatusUnprocessableEntity)`,
    },
  },
  429: {
    code: 429,
    name: "Too Many Requests",
    description: "The user has sent too many requests in a given amount of time (rate limiting). Should include Retry-After header.",
    category: "4xx Client Error",
    rfc: "RFC 6585 §4",
    causes: [
      "API rate limit exceeded by client IP or API key.",
      "Aggressive automated polling or web scraping.",
    ],
    solutions: [
      "Implement exponential backoff retry in client code.",
      "Check `Retry-After` header value before re-sending requests.",
    ],
    snippets: {
      express: `res.set("Retry-After", "60").status(429).json({ error: "Rate limit exceeded" });`,
      nextjs: `return new NextResponse("Rate limit exceeded", { status: 429, headers: { "Retry-After": "60" } });`,
      fastapi: `raise HTTPException(status_code=429, detail="Rate limit exceeded", headers={"Retry-After": "60"})`,
      go: `w.Header().Set("Retry-After", "60")\nhttp.Error(w, "Too Many Requests", http.StatusTooManyRequests)`,
    },
  },

  // 5xx Server Errors
  500: {
    code: 500,
    name: "Internal Server Error",
    description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
    category: "5xx Server Error",
    rfc: "RFC 9110 §15.6.1",
    causes: [
      "Unhandled exception or crash in server runtime code.",
      "Database connection lost or unhandled query failure.",
      "Missing environment variable on server deployment.",
    ],
    solutions: [
      "Check server terminal / cloud logging console for stack traces.",
      "Wrap risky async functions in try/catch handlers.",
    ],
    snippets: {
      express: `res.status(500).json({ error: "Internal server error" });`,
      nextjs: `return NextResponse.json({ error: "Internal server error" }, { status: 500 });`,
      fastapi: `raise HTTPException(status_code=500, detail="Internal server error")`,
      go: `http.Error(w, "Internal Server Error", http.StatusInternalServerError)`,
    },
  },
  502: {
    code: 502,
    name: "Bad Gateway",
    description: "The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to complete the request.",
    category: "5xx Server Error",
    rfc: "RFC 9110 §15.6.3",
    causes: [
      "Backend Node.js/Python microservice crashed behind NGINX or Cloudflare.",
      "Port configuration mismatch between reverse proxy and app.",
      "Server out of memory (OOM killed).",
    ],
    solutions: [
      "Verify upstream application service is actively listening on the target port.",
      "Inspect NGINX / Caddy reverse proxy logs.",
    ],
  },
  503: {
    code: 503,
    name: "Service Unavailable",
    description: "The server is currently unable to handle the request due to a temporary overload or scheduled maintenance.",
    category: "5xx Server Error",
    rfc: "RFC 9110 §15.6.4",
  },
  504: {
    code: 504,
    name: "Gateway Timeout",
    description: "The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.",
    category: "5xx Server Error",
    rfc: "RFC 9110 §15.6.5",
    causes: [
      "Backend query took longer than reverse proxy timeout (e.g. NGINX 60s limit).",
      "Network partition or firewall blocking upstream traffic.",
    ],
    solutions: [
      "Increase proxy `proxy_read_timeout` if long jobs are expected, or convert to background worker queue.",
    ],
  },
};

export function lookupStatus(code: number): ProcessingResult {
  const status = HTTP_STATUS_CODES[code];
  if (!status) {
    return { status: "error", error: `HTTP status code ${code} not found.` };
  }
  return { status: "success", message: `${code} ${status.name}`, data: status };
}

export function searchStatuses(query: string): ProcessingResult {
  const q = query.toLowerCase().trim();
  const results = Object.values(HTTP_STATUS_CODES).filter(
    (s) =>
      String(s.code).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
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