import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Loader,
    Plus,
    Edit,
    Trash2,
    Search,
    Image as ImageIcon,
    ExternalLink,
    Move,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { showToast } from '../../store/uiSlice';
import { carouselService, CarouselItem } from '../../services/carouselService';
import { getStorageUrl } from '../../services/api';

const AdminCarouselPage: React.FC = () => {
    const dispatch = useDispatch();
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        redirectUrl: '',
        displayOrder: 0,
        isActive: true,
        imageFile: null as File | null,
        previewUrl: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await carouselService.getAdminItems();
            setItems(data);
        } catch (error) {
            console.error(error);
            dispatch(showToast({ message: 'Failed to load carousel items', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: CarouselItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || '',
                description: item.description || '',
                redirectUrl: item.redirect_url || '',
                displayOrder: item.display_order,
                isActive: item.is_active,
                imageFile: null,
                previewUrl: getStorageUrl(item.image_url || item.imageUrl || '')
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                description: '',
                redirectUrl: '',
                displayOrder: items.length + 1,
                isActive: true,
                imageFile: null,
                previewUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this slide?')) return;
        try {
            await carouselService.deleteItem(id);
            dispatch(showToast({ message: 'Slide deleted', type: 'success' }));
            fetchItems();
        } catch (error) {
            dispatch(showToast({ message: 'Failed to delete slide', type: 'error' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const form = new FormData();
            form.append('title', formData.title);
            form.append('description', formData.description);
            form.append('redirectUrl', formData.redirectUrl);
            form.append('displayOrder', String(formData.displayOrder));
            form.append('isActive', String(formData.isActive));
            if (formData.imageFile) {
                form.append('image', formData.imageFile); // Assuming backend expects 'image' field
            }

            if (editingItem) {
                // Determine ID (backend returns id as number/string)
                await carouselService.updateItem(editingItem.id, form);
                dispatch(showToast({ message: 'Slide updated', type: 'success' }));
            } else {
                if (!formData.imageFile) {
                    dispatch(showToast({ message: 'Please upload an image', type: 'error' }));
                    setSubmitting(false);
                    return;
                }
                await carouselService.createItem(form);
                dispatch(showToast({ message: 'Slide created', type: 'success' }));
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            console.error(error);
            dispatch(showToast({ message: 'Operation failed', type: 'error' }));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = items.filter(item =>
        (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Carousel Manager</h1>
                            <p className="text-slate-500 dark:text-slate-400">Manage the sliding banners on the user dashboard.</p>
                        </div>
                        <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Plus size={20} /> Add New Slide
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search slides..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader className="animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
                                    <div className="relative h-48 bg-slate-100 dark:bg-slate-900">
                                        <img
                                            src={getStorageUrl(item.image_url || item.imageUrl || '')}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image' }}
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 bg-white/90 text-indigo-600 rounded-full hover:bg-white shadow">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white shadow">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                            <Move size={12} /> Order: {item.display_order}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate pr-2">{item.title}</h3>
                                            {item.is_active ?
                                                <span className="text-green-500" title="Active"><CheckCircle size={18} /></span> :
                                                <span className="text-slate-400" title="Inactive"><XCircle size={18} /></span>
                                            }
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3 h-10">
                                            {item.description || 'No description'}
                                        </p>
                                        {item.redirect_url && (
                                            <div className="flex items-center text-xs text-indigo-500 dark:text-indigo-400 gap-1 truncate">
                                                <ExternalLink size={12} />
                                                <a href={item.redirect_url} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-full">
                                                    {item.redirect_url}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h2 className="text-xl font-bold dark:text-white">
                                        {editingItem ? 'Edit Slide' : 'New Slide'}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Banner Image</label>
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors relative group">
                                            {formData.previewUrl ? (
                                                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                                                    <img src={formData.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <span className="text-white font-medium">Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-6 text-slate-500 cursor-pointer">
                                                    <ImageIcon size={32} className="mb-2" />
                                                    <span>Click to upload image</span>
                                                    <span className="text-xs mt-1 text-slate-400">Recommended: 1200x400 px</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setFormData({
                                                            ...formData,
                                                            imageFile: file,
                                                            previewUrl: URL.createObjectURL(file)
                                                        });
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Order</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                                                value={formData.displayOrder}
                                                onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                        <textarea
                                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white h-20"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Redirect URL (Optional)</label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white"
                                            value={formData.redirectUrl}
                                            onChange={e => setFormData({ ...formData, redirectUrl: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active / Visible</label>
                                    </div>

                                    <div className="flex gap-3 pt-4 justify-end">
                                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                                        <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                            {submitting ? <Loader className="animate-spin" size={18} /> : <Save size={18} className="mr-2" />}
                                            {editingItem ? 'Update Slide' : 'Create Slide'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCarouselPage;
