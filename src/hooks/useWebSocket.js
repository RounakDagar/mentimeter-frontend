import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export const useWebSocket = (joinCode) => {
  const { token } = useAuth();
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const subscriptions = useRef({});
  const messageQueue = useRef([]);

  useEffect(() => {
    if (!joinCode || !token) return;

    const wsUrl = `ws://localhost:8080/ws`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      // Send STOMP CONNECT frame
      const connectFrame = `CONNECT\nAuthorization:Bearer ${token}\naccept-version:1.2\n\n\0`;
      websocket.send(connectFrame);
    };

    websocket.onmessage = (event) => {
      const message = event.data;
      
      // Check if it's a CONNECTED frame
      if (message.startsWith('CONNECTED')) {
        setConnected(true);
        // Send any queued messages
        messageQueue.current.forEach(msg => websocket.send(msg));
        messageQueue.current = [];
        return;
      }

      // Parse MESSAGE frames
      if (message.startsWith('MESSAGE')) {
        const lines = message.split('\n');
        let destination = '';
        let bodyStart = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('destination:')) {
            destination = lines[i].substring(12);
          }
          if (lines[i] === '') {
            bodyStart = i + 1;
            break;
          }
        }
        
        if (bodyStart > 0 && destination) {
          const body = lines.slice(bodyStart).join('\n').replace(/\0$/, '');
          try {
            const data = JSON.parse(body);
            if (subscriptions.current[destination]) {
              subscriptions.current[destination].forEach(callback => callback(data));
            }
          } catch (e) {
            console.error('Failed to parse message body:', e);
          }
        }
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    websocket.onclose = () => {
      setConnected(false);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        const disconnectFrame = `DISCONNECT\n\n\0`;
        websocket.send(disconnectFrame);
      }
      websocket.close();
    };
  }, [joinCode, token]);

  const subscribe = (destination, callback) => {
    if (!subscriptions.current[destination]) {
      subscriptions.current[destination] = [];
      
      if (ws && connected) {
        const subscribeFrame = `SUBSCRIBE\nid:sub-${Date.now()}\ndestination:${destination}\n\n\0`;
        ws.send(subscribeFrame);
      }
    }
    
    subscriptions.current[destination].push(callback);

    return () => {
      const callbacks = subscriptions.current[destination];
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  };

  const send = (destination, body) => {
    const sendFrame = `SEND\ndestination:${destination}\ncontent-type:application/json\n\n${JSON.stringify(body)}\0`;
    
    if (ws && connected && ws.readyState === WebSocket.OPEN) {
      ws.send(sendFrame);
    } else {
      messageQueue.current.push(sendFrame);
    }
  };

  return { ws, connected, subscribe, send };

};