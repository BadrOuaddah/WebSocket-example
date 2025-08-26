import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function Chat() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const clientRef = useRef(null);

  const connect = () => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => {
      setConnected(true);
      client.subscribe("/topic/messages", (msg) => {
        const body = JSON.parse(msg.body);
        setMessages((prev) => [...prev, body]);
      });
    };

    client.onStompError = (err) => console.error("Broker error", err);

    client.activate();
    clientRef.current = client;
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!clientRef.current || !connected || !text.trim()) return;
    const payload = { sender: name || "Anonymous", content: text.trim() };
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });
    setText("");
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "system-ui",
      }}
    >
      <h1>React + Spring WebSocket Chat</h1>
      <div>
        Status: <strong>{connected ? "Connected" : "Disconnected"}</strong>
        <button
          onClick={connected ? disconnect : connect}
          style={{ marginLeft: 8 }}
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Your name: </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type your name"
        />
      </div>

      <div
        style={{
          marginTop: "1rem",
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: "0.5rem",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div>
              <strong>{m.sender}</strong>: {m.content}
            </div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{m.timestamp}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        style={{ marginTop: "1rem", display: "flex", gap: 8 }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
