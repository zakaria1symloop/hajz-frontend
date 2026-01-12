'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { IoMailOutline, IoMailOpenOutline, IoTrashOutline, IoSearchOutline, IoRefreshOutline } from 'react-icons/io5';
import { HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface PaginatedMessages {
  data: ContactMessage[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    fetchMessages();
  }, [filter, currentPage]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: currentPage.toString() };
      if (filter === 'unread') params.is_read = 'false';
      if (filter === 'read') params.is_read = 'true';
      if (search) params.search = search;

      const response = await api.get('/admin/contact-messages', { params });
      const data = response.data;

      setMessages(data.messages?.data || []);
      setTotalCount(data.total_count || 0);
      setUnreadCount(data.unread_count || 0);
      setCurrentPage(data.messages?.current_page || 1);
      setLastPage(data.messages?.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMessages();
  };

  const handleMarkAsRead = async (message: ContactMessage) => {
    try {
      await api.post(`/admin/contact-messages/${message.id}/read`);
      setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: true } : m));
      setUnreadCount(prev => prev - 1);
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, is_read: true });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAsUnread = async (message: ContactMessage) => {
    try {
      await api.post(`/admin/contact-messages/${message.id}/unread`);
      setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: false } : m));
      setUnreadCount(prev => prev + 1);
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, is_read: false });
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await api.delete(`/admin/contact-messages/${message.id}`);
      setMessages(messages.filter(m => m.id !== message.id));
      setTotalCount(prev => prev - 1);
      if (!message.is_read) setUnreadCount(prev => prev - 1);
      if (selectedMessage?.id === message.id) setSelectedMessage(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await handleMarkAsRead(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 mt-1">
            {totalCount} total messages, {unreadCount} unread
          </p>
        </div>
        <button
          onClick={() => fetchMessages()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <IoRefreshOutline size={18} />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => { setFilter('unread'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => { setFilter('read'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No messages found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-red-50'
                      : message.is_read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${message.is_read ? 'text-gray-400' : 'text-blue-500'}`}>
                      {message.is_read ? <IoMailOpenOutline size={20} /> : <IoMailOutline size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-medium truncate ${message.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {message.name}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{message.email}</p>
                      {message.subject && (
                        <p className={`text-sm truncate mt-1 ${message.is_read ? 'text-gray-600' : 'font-medium text-gray-800'}`}>
                          {message.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 truncate mt-1">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {lastPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                disabled={currentPage === lastPage}
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedMessage.name}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectedMessage.is_read ? handleMarkAsUnread(selectedMessage) : handleMarkAsRead(selectedMessage)}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title={selectedMessage.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {selectedMessage.is_read ? <IoMailOutline size={18} /> : <IoMailOpenOutline size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiOutlineMail size={16} />
                    <a href={`mailto:${selectedMessage.email}`} className="text-blue-500 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiOutlinePhone size={16} />
                      <a href={`tel:${selectedMessage.phone}`} className="text-blue-500 hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="text-gray-400 text-xs">
                    Received: {formatDate(selectedMessage.created_at)}
                  </div>
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="font-medium text-gray-800">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              <div className="flex-1 p-4 overflow-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Reply Button */}
              <div className="p-4 border-t border-gray-100">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message to Hajz'}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  <HiOutlineMail size={18} />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 py-12">
              <div className="text-center">
                <IoMailOutline size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
