import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from './context/ThemeContext';

const ManageGames = ({ user }) => {
  const { theme } = useTheme();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'requirements', 'media', 'social', 'vouchers'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    imageUrl: '',
    categoryNames: '',
    screenshots: '',
    isEarlyAccess: false,
    contentRating: 'EVERYONE',
    minRequirements: '',
    recRequirements: '',
    socialLinks: ''
  });
  const [vouchers, setVouchers] = useState([]);
  const [voucherData, setVoucherData] = useState({
    code: '',
    discountPercent: '',
    maxUses: 100,
    expiryDate: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [isUploading, setIsUploading] = useState(false);

  // Patch Notes State
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false);
  const [patchData, setPatchData] = useState({
      gameId: null,
      title: '',
      content: '',
      version: '',
      type: 'UPDATE'
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [reqFields, setReqFields] = useState({
    min: { os: '', cpu: '', ram: '', gpu: '', storage: '' },
    rec: { os: '', cpu: '', ram: '', gpu: '', storage: '' }
  });

  useEffect(() => {
    fetchGames(currentPage);
    fetchVouchers();
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setAvailableCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchVouchers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/vouchers/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch vouchers', err);
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/vouchers', voucherData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Voucher created successfully');
      setVoucherData({ code: '', discountPercent: '', maxUses: 100, expiryDate: '' });
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create voucher');
    }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm('Delete this voucher?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Voucher deleted');
      fetchVouchers();
    } catch (err) {
      toast.error('Failed to delete voucher');
    }
  };

  const fetchGames = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/games?page=${page}&limit=${limit}`);
      setGames(res.data?.data?.games || []);
      setTotalPages(res.data?.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch games', err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (categoryName) => {
    const currentCats = formData.categoryNames ? formData.categoryNames.split(',').map(s => s.trim()).filter(s => s) : [];
    if (currentCats.includes(categoryName)) {
        setFormData({ ...formData, categoryNames: currentCats.filter(c => c !== categoryName).join(', ') });
    } else {
        setFormData({ ...formData, categoryNames: [...currentCats, categoryName].join(', ') });
    }
  };

  const handleReqChange = (type, field, value) => {
    setReqFields(prev => ({
        ...prev,
        [type]: { ...prev[type], [field]: value }
    }));
  };

  const formatRequirements = (reqObj) => {
      const parts = [];
      if (reqObj.os) parts.push(`OS: ${reqObj.os}`);
      if (reqObj.cpu) parts.push(`Processor: ${reqObj.cpu}`);
      if (reqObj.ram) parts.push(`Memory: ${reqObj.ram}`);
      if (reqObj.gpu) parts.push(`Graphics: ${reqObj.gpu}`);
      if (reqObj.storage) parts.push(`Storage: ${reqObj.storage}`);
      return parts.join('\n');
  };

  const parseRequirements = (reqString) => {
      const parsed = { os: '', cpu: '', ram: '', gpu: '', storage: '' };
      if (!reqString) return parsed;
      
      const lines = reqString.split('\n');
      lines.forEach(line => {
          if (line.startsWith('OS:')) parsed.os = line.replace('OS:', '').trim();
          else if (line.startsWith('Processor:')) parsed.cpu = line.replace('Processor:', '').trim();
          else if (line.startsWith('Memory:')) parsed.ram = line.replace('Memory:', '').trim();
          else if (line.startsWith('Graphics:')) parsed.gpu = line.replace('Graphics:', '').trim();
          else if (line.startsWith('Storage:')) parsed.storage = line.replace('Storage:', '').trim();
      });
      return parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    let finalImageUrl = formData.imageUrl;
    let finalScreenshots = formData.screenshots.split(',').map(s => s.trim()).filter(s => s);

    // Format requirements
    const finalMinReq = formatRequirements(reqFields.min);
    const finalRecReq = formatRequirements(reqFields.rec);

    try {
      if (uploadMode === 'file') {
        if (imageFile) {
          const uploadFormData = new FormData();
          uploadFormData.append('image', imageFile);
          setIsUploading(true);
          const uploadRes = await axios.post('/api/upload', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
          });
          finalImageUrl = uploadRes.data.data.url;
        }

        if (screenshotFiles.length > 0) {
          setIsUploading(true);
          const screenshotUrls = await Promise.all(screenshotFiles.map(async (file) => {
            const fd = new FormData();
            fd.append('image', file);
            const res = await axios.post('/api/upload', fd, {
              headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            return res.data.data.url;
          }));
          finalScreenshots = [...finalScreenshots, ...screenshotUrls];
        }
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        screenshots: finalScreenshots,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        categoryNames: formData.categoryNames.split(',').map(s => s.trim()).filter(s => s),
        isEarlyAccess: formData.isEarlyAccess,
        contentRating: formData.contentRating,
        minRequirements: finalMinReq,
        recRequirements: finalRecReq,
        socialLinks: formData.socialLinks
      };

      if (isEditing) {
        await axios.put(`/api/games/${currentId}`, payload, config);
        toast.success('Game updated successfully');
      } else {
        await axios.post('/api/games', payload, config);
        toast.success('Game created successfully');
      }
      resetForm();
      fetchGames();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (game) => {
    setIsEditing(true);
    setCurrentId(game.id);
    setFormData({
      title: game.title,
      description: game.description,
      price: game.price,
      discount: game.discount || 0,
      imageUrl: game.imageUrl || '',
      categoryNames: game.categories ? game.categories.map(c => c.name).join(', ') : '',
      screenshots: game.screenshots ? game.screenshots.map(s => s.url).join(', ') : '',
      isEarlyAccess: game.isEarlyAccess || false,
      contentRating: game.contentRating || 'EVERYONE',
      minRequirements: game.minRequirements || '',
      recRequirements: game.recRequirements || '',
      socialLinks: game.socialLinks || ''
    });
    setReqFields({
        min: parseRequirements(game.minRequirements || ''),
        rec: parseRequirements(game.recRequirements || '')
    });
    setActiveTab('general');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Game deleted successfully');
      fetchGames();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setImageFile(null);
    setScreenshotFiles([]);
    setFormData({
      title: '',
      description: '',
      price: '',
      discount: '',
      imageUrl: '',
      categoryNames: '',
      screenshots: '',
      isEarlyAccess: false,
      contentRating: 'EVERYONE',
      minRequirements: '',
      recRequirements: '',
      socialLinks: ''
    });
    setReqFields({
        min: { os: '', cpu: '', ram: '', gpu: '', storage: '' },
        rec: { os: '', cpu: '', ram: '', gpu: '', storage: '' }
    });
    setActiveTab('general');
  };

  const handlePostPatch = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
          await axios.post('/api/game-updates', patchData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Patch note posted successfully!');
          setIsPatchModalOpen(false);
          setPatchData({ gameId: null, title: '', content: '', version: '', type: 'UPDATE' });
      } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to post patch note');
      }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme.colors.text} ${theme.colors.bg} min-h-screen`}>
      <h2 className={`text-3xl font-bold mb-6 ${theme.colors.accent} border-b ${theme.colors.border} pb-2`}>Manage Games</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`${theme.colors.card} rounded-3xl shadow-2xl border ${theme.colors.border} overflow-hidden`}>
            {/* Tab Navigation */}
            <div className="flex bg-white/5 border-b border-white/5">
              {['general', 'requirements', 'media', 'social', 'vouchers'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'vouchers' ? (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-black italic">Voucher <span className="text-blue-500">Manager</span></h3>
                  <form onSubmit={handleCreateVoucher} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Code</label>
                        <input 
                          value={voucherData.code}
                          onChange={e => setVoucherData({...voucherData, code: e.target.value.toUpperCase()})}
                          placeholder="SUMMER25"
                          required
                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Discount %</label>
                        <input 
                          type="number"
                          value={voucherData.discountPercent}
                          onChange={e => setVoucherData({...voucherData, discountPercent: e.target.value})}
                          placeholder="20"
                          required
                          min="1" max="100"
                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Max Uses</label>
                        <input 
                          type="number"
                          value={voucherData.maxUses}
                          onChange={e => setVoucherData({...voucherData, maxUses: e.target.value})}
                          required
                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Expiry Date</label>
                        <input 
                          type="date"
                          value={voucherData.expiryDate}
                          onChange={e => setVoucherData({...voucherData, expiryDate: e.target.value})}
                          required
                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all">
                      Create Voucher
                    </button>
                  </form>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">My Active Vouchers</h4>
                    {vouchers.length === 0 ? (
                      <p className="text-center py-6 opacity-30 text-xs italic">No vouchers created yet.</p>
                    ) : (
                      vouchers.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-blue-500">{v.code}</span>
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">-{v.discountPercent}%</span>
                            </div>
                            <div className="text-[9px] opacity-40 font-bold uppercase mt-1">
                              Uses: {v.usedCount}/{v.maxUses} • Expires: {new Date(v.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteVoucher(v.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                  {activeTab === 'general' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Game Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} required className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500`} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 h-32 resize-none`} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Price ($)</label>
                          <input type="number" name="price" value={formData.price} onChange={handleChange} required className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500`} step="0.01" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Discount (%)</label>
                          <input type="number" name="discount" value={formData.discount} onChange={handleChange} className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500`} min="0" max="100" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-2">Categories</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white/5 p-4 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                            {availableCategories.map(cat => {
                                const isSelected = formData.categoryNames && formData.categoryNames.includes(cat.name);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat.name)}
                                        className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${
                                            isSelected 
                                            ? 'bg-blue-600 border-blue-500 text-white' 
                                            : `${theme.colors.bg} border-white/10 opacity-60 hover:opacity-100`
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                        {availableCategories.length === 0 && <p className="text-[10px] opacity-40 mt-1 italic">No categories found. Admin needs to add them.</p>}
                      </div>
                    </div>
                  )}

                  {activeTab === 'requirements' && (
                    <div className="space-y-6">
                      {['min', 'rec'].map(type => (
                          <div key={type} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                              <h4 className={`text-sm font-black uppercase tracking-widest mb-4 ${type === 'min' ? 'text-blue-500' : 'text-purple-500'}`}>
                                  {type === 'min' ? 'Minimum' : 'Recommended'} Specs
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="col-span-full">
                                      <label className="block text-[10px] font-black uppercase opacity-40 mb-1">OS</label>
                                      <input 
                                          value={reqFields[type].os} 
                                          onChange={e => handleReqChange(type, 'os', e.target.value)} 
                                          placeholder="e.g. Windows 10 64-bit"
                                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`} 
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Processor (CPU)</label>
                                      <input 
                                          value={reqFields[type].cpu} 
                                          onChange={e => handleReqChange(type, 'cpu', e.target.value)} 
                                          placeholder="e.g. Intel Core i5"
                                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`} 
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Memory (RAM)</label>
                                      <input 
                                          value={reqFields[type].ram} 
                                          onChange={e => handleReqChange(type, 'ram', e.target.value)} 
                                          placeholder="e.g. 8 GB RAM"
                                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`} 
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Graphics (GPU)</label>
                                      <input 
                                          value={reqFields[type].gpu} 
                                          onChange={e => handleReqChange(type, 'gpu', e.target.value)} 
                                          placeholder="e.g. GTX 1060"
                                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`} 
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Storage</label>
                                      <input 
                                          value={reqFields[type].storage} 
                                          onChange={e => handleReqChange(type, 'storage', e.target.value)} 
                                          placeholder="e.g. 50 GB available space"
                                          className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`} 
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-2">Game Image (Cover)</label>
                        <div className="flex gap-2 mb-3">
                          <button type="button" onClick={() => setUploadMode('url')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${uploadMode === 'url' ? 'bg-blue-600 text-white' : 'bg-white/5 opacity-40'}`}>URL</button>
                          <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${uploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-white/5 opacity-40'}`}>Upload</button>
                        </div>
                        {uploadMode === 'url' ? (
                          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500`} />
                        ) : (
                          <div className={`border-2 border-dashed ${theme.colors.border} rounded-2xl p-6 text-center hover:border-blue-500 transition-all`}>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" id="cover-upload" />
                            <label htmlFor="cover-upload" className="cursor-pointer text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">
                              {imageFile ? `Selected: ${imageFile.name}` : 'Click to select cover image'}
                            </label>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Screenshots</label>
                        {uploadMode === 'url' ? (
                          <textarea name="screenshots" value={formData.screenshots} onChange={handleChange} placeholder="URL1, URL2..." className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500 h-24 resize-none`} />
                        ) : (
                          <div className={`border-2 border-dashed ${theme.colors.border} rounded-2xl p-6 text-center hover:border-blue-500 transition-all`}>
                            <input type="file" multiple accept="image/*" onChange={e => setScreenshotFiles(Array.from(e.target.files))} className="hidden" id="screens-upload" />
                            <label htmlFor="screens-upload" className="cursor-pointer text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">
                              {screenshotFiles.length > 0 ? `${screenshotFiles.length} files selected` : 'Click to select screenshots'}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'social' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Content Rating</label>
                        <select name="contentRating" value={formData.contentRating} onChange={handleChange} className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500`}>
                          <option value="EVERYONE">Everyone</option>
                          <option value="TEEN">Teen (13+)</option>
                          <option value="MATURE">Mature (17+)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <input type="checkbox" name="isEarlyAccess" checked={formData.isEarlyAccess} onChange={e => setFormData({...formData, isEarlyAccess: e.target.checked})} className="w-5 h-5 rounded-lg bg-blue-600" />
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Early Access Game</label>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-1">Social Links (JSON or Text)</label>
                        <textarea name="socialLinks" value={formData.socialLinks} onChange={handleChange} placeholder="Discord: https://..., Twitter: https://..." className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500 h-24 resize-none`} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button type="submit" disabled={isUploading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20">
                      {isUploading ? 'Saving...' : (isEditing ? 'Update Game' : 'Create Game')}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetForm} className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-2xl font-black italic">Existing <span className="text-blue-500">Games</span></h3>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{games.length} Games Total</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
               <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500`}></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {games.map(game => (
                  <div key={game.id} className={`${theme.colors.card} p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 border ${theme.colors.border} hover:border-blue-500/50 transition-all shadow-xl group`}>
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="relative">
                        {game.imageUrl ? (
                          <img src={game.imageUrl} alt={game.title} className="w-24 h-24 object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black opacity-10">?</div>
                        )}
                        {game.isEarlyAccess && (
                          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[8px] font-black px-2 py-1 rounded-lg shadow-lg uppercase">Early</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-black text-xl ${theme.colors.text} truncate`}>{game.title}</h4>
                          <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{game.contentRating}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mb-3">
                          <span className="font-black text-blue-500">${game.price}</span>
                          {game.discount > 0 && <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-black">-{game.discount}%</span>}
                          <span className="opacity-30 font-bold">/</span>
                          <span className="opacity-40 font-bold truncate">{game.categories?.map(c => c.name).join(', ')}</span>
                        </div>
                        
                        {game.screenshots && game.screenshots.length > 0 && (
                          <div className="flex gap-2">
                            {game.screenshots.slice(0, 4).map((s, idx) => (
                              <img key={idx} src={s.url} alt="screenshot" className="w-10 h-10 object-cover rounded-lg border border-white/5" />
                            ))}
                            {game.screenshots.length > 4 && <span className="text-[10px] font-black opacity-30 flex items-center">+{game.screenshots.length - 4}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 w-full md:w-auto">
                      {(user.role === 'ADMIN' || (game.publisher && game.publisher.id === user.id)) && (
                        <>
                          <button 
                            onClick={() => {
                                setPatchData({ ...patchData, gameId: game.id });
                                setIsPatchModalOpen(true);
                            }}
                            className="flex-1 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                              <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> Update
                          </button>
                          <button onClick={() => handleEdit(game)} className="flex-1 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit</button>
                          <button onClick={() => handleDelete(game.id)} className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI for Admin */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 ${theme.colors.card} ${theme.colors.text} rounded text-sm disabled:opacity-30 border ${theme.colors.border}`}
                  >
                    Prev
                  </button>
                  <span className="text-sm opacity-50">Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 ${theme.colors.card} ${theme.colors.text} rounded text-sm disabled:opacity-30 border ${theme.colors.border}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Patch Note Modal */}
      {isPatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className={`${theme.colors.card} border ${theme.colors.border} rounded-xl shadow-2xl max-w-2xl w-full p-8 animate-fadeIn`}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-2xl font-bold ${theme.colors.text}`}>Post Game Update</h3>
                      <button onClick={() => setIsPatchModalOpen(false)} className="opacity-50 hover:opacity-100 transition text-2xl">
                          <FontAwesomeIcon icon={faTimes} />
                      </button>
                  </div>

                  <form onSubmit={handlePostPatch} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Update Title</label>
                              <input 
                                  value={patchData.title}
                                  onChange={e => setPatchData({...patchData, title: e.target.value})}
                                  required
                                  placeholder="e.g. The Big Summer Update"
                                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition`}
                              />
                          </div>
                          <div>
                              <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Version</label>
                              <input 
                                  value={patchData.version}
                                  onChange={e => setPatchData({...patchData, version: e.target.value})}
                                  placeholder="e.g. v1.2.4"
                                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition`}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Update Type</label>
                              <select 
                                  value={patchData.type}
                                  onChange={e => setPatchData({...patchData, type: e.target.value})}
                                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition`}
                              >
                                  <option value="UPDATE">Standard Update</option>
                                  <option value="HOTFIX">Hotfix / Bugfix</option>
                                  <option value="DLC">DLC / Content Pack</option>
                                  <option value="ANNOUNCEMENT">Announcement</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Content / Patch Notes</label>
                          <textarea 
                              value={patchData.content}
                              onChange={e => setPatchData({...patchData, content: e.target.value})}
                              required
                              placeholder="Describe what's new in this version..."
                              className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition h-48`}
                          />
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition"
                          >
                              Post Update
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsPatchModalOpen(false)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded-lg transition"
                          >
                              Cancel
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ManageGames;
