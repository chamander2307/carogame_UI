import StatusCodeMessages from "./StatusCode";

export function getVietnameseMessage(code, ...args) {
  let msg = StatusCodeMessages[code] || "Lỗi không xác định";
  if (args.length > 0) {
    msg = msg.replace(/%s/g, () => args.shift());
  }
  return msg;
}
