// useChatSocket.js
import { useEffect, useRef, useContext, useCallback} from 'react';
import { AuthContext } from '../context/AuthContext';


export function useChatSocket(thread, onMessage) {
  const ws = useRef(null); // Store WebSocket instance
  const {profile} = useContext(AuthContext)
  // console.log("profile",profile?.user_id)

 const sendMessage = useCallback((threadId, receiverId, content) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const payload = { thread_id: threadId, receiver_id: receiverId, content };
      console.log("📤 Sending WS payload:", payload); // Debug outbound
      ws.current.send(JSON.stringify(payload));
    } else {
      console.warn("⚠️ Cannot send — WS not open");
    }
  }, []);

  /**
   * NEW: joinThread sends a signal to subscribe to a specific thread
   * instead of reconnecting the socket entirely.
   */
  const joinThread = useCallback((threadId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const joinPayload = { type: 'join', thread_id: threadId };
      console.log("📡 Joining thread:", joinPayload);
      ws.current.send(JSON.stringify(joinPayload));
    }
  }, []);


  useEffect(() => {
    if (!thread || !profile?.user_id) return;

    // const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const user_id = profile.user_id;
    // build the exact same host + path your server serves
    const WS_URL = `wss://api.cribconnect.xyz/v1/user/${user_id}/messages`;
    
    console.log("👉 Attempting WS connect to:", WS_URL);
    // Create WebSocket connection
    ws.current = new WebSocket(WS_URL);

    // Log when connected
    ws.current.onopen = function () {
      console.log('Connected to WebSocket=', ws.current.readyState);
       if (thread?.thread_id) {
        joinThread(thread.thread_id);
      }
    };

    // Handle incoming messages
    ws.current.onmessage = function (event) {
      console.log("📥 WS incoming raw:", event.data); // Debug inbound
      try {
        const data = JSON.parse(event.data);
        onMessage(data); // Pass to parent
      } catch (err) {
        console.error("❌ Failed to parse WS message:", err);
      }
    };

    // Log when disconnected
    ws.current.onclose = function (evt) {
     console.warn(
    `🛑 WS closed — code: ${evt.code},` + 
  ` reason: ${evt.reason}, wasClean: ${evt.wasClean}`);
      console.log('Disconnected from WebSocket');
    };

    ws.current.onerror = (evt) => {
        console.error("❌ WS error event:", evt);
    }

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        console.log("🔌 Closing WS");
        ws.current.close();
      }
    };
  }, [onMessage, thread, profile?.user_id, joinThread]); // Reconnect if userId changes

  useEffect(() => {
      if (thread?.thread_id) {
        joinThread(thread.thread_id);
      }
    }, [thread?.thread_id, joinThread]);
  return { sendMessage, profile};
}
