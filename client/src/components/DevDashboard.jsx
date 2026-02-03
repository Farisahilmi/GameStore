import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCode, faGamepad } from '@fortawesome/free-solid-svg-icons';

const DevDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', status: 'CONCEPT', progress: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/dev-projects/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
          if (editingProject) {
              const res = await axios.put(`/api/dev-projects/${editingProject.id}`, formData, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setProjects(projects.map(p => p.id === editingProject.id ? res.data.data : p));
              toast.success('Project updated');
          } else {
              const res = await axios.post('/api/dev-projects', formData, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setProjects([res.data.data, ...projects]);
              toast.success('Project created');
          }
          closeModal();
      } catch (err) {
          toast.error('Operation failed');
      }
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Delete this project?')) return;
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`/api/dev-projects/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setProjects(projects.filter(p => p.id !== id));
          toast.success('Project deleted');
      } catch (err) {
          toast.error('Delete failed');
      }
  };

  const openModal = (project = null) => {
      if (project) {
          setEditingProject(project);
          setFormData({ title: project.title, status: project.status, progress: project.progress });
      } else {
          setEditingProject(null);
          setFormData({ title: '', status: 'CONCEPT', progress: 0 });
      }
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingProject(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-steam-dark">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-steam-dark min-h-screen text-white">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <div>
            <h2 className="text-3xl font-bold text-steam-accent flex items-center gap-3">
                <FontAwesomeIcon icon={faCode} /> Developer Studio
            </h2>
            <p className="text-gray-400 text-sm mt-1">Manage your upcoming game projects and track development progress.</p>
        </div>
        <button 
            onClick={() => openModal()}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold shadow-lg transition flex items-center gap-2"
        >
            <FontAwesomeIcon icon={faPlus} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
          <div className="text-center py-20 bg-steam-light rounded-lg border border-gray-700 border-dashed">
              <div className="text-gray-500 text-6xl mb-4"><FontAwesomeIcon icon={faGamepad} /></div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-6">Start building your next masterpiece today.</p>
              <button onClick={() => openModal()} className="text-steam-accent hover:underline">Create First Project</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                  <div key={project.id} className="bg-steam-light rounded-lg p-6 border border-gray-700 shadow-xl hover:border-steam-accent transition group">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-steam-accent transition">{project.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                          </span>
                      </div>
                      
                      <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                          </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-6">
                          Last updated: {new Date(project.lastUpdate).toLocaleDateString()}
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                          <button onClick={() => openModal(project)} className="text-gray-400 hover:text-white transition" title="Edit">
                              <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-500 transition" title="Delete">
                              <FontAwesomeIcon icon={faTrash} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-steam-light border border-gray-700 rounded-lg shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                      {editingProject ? 'Edit Project' : 'New Project'}
                  </h3>
                  <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                          <label className="block text-gray-400 text-sm mb-1">Project Title</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                          />
                      </div>
                      <div className="mb-4">
                          <label className="block text-gray-400 text-sm mb-1">Status</label>
                          <select 
                            className="w-full bg-steam-dark border border-gray-600 rounded p-2 text-white focus:border-steam-accent outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                          >
                              <option value="CONCEPT">Concept</option>
                              <option value="IN_DEVELOPMENT">In Development</option>
                              <option value="ALPHA">Alpha Testing</option>
                              <option value="BETA">Beta Testing</option>
                              <option value="RELEASED">Released</option>
                          </select>
                      </div>
                      <div className="mb-6">
                          <label className="block text-gray-400 text-sm mb-1">Progress ({formData.progress}%)</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-steam-accent"
                            value={formData.progress}
                            onChange={e => setFormData({ ...formData, progress: e.target.value })}
                          />
                      </div>
                      <div className="flex gap-3">
                          <button type="submit" className="flex-1 bg-steam-accent hover:bg-blue-600 text-white font-bold py-2 rounded transition">Save</button>
                          <button type="button" onClick={closeModal} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition">Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'CONCEPT': return 'text-gray-400 border-gray-600 bg-gray-900';
        case 'IN_DEVELOPMENT': return 'text-blue-400 border-blue-600 bg-blue-900/20';
        case 'ALPHA': return 'text-purple-400 border-purple-600 bg-purple-900/20';
        case 'BETA': return 'text-orange-400 border-orange-600 bg-orange-900/20';
        case 'RELEASED': return 'text-green-400 border-green-600 bg-green-900/20';
        default: return 'text-gray-400';
    }
};

export default DevDashboard;
