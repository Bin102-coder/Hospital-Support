import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chao! Toi la tro ly ao. Toi co the giup ban dat lich kham hoac tra loi thac mac." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await api("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok) throw new Error("Lỗi " + res.status);
      const data = await res.json();
      let reply = data.reply || "";
      if (data.appointment_id) {
        reply += `\n(Lich kham da duoc tao, ma: ${data.appointment_id})`;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Xin loi, co loi xay ra." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <b>Tro ly ao</b>
            <button className="link" onClick={() => setOpen(false)}>Dong</button>
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "chat-msg user" : "chat-msg bot"}>
                {m.content}
              </div>
            ))}
            {loading && <div className="chat-msg bot">Dang tra loi...</div>}
            <div ref={bottomRef} />
          </div>
          <form className="chat-input-row" onSubmit={send}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Nhap tin nhan..." />
            <button type="submit" className="btn btn-primary" disabled={loading}>Gui</button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Chat">
        Chat
      </button>
    </>
  );
}
