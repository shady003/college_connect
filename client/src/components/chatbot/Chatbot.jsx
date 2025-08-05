import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.scss';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your CollegeConnect assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! Welcome to CollegeConnect! How can I assist you today?";
    } else if (lowerMessage.includes('group')) {
      return "You can join groups by going to the Explore page or All Groups tab. Look for groups that match your interests!";
    } else if (lowerMessage.includes('resource')) {
      return "You can share resources by clicking 'Share Resource' on your dashboard. Upload study materials to help other students!";
    } else if (lowerMessage.includes('event')) {
      return "Events are listed in the Events section. You can attend workshops, seminars, and competitions!";
    } else if (lowerMessage.includes('help')) {
      return "I can help you with: joining groups, sharing resources, attending events, and navigating the platform.";
    } else {
      return "I'm here to help with CollegeConnect! Ask me about groups, resources, events, or general help.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { id: Date.now(), text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = { id: Date.now() + 1, text: getBotResponse(inputMessage), sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className={`chatbot ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle btn btn-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-window glass-card">
          <div className="chatbot-header">
            <h4 className="gradient-text">CollegeConnect Assistant</h4>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <div className="message-content">{message.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="message-content">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <div className="input-group">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            </div>
            <button onClick={handleSendMessage} className="btn btn-primary">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;