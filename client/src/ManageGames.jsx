import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const ManageGames = ({ user }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    imageUrl: '',
    categoryNames: '' // comma separated for input
  });
  const [imageFile, setImageFile] = useState(null);
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

  useEffect(() => {
    fetchGames(currentPage);
  }, [currentPage]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    let finalImageUrl = formData.imageUrl;

    try {
      if (uploadMode === 'file' && imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        setIsUploading(true);
        try {
          const uploadRes = await axios.post('/api/upload', uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          finalImageUrl = uploadRes.data.data.url;
        } catch (uploadErr) {
          console.error(uploadErr);
          toast.error('Image upload failed, falling back to existing URL');
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        categoryNames: formData.categoryNames.split(',').map(s => s.trim()).filter(s => s)
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
      categoryNames: game.categories ? game.categories.map(c => c.name).join(', ') : ''
    });
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
    setFormData({
      title: '',
      description: '',
      price: '',
      discount: '',
      imageUrl: '',
      categoryNames: ''
    });
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
    <div className="container mx-auto px-4 py-8 text-white bg-steam-dark min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-steam-accent border-b border-gray-700 pb-2">Manage Games</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="bg-steam-light p-6 rounded-lg shadow-lg border border-gray-700 h-fit">
          <h3 className="text-xl font-semibold mb-4 text-white">{isEditing ? 'Edit Game' : 'Add New Game'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none h-24" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Price</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none" step="0.01" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Discount (%)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none" min="0" max="100" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Game Image</label>
              <div className="flex gap-4 mb-2">
                <button 
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1 rounded text-sm ${uploadMode === 'url' ? 'bg-steam-accent text-white' : 'bg-gray-700 text-gray-400'}`}
                >
                  Image URL
                </button>
                <button 
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 rounded text-sm ${uploadMode === 'file' ? 'bg-steam-accent text-white' : 'bg-gray-700 text-gray-400'}`}
                >
                  Upload File
                </button>
              </div>

              {uploadMode === 'url' ? (
                <input 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none"
                />
              ) : (
                <div className="border border-dashed border-gray-600 rounded p-4 text-center hover:border-steam-accent transition">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="w-full text-gray-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-steam-accent file:text-white hover:file:bg-blue-500"
                  />
                  {imageFile && <div className="text-green-400 text-xs mt-2">Selected: {imageFile.name}</div>}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Categories (comma separated)</label>
              <input name="categoryNames" value={formData.categoryNames} onChange={handleChange} placeholder="Action, RPG, Indie" className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none" />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                disabled={isUploading}
                className="flex-1 bg-steam-accent hover:bg-blue-400 text-white font-bold py-2 rounded transition disabled:opacity-50"
              >
                {isUploading ? 'Uploading & Saving...' : (isEditing ? 'Update Game' : 'Create Game')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold mb-4 text-white">Existing Games</h3>
          
          {loading ? (
            <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-steam-accent"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {games.map(game => (
                  <div key={game.id} className="bg-steam-light p-4 rounded-lg flex justify-between items-center border border-gray-700 hover:border-steam-accent/50 transition">
                    <div className="flex items-center gap-4">
                      {game.imageUrl && <img src={game.imageUrl} alt={game.title} className="w-16 h-16 object-cover rounded" />}
                      <div>
                        <h4 className="font-bold text-lg text-white">{game.title}</h4>
                        <p className="text-sm text-gray-400">${game.price} - {game.categories?.map(c => c.name).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(user.role === 'ADMIN' || (game.publisher && game.publisher.id === user.id)) && (
                        <>
                          <button 
                            onClick={() => {
                                setPatchData({ ...patchData, gameId: game.id });
                                setIsPatchModalOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm transition"
                          >
                              <FontAwesomeIcon icon={faPlusCircle} /> Update
                          </button>
                          <button onClick={() => handleEdit(game)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition"><FontAwesomeIcon icon={faEdit} /> Edit</button>
                          <button onClick={() => handleDelete(game.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition"><FontAwesomeIcon icon={faTrash} /> Delete</button>
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
                    className="px-3 py-1 bg-steam-light text-white rounded text-sm disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-steam-light text-white rounded text-sm disabled:opacity-30"
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
              <div className="bg-steam-light border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full p-8 animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">Post Game Update / Patch Note</h3>
                      <button onClick={() => setIsPatchModalOpen(false)} className="text-gray-400 hover:text-white transition text-2xl">
                          <FontAwesomeIcon icon={faTimes} />
                      </button>
                  </div>

                  <form onSubmit={handlePostPatch} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">Update Title</label>
                              <input 
                                  value={patchData.title}
                                  onChange={e => setPatchData({...patchData, title: e.target.value})}
                                  required
                                  placeholder="e.g. The Big Summer Update"
                                  className="w-full bg-steam-dark border border-gray-600 rounded p-3 text-white focus:border-steam-accent outline-none transition"
                              />
                          </div>
                          <div>
                              <label className="block text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">Version</label>
                              <input 
                                  value={patchData.version}
                                  onChange={e => setPatchData({...patchData, version: e.target.value})}
                                  placeholder="e.g. v1.2.4"
                                  className="w-full bg-steam-dark border border-gray-600 rounded p-3 text-white focus:border-steam-accent outline-none transition"
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">Update Type</label>
                              <select 
                                  value={patchData.type}
                                  onChange={e => setPatchData({...patchData, type: e.target.value})}
                                  className="w-full bg-steam-dark border border-gray-600 rounded p-3 text-white focus:border-steam-accent outline-none transition"
                              >
                                  <option value="UPDATE">Standard Update</option>
                                  <option value="HOTFIX">Hotfix / Bugfix</option>
                                  <option value="DLC">DLC / Content Pack</option>
                                  <option value="ANNOUNCEMENT">Announcement</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">Content / Patch Notes</label>
                          <textarea 
                              value={patchData.content}
                              onChange={e => setPatchData({...patchData, content: e.target.value})}
                              required
                              placeholder="Describe what's new in this version..."
                              className="w-full bg-steam-dark border border-gray-600 rounded p-3 text-white focus:border-steam-accent outline-none transition h-48"
                          />
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                            type="submit"
                            className="flex-1 bg-steam-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition"
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
