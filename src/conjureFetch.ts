import { ConjureContext } from ".";

export async function conjureFetch<T>(
  { fetchFn, basePath }: ConjureContext,
  url: string,
  method: string,
  body?:
    | ArrayBuffer
    | Blob
    | FormData
    | URLSearchParams
    | null
    | string
    | {},
  contentType?: "application/json" | "application/octet-stream",
  accept?: "application/json" | "application/octet-stream",
): Promise<T> {
  if (body) {
    if (
      body instanceof URLSearchParams || body instanceof Blob || body instanceof FormData
      || typeof body === "string" || body instanceof ArrayBuffer
    ) {
    } else {
      body = JSON.stringify(body);
    }
  }
  const response = await fetchFn(url, {
    method,
    credentials: "same-origin",
    headers: {
      "Fetch-User-Agent": "conjure-lite",
      "Content-Type": contentType ?? "application/json",
      accept: accept ?? "application/json",
    },
    ...(body ? { body } as any : {}),
  });

  try {
    if (response.status === 204) return undefined as T;
    const body = await readBody(response);
    if (!response.ok) {
      throw new ConjureError("STATUS", undefined, response.status, body);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ConjureError) {
      throw error;
    } else if (error instanceof TypeError) {
      throw new ConjureError("NETWORK", error);
    } else {
      throw new ConjureError("OTHER", error);
    }
  }
}

async function readBody(response: Response) {
  const contentType = response.headers.get("Content-Type") != null
    ? (response.headers.get("Content-Type") as string)
    : "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    } else if (contentType.includes("application/octet-stream")) {
      return await response.blob();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw new ConjureError("PARSE", error, response.status);
  }
}

type ConjureErrorType = "NETWORK" | "OTHER" | "PARSE" | "STATUS";

export class ConjureError<E> {
  public readonly type: "NETWORK" | "OTHER" | "PARSE" | "STATUS";
  public readonly originalError?: any;
  public readonly status?: number;
  public readonly body?: string | E;

  constructor(
    errorType: ConjureErrorType,
    originalError?: any,
    status?: number,
    body?: string | E,
  ) {
    this.type = errorType;
    this.originalError = originalError;
    this.status = status;
    this.body = body;
  }

  public toString() {
    return JSON.stringify(
      {
        body: this.body,
        originalError: this.originalError && this.originalError.toString(),
        status: this.status,
        type: this.type,
      },
      null,
      "  ",
    );
  }
}
