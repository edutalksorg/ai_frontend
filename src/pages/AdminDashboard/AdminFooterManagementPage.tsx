import React, { useState, useEffect } from 'react';
import {
    Shield,
    Info,
    Star,
    BookOpen,
    Save,
    Image as ImageIcon,
    Loader,
    ArrowLeft,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { settingsService } from '../../services/settingsService';

type FooterTab = 'about' | 'success' | 'blog';

const AdminFooterManagementPage: React.FC = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<FooterTab>('about');
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Dynamic state for content
    const [content, setContent] = useState<any>({
        about: { title: 'About EduTalks', description: '', imageUrl: '', previewUrl: '' },
        success: { title: 'Success Stories', description: '', imageUrl: '', previewUrl: '' },
        blog: { title: 'EduTalks Blog & Logs', description: '', imageUrl: '', previewUrl: '' }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setFetching(true);
            const settings = await settingsService.getSiteSettings();

            const newContent = { ...content };

            // Map settings to state
            if (settings.footer_about) {
                try {
                    newContent.about = typeof settings.footer_about === 'string' ? JSON.parse(settings.footer_about) : settings.footer_about;
                } catch (e) {
                    newContent.about.description = settings.footer_about;
                }
            }
            if (settings.footer_success) {
                try {
                    newContent.success = typeof settings.footer_success === 'string' ? JSON.parse(settings.footer_success) : settings.footer_success;
                } catch (e) {
                    newContent.success.description = settings.footer_success;
                }
            }
            if (settings.footer_blog) {
                try {
                    newContent.blog = typeof settings.footer_blog === 'string' ? JSON.parse(settings.footer_blog) : settings.footer_blog;
                } catch (e) {
                    newContent.blog.description = settings.footer_blog;
                }
            }

            setContent(newContent);
        } catch (error) {
            console.error('Failed to load settings:', error);
            dispatch(showToast({ message: 'Failed to load settings', type: 'error' }));
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async (tab: FooterTab) => {
        try {
            setSaving(true);
            const key = `footer_${tab}`;
            const data = content[tab];

            await settingsService.updateSiteSettings({ [key]: data });

            dispatch(showToast({ message: `${tab === 'about' ? 'About Us' : tab === 'success' ? 'Success Stories' : 'Blog'} content updated successfully`, type: 'success' }));
        } catch (error) {
            dispatch(showToast({ message: 'Failed to update content', type: 'error' }));
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (tab: FooterTab, file: File) => {
        setContent({
            ...content,
            [tab]: {
                ...content[tab],
                imageFile: file,
                previewUrl: URL.createObjectURL(file)
            }
        });
    };

    const tabs = [
        { id: 'about' as FooterTab, label: 'About Us', icon: Info },
        { id: 'success' as FooterTab, label: 'Success Stories', icon: Star },
        { id: 'blog' as FooterTab, label: 'Blogs / Logs', icon: BookOpen },
    ];

    return (
        <AdminLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Back Navigation */}
                    <div className="mb-2">
                        <Link
                            to="/admindashboard"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Shield className="text-indigo-600" /> Footer Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Manage the content and images for your company landing pages.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Editor Area */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: Text Fields */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Page Title
                                        </label>
                                        <input
                                            type="text"
                                            value={content[activeTab].title}
                                            onChange={(e) => setContent({
                                                ...content,
                                                [activeTab]: { ...content[activeTab], title: e.target.value }
                                            })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Description / Content Text
                                            </label>
                                            <Link
                                                to={activeTab === 'about' ? '/about' : activeTab === 'success' ? '/success-stories' : '/blog'}
                                                target="_blank"
                                                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink size={12} /> View Live Page
                                            </Link>
                                        </div>
                                        <textarea
                                            rows={12}
                                            value={content[activeTab].description}
                                            onChange={(e) => setContent({
                                                ...content,
                                                [activeTab]: { ...content[activeTab], description: e.target.value }
                                            })}
                                            placeholder={`Enter ${activeTab} page content here... Use new lines to separate paragraphs.`}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium min-h-[300px]"
                                        />
                                        <div className="bg-indigo-50 dark:bg-indigo-500/5 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                                            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                                                <span className="font-bold">Pro Tip:</span> Our new premium layout automatically formats headers!
                                                Just end a line with a colon (e.g., <span className="font-bold">Our Mission:</span>)
                                                to create a bold section header.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Image Management */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Hero Image
                                    </label>
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 aspect-video flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-500 transition-colors">
                                        {content[activeTab].previewUrl ? (
                                            <>
                                                <img
                                                    src={content[activeTab].previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-slate-400 p-8 text-center">
                                                <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-full">
                                                    <ImageIcon size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-600 dark:text-slate-300">Click to upload banner</p>
                                                    <p className="text-xs">Recommended: 1920x1080px (max 5MB)</p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageChange(activeTab, file);
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <CheckCircle size={14} className="text-green-500" /> This image will be displayed on the {activeTab} page header.
                                    </p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                <Button
                                    onClick={() => handleSave(activeTab)}
                                    disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/20 font-bold gap-2"
                                >
                                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminFooterManagementPage;
