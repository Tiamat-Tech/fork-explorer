import { encodeBase64 } from "$std/encoding/base64.ts";
import config from "../config.ts";

const host = config.bitcoinRpc.server;
const rpcUser = config.bitcoinRpc.user;
const rpcPassword = config.bitcoinRpc.password;

const credentials: string = encodeBase64(`${rpcUser}:${rpcPassword}`);
const headers = new Headers();
headers.set("Authorization", "Basic " + credentials);

export interface JsonMap {
  [key: string]: AnyJson;
}

export interface JsonArray extends Array<AnyJson> {}
export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;

interface RpcJsonResponse {
  result: AnyJson;
  error: null;
  id?: string;
}

interface RpcJsonError {
  result: null;
  error: {
    code: string;
    message: string;
  };
  id?: string;
}

export async function request(method: string, data: unknown[]): Promise<RpcJsonResponse | RpcJsonError> {
  const result = await fetch(host, {
    headers,
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "1.0",
      method: method,
      params: data,
    }),
  });
  return await result.json();
}
