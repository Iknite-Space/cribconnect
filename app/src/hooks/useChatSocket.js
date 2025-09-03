// useChatSocket.js
import { useEffect, useRef, useContext, useCallback} from 'react';
import { AuthContext } from '../context/AuthContext';


export function useChatSocket(thread, onMessage) {
  const ws = useRef(null); 
  const {profile} = useContext(AuthContext)

  const messageQueue = useRef([]);

 const sendMessage = useCallback((threadId, receiverId, content, tempId) => {
      const payload = { 
        thread_id: threadId,
        receiver_id: receiverId, 
        content,
        client_temp_id: tempId
       };
       
       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
       ws.current.send(JSON.stringify(payload));
      //  console.log("Sending WS payload:", payload);
    } else {
      //  console.warn("WS not open, queuing message");
      messageQueue.current.push(payload);
    }
  }, []);

  /**
   * NEW: joinThread sends a signal to subscribe to a specific thread
   * instead of reconnecting the socket entirely.
   */
  const joinThread = useCallback((threadId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const joinPayload = { type: 'join', thread_id: threadId };
      ws.current.send(JSON.stringify(joinPayload));
    }
  }, []);


  useEffect(() => {
    if (!thread || !profile?.user_id) return;
    const user_id = profile.user_id;
    const WS_URL = `wss://api.cribconnect.xyz/v1/users/${user_id}/messages/ws`;
    
    // console.log("Attempting WS connect to:", WS_URL);
    // Create WebSocket connection
    ws.current = new WebSocket(WS_URL);

    // Log when connected
    ws.current.onopen = function () {
      // console.log('Connected to WebSocket=', ws.current.readyState);

      // Flush queued messages
      while (messageQueue.current.length > 0) {
        const msg = messageQueue.current.shift();
        ws.current.send(JSON.stringify(msg));
      }

      // Join thread if available
       if (thread?.thread_id) {
        joinThread(thread.thread_id);
      }
    };

    // Handle incoming messages
    ws.current.onmessage = function (event) {
      // console.log("WS incoming raw:", event.data); 
      try {
        const data = JSON.parse(event.data);
        onMessage(data); // Pass to parent
      } catch (err) {
        // console.error("Failed to parse WS message:", err);
      }
    };

    // Log when disconnected
    ws.current.onclose = function (evt) {
  //    console.warn(
  //   ` WS closed — code: ${evt.code},` + 
  // ` reason: ${evt.reason}, wasClean: ${evt.wasClean}`);
  //     console.log('Disconnected from WebSocket');
    };

    ws.current.onerror = (evt) => {
        // console.error("WS error event:", evt);
    }

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        // console.log("🔌 Closing WS");
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
