'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/app-store';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { Send, Phone, Image, Camera, X, Check, MapPin } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
}

// ============================================
// ORDER CHAT MODAL
// ============================================
export function OrderChatModal({ open, onClose, orderId, otherPartyName, otherPartyRole }: {
  open: boolean; onClose: () => void;
  orderId: string; otherPartyName: string; otherPartyRole: string;
}) {
  const { currentUserId, db, showToast } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentUser = db.users.find((u) => u.id === currentUserId);

  useEffect(() => {
    // Load messages from localStorage for this order
    try {
      const saved = localStorage.getItem(`chat_${orderId}`);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, [orderId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    try { localStorage.setItem(`chat_${orderId}`, JSON.stringify(msgs)); } catch {}
  };

  const sendMessage = () => {
    if (!input.trim() || !currentUserId || !currentUser) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUser.name,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    saveMessages([...messages, msg]);
    setInput('');

    // Simulate auto-reply after 2s
    setTimeout(() => {
      const replies = [
        'Got it, thanks!',
        'On my way!',
        'I\'ll be there in a few minutes',
        'Order is being prepared',
        'Thank you for the update!',
        'Leaving now 🚗',
        'Almost there!',
      ];
      const reply: ChatMessage = {
        id: `msg_${Date.now()}_reply`,
        senderId: 'other',
        senderName: otherPartyName,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages((prev) => {
        const updated = [...prev, reply];
        try { localStorage.setItem(`chat_${orderId}`, JSON.stringify(updated)); } catch {}
        return updated;
      });
    }, 2000 + Math.random() * 3000);
  };

  const sendPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const msg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: currentUserId!,
        senderName: currentUser?.name || 'You',
        text: '📷 Photo',
        timestamp: new Date().toISOString(),
        type: 'image',
        imageUrl: e.target?.result as string,
      };
      saveMessages([...messages, msg]);
    };
    reader.readAsDataURL(file);
  };

  const sendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const msg: ChatMessage = {
          id: `msg_${Date.now()}`,
          senderId: currentUserId!,
          senderName: currentUser?.name || 'You',
          text: `📍 Location: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          timestamp: new Date().toISOString(),
          type: 'location',
        };
        saveMessages([...messages, msg]);
        showToast('Location shared');
      }, () => showToast('Location unavailable', 'error'));
    }
  };

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Chat with ${otherPartyName}`}>
      <div className="flex flex-col" style={{ height: '70vh', maxHeight: '500px' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-400">{otherPartyName.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{otherPartyName}</div>
            <div className="text-[10px] text-slate-500">{otherPartyRole} • Order #{orderId.slice(-6).toUpperCase()}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm text-slate-400">Send a message to {otherPartyName}</p>
              <p className="text-xs text-slate-600 mt-1">Messages, photos, and locations</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5', isMe ? 'bg-blue-600 rounded-br-md' : 'bg-surface-800 border border-white/5 rounded-bl-md')}>
                  {!isMe && <div className="text-[10px] text-slate-500 mb-0.5">{msg.senderName}</div>}
                  {msg.type === 'image' && msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Photo" className="w-full max-w-[200px] rounded-xl mb-1" />
                  )}
                  <p className={cn('text-sm', isMe ? 'text-white' : 'text-slate-200')}>{msg.text}</p>
                  <p className={cn('text-[9px] mt-1', isMe ? 'text-blue-200/50 text-right' : 'text-slate-600')}>{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5">
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-xl bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700 transition-all">
              <Camera className="w-5 h-5" />
            </button>
            <button onClick={sendLocation} className="p-2.5 rounded-xl bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700 transition-all">
              <MapPin className="w-5 h-5" />
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/30" />
            <button onClick={sendMessage} disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-30">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) sendPhoto(f); e.target.value = ''; }} />
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// DELIVERY PHOTO CAPTURE MODAL
// ============================================
export function DeliveryPhotoModal({ open, onClose, type, onCapture }: {
  open: boolean; onClose: () => void;
  type: 'pickup' | 'delivery';
  onCapture: (photoUrl: string) => void;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setCapturing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(e.target?.result as string);
      setCapturing(false);
    };
    reader.readAsDataURL(file);
  };

  const confirm = () => {
    if (photo) {
      onCapture(photo);
      setPhoto(null);
      onClose();
    }
  };

  const retake = () => {
    setPhoto(null);
    fileRef.current?.click();
  };

  const handleClose = () => { setPhoto(null); onClose(); };

  return (
    <Modal open={open} onClose={handleClose} title={type === 'pickup' ? '📦 Pickup Photo' : '📍 Delivery Photo'}>
      <div className="p-6 space-y-4">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
          <p className="text-xs text-blue-400">
            {type === 'pickup'
              ? 'Take a photo of the order at the pickup location to confirm you have the correct items.'
              : 'Take a photo showing where you left the delivery as proof of completion.'}
          </p>
        </div>

        {photo ? (
          <div className="relative">
            <img src={photo} alt="Captured" className="w-full rounded-2xl border border-white/10" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={retake} className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-16 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/30 transition-all flex flex-col items-center gap-3 group">
            {capturing ? (
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-all">
                  <Camera className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Tap to take photo</p>
                  <p className="text-xs text-slate-500">or select from gallery</p>
                </div>
              </>
            )}
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

        {photo && (
          <div className="flex gap-2">
            <button onClick={retake} className="flex-1 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-all">
              Retake
            </button>
            <button onClick={confirm} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Confirm
            </button>
          </div>
        )}

        {!photo && (
          <p className="text-center text-[10px] text-slate-600">Photo is required to proceed with {type === 'pickup' ? 'pickup' : 'delivery completion'}</p>
        )}
      </div>
    </Modal>
  );
}
