'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { IoDocumentTextOutline, IoSaveOutline } from 'react-icons/io5';

interface LegalContent {
  privacy_policy_en: string;
  privacy_policy_ar: string;
  privacy_policy_fr: string;
  terms_of_use_en: string;
  terms_of_use_ar: string;
  terms_of_use_fr: string;
}

export default function AdminLegalPage() {
  const [content, setContent] = useState<LegalContent>({
    privacy_policy_en: '',
    privacy_policy_ar: '',
    privacy_policy_fr: '',
    terms_of_use_en: '',
    terms_of_use_ar: '',
    terms_of_use_fr: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
  const [activeLang, setActiveLang] = useState<'en' | 'ar' | 'fr'>('en');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/admin/legal');
      if (response.data) {
        setContent(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch legal content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/legal', content);
      alert('Legal content saved successfully');
    } catch (err) {
      console.error('Failed to save legal content:', err);
      alert('Failed to save legal content');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentField = (): keyof LegalContent => {
    return `${activeTab === 'privacy' ? 'privacy_policy' : 'terms_of_use'}_${activeLang}` as keyof LegalContent;
  };

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'en': return 'English';
      case 'ar': return 'Arabic';
      case 'fr': return 'French';
      default: return lang;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
          <p className="text-gray-500 mt-1">Manage Privacy Policy and Terms of Use content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          <IoSaveOutline size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Page Type Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'bg-red-50 text-red-600 border-b-2 border-red-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IoDocumentTextOutline size={18} />
              Privacy Policy
            </div>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'terms'
                ? 'bg-red-50 text-red-600 border-b-2 border-red-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IoDocumentTextOutline size={18} />
              Terms of Use
            </div>
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200">
          {(['en', 'ar', 'fr'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeLang === lang
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {getLanguageName(lang)}
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Use'} - {getLanguageName(activeLang)}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              You can use HTML tags for formatting: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
            </p>
            <textarea
              value={content[getCurrentField()]}
              onChange={(e) => setContent({ ...content, [getCurrentField()]: e.target.value })}
              rows={20}
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm resize-none"
              placeholder={`Enter ${activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Use'} content in ${getLanguageName(activeLang)}...`}
            />
          </div>

          {/* Preview */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div
              dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
              className="bg-white border border-gray-200 rounded-xl p-6 prose prose-gray max-w-none min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: content[getCurrentField()] || '<p class="text-gray-400">No content yet...</p>' }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for writing legal content:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>- Use &lt;h2&gt; tags for section headings</li>
          <li>- Use &lt;p&gt; tags for paragraphs</li>
          <li>- Use &lt;ul&gt; and &lt;li&gt; for bullet lists</li>
          <li>- Use &lt;strong&gt; for bold text</li>
          <li>- Make sure to provide content in all three languages</li>
        </ul>
      </div>
    </div>
  );
}
