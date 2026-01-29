import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { newsData } from '../data/newsData';

const News = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-2">Gaming News & Rumors</h1>
        <p className="text-gray-400 mb-10">Stay updated with the latest leaks, announcements, and industry whispers.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {newsData.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => navigate(`/news/${item.id}`)}
                    className="bg-steam-light border border-gray-800 rounded-xl overflow-hidden hover:border-steam-accent transition group cursor-pointer shadow-lg"
                >
                    <div className="h-48 overflow-hidden relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white border border-gray-600 uppercase tracking-wide">
                            {item.category}
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-steam-accent text-xs font-bold uppercase tracking-widest">{item.date}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition leading-tight">{item.title}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.summary}</p>
                        <span className="text-blue-400 text-sm font-bold group-hover:underline">Read Full Story &rarr;</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default News;
