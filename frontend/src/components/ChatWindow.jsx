import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api";

const buildRoomName = (current, peer) =>
  [current, peer].sort((a, b) => a.localeCompare(b)).join("_");

const getWebsocketBase = () => {
  const override = process.env.REACT_APP_WS_BASE?.replace(/\/$/, "");
  if (override) {
    return override;
  }
  const apiBase = process.env.REACT_APP_API_BASE?.replace(/\/api\/?$/, "");
  if (apiBase) {
    return apiBase.replace(/^http/, "ws") + "/ws";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
};

export default function ChatWindow({ currentUser, peerUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [socketError, setSocketError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const pollingRef = useRef(null);

  const roomName = useMemo(
    () => buildRoomName(currentUser.username, peerUser.username),
    [currentUser.username, peerUser.username],
  );

  const fetchHistory = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setHistoryLoading(true);
        }
        const response = await api.get(`chat/messages/${roomName}/`);
        setMessages(response.data);
        setHistoryError("");
      } catch (error) {
        console.error(error);
        if (!silent) {
          setHistoryError("Unable to load previous messages.");
        }
      } finally {
        if (!silent) {
          setHistoryLoading(false);
        }
      }
    },
    [roomName],
  );

  useEffect(() => {
    let isMounted = true;
    setMessages([]);
    fetchHistory();

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    pollingRef.current = setInterval(() => {
      if (isMounted) {
        fetchHistory(true);
      }
    }, 3000);

    return () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchHistory, roomName]);

  const connectWebSocket = useCallback(() => {
    const wsBase = getWebsocketBase();
    try {
      const socket = new WebSocket(`${wsBase}/chat/${roomName}/`);
      socketRef.current = socket;
      setSocketStatus("connecting");
      setSocketError("");

      socket.onopen = () => {
        setSocketStatus("open");
        setSocketError("");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.detail) {
            console.warn(payload.detail);
            return;
          }
          setMessages((prev) => {
            const payloadId = payload.id || payload._id;
            if (
              payloadId &&
              prev.some((msg) => (msg.id || msg._id) === payloadId)
            ) {
              return prev;
            }
            return [...prev, payload];
          });
        } catch (error) {
          console.error("Failed to parse websocket payload", error);
        }
      };

      socket.onerror = (event) => {
        console.error("WebSocket error", event);
        setSocketStatus("error");
        setSocketError("Live connection interrupted. Retrying...");
      };

      socket.onclose = () => {
        setSocketStatus("closed");
        retryTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      };
    } catch (error) {
      console.error("Failed to create WebSocket", error);
      setSocketStatus("error");
      setSocketError("Unable to reach the live server. Retrying...");
      retryTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 2000);
    }
  }, [roomName]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (!container) return;

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      120;

    if (nearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendViaHttp = async (payload) => {
    try {
      const response = await api.post(`chat/messages/${roomName}/`, payload);
      setMessages((prev) => [...prev, response.data]);
      setSocketError("");
    } catch (error) {
      console.error(error);
      setSocketError(
        error.response?.data?.detail ||
          "Unable to send message. Check your connection.",
      );
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const payload = {
      text: trimmed,
      sender: currentUser.username,
    };

    if (socketStatus === "open" && socketRef.current?.readyState === 1) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      sendViaHttp(payload);
    }

    setText("");
  };

  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-2xl border border-purple-100 bg-gradient-to-br from-[#f5f4ff] via-[#edeaff] to-[#fcefff] p-4 text-slate-800 shadow-xl lg:h-full">
      <header className="mb-3 flex items-center justify-between border-b border-white/40 pb-3">
        <div className="flex items-center gap-3">
          {peerUser.avatar ? (
            <img
              src={peerUser.avatar}
              alt={`${peerUser.username} avatar`}
              className="h-12 w-12 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-lg font-semibold text-purple-600">
              {peerUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Chatting with
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {peerUser.username}
            </h3>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            socketStatus === "open"
              ? "bg-emerald-100 text-emerald-700"
              : socketStatus === "connecting"
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700"
          }`}
        >
          {socketStatus === "open"
            ? "Live"
            : socketStatus === "connecting"
              ? "Connecting..."
              : "Offline"}
        </span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-100/60 p-4 pr-3">
        {historyLoading && (
          <p className="text-sm text-white/60">Loading history...</p>
        )}
        {historyError && (
          <p className="rounded border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {historyError}
          </p>
        )}
        {socketError && (
          <p className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-600">
            {socketError}
          </p>
        )}
        {messages.map((message, index) => {
          const mine = message.sender === currentUser.username;
          const createdAt = message.created_at
            ? new Date(message.created_at)
            : null;
          return (
            <div
              key={message.id || message._id || `${message.sender}-${index}`}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow ${
                  mine
                    ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-purple-500/30"
                    : "bg-slate-200 text-slate-800 shadow border border-slate-200"
                }`}
             >
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    mine ? "text-white/80" : "text-purple-400"
                  }`}
                >
                  {mine ? "You" : message.sender}
                </p>
                <p>{message.text}</p>
                {createdAt && (
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <span ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl border border-purple-100 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
