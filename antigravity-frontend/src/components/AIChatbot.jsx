import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! I am your AI learning assistant. How can I help you navigate the platform today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userQuery = input.trim();
        setMessages(prev => [...prev, { type: 'user', text: userQuery }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const lowerQuery = userQuery.toLowerCase();
            let botResponse = "I'm sorry, I don't understand that completely. Feel free to explore our courses or contact support!";

            if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('pay')) {
                botResponse = "We recently updated our prices to Indian Rupees (INR)! You can purchase premium courses securely using UPI (Google Pay, PhonePe, Paytm) or any major Credit/Debit card.";
            } else if (lowerQuery.includes('unenroll') || lowerQuery.includes('drop') || lowerQuery.includes('cancel')) {
                botResponse = "You can unenroll from any course! Simply head to your Student Dashboard, and click the 'Drop' button next to the course you wish to leave.";
            } else if (lowerQuery.includes('profile') || lowerQuery.includes('id') || lowerQuery.includes('account')) {
                botResponse = "You can view your user identification and role by clicking your name in the top navigation bar and heading to the newly added 'My Profile' page.";
            } else if (lowerQuery.includes('course') || lowerQuery.includes('enroll') || lowerQuery.includes('learn')) {
                botResponse = "To learn, head over to the Explore tab! You'll find top-tier courses downloaded straight from YouTube playlists. Once enrolled, you can access the powerful web video player.";
            } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
                botResponse = "Hi there! I'm here to answer any questions about the Antigravity LMS layout, payments, profiles, or course functionality.";
            }

            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2 font-bold">
                            <Bot size={20} /> AI Assistant
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'bot' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
                                    {msg.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-[42px]">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about the platform..."
                                className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                                <Send size={14} className="-ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default AIChatbot;
