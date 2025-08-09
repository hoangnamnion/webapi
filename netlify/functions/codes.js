import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function handler(event) {
  const method = event.httpMethod;
  const path = event.path;

  // Tạo mã
  if (method === "POST" && path.includes("/generate")) {
    const code = generateCode();
    const { error } = await supabase.from("codes").insert([{ code }]);
    if (error) return { statusCode: 500, body: JSON.stringify({ success: false, error }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, code }) };
  }

  // Xóa mã
  if (method === "DELETE" && path.includes("/delete")) {
    try {
      const { code } = JSON.parse(event.body || "{}");
      if (!code) {
        return { statusCode: 400, body: JSON.stringify({ success: false, message: "Thiếu code để xóa" }) };
      }
      const { error } = await supabase.from("codes").delete().eq("code", code);
      if (error) return { statusCode: 500, body: JSON.stringify({ success: false, error }) };
      return { statusCode: 200, body: JSON.stringify({ success: true, message: "Đã xóa" }) };
    } catch {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: "Dữ liệu không hợp lệ" }) };
    }
  }

  // Lấy danh sách
  if (method === "GET") {
    const { data, error } = await supabase.from("codes").select("*").order("created_at", { ascending: false });
    if (error) return { statusCode: 500, body: JSON.stringify({ success: false, error }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, codes: data }) };
  }

  return { statusCode: 405, body: JSON.stringify({ success: false, message: "Phương thức không hỗ trợ" }) };
}
