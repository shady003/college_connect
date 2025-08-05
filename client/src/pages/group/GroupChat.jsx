import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { newRequest } from "../../utils/newRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./GroupChat.scss";

const SOCKET_SERVER_URL = "http://localhost:3000";

const GroupChat = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Fetch group details
        const groupRes = await newRequest.get(`/groups/${groupId}`);
        setGroup(groupRes.data);
        
        // Fetch existing messages for the group
        const messagesRes = await newRequest.get(`/messages/group/${groupId}`);
        setMessages(messagesRes.data.messages);
        
        // Connect to socket.io server
        socketRef.current = io(SOCKET_SERVER_URL, {
          withCredentials: true,
        });

        // Authenticate user
        const userId = user.id || localStorage.getItem('userId');
        socketRef.current.emit("authenticate", userId);

        // Join the group room
        socketRef.current.emit("joinGroup", groupId);

        // Listen for new messages
        socketRef.current.on("newMessage", (message) => {
          console.log('Received new message:', message);
          if (message.group === groupId) {
            setMessages((prev) => {
              // Avoid duplicate messages by checking timestamp and content
              const exists = prev.some(msg => 
                msg._id === message._id || 
                (msg.content === message.content && 
                 Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
              );
              if (!exists) {
                return [...prev, message];
              }
              return prev;
            });
          }
        });
        
        // Listen for message deletions
        socketRef.current.on("messageDeleted", (messageId) => {
          setMessages((prev) => prev.filter(msg => msg._id !== messageId));
        });
        
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        if (err.response?.status === 403) {
          alert("You don't have access to this group chat.");
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      initializeChat();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveGroup", groupId);
        socketRef.current.disconnect();
      }
    };
  }, [groupId, user, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      // Send message via HTTP request
      const response = await newRequest.post(`/messages/group/${groupId}`, {
        content: messageContent,
        messageType: "text",
        attachments: []
      });
      
      console.log('Message sent successfully:', response.data);
      
      // Optimistically add message to UI if socket doesn't handle it
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageContent,
        sender: { _id: user.id, username: user.username },
        group: groupId,
        createdAt: new Date().toISOString(),
        messageType: "text"
      };
      
      setMessages(prev => {
        const exists = prev.some(msg => msg.content === messageContent && 
          Math.abs(new Date(msg.createdAt) - new Date()) < 2000);
        if (!exists) {
          return [...prev, tempMessage];
        }
        return prev;
      });
      
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
      setNewMessage(messageContent); // Restore message on error
    }
  };
  
  const handleDeleteMessage = async (messageId) => {
    try {
      await newRequest.delete(`/messages/${messageId}`);
      // Remove message from UI immediately
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="group-chat">
      <div className="chat-header glass-card">
        <button onClick={() => navigate(`/group/${groupId}`)} className="btn btn-secondary">
          ← Back to Group
        </button>
        <div className="group-info">
          <h2 className="gradient-text">{group?.name || "Group Chat"}</h2>
          <span>{group?.members?.length || 0} members</span>
        </div>
      </div>
      
      <div className="messages-container glass-card">
        {messages.map((msg) => {
          const currentUserId = user?.id || localStorage.getItem('userId');
          const isOwnMessage = msg.sender?._id === currentUserId;
          
          return (
            <div 
              key={msg._id} 
              className={`message ${isOwnMessage ? 'own-message' : ''}`}
            >
              {!isOwnMessage && (
                <div className="message-avatar">
                  <img 
                    src={msg.sender?.profile_pic || `https://ui-avatars.com/api/?name=${msg.sender?.username}&background=667eea&color=fff&size=32`}
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${msg.sender?.username}&background=667eea&color=fff&size=32`;
                    }}
                  />
                </div>
              )}
              <div className="message-bubble">
                <div className="message-header">
                  <span className="message-sender">{msg.sender?.username || "Unknown"}</span>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                  {isOwnMessage && (
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteMessage(msg._id)}
                      title="Delete message"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input glass-card">
        <div className="input-group">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          />
        </div>
        <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
