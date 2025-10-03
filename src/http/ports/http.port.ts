export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export interface HttpRequest { params: any; query: any; headers: any; body: unknown; }
export interface HttpResponse<T=unknown> { status: number; body?: T; headers?: Record<string, string>; }
export interface HttpServer {
    route(method: HttpMethod, path: string, handler: (req: HttpRequest) => Promise<HttpResponse> | HttpResponse): void;
}