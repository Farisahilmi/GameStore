import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { newsData } from '../data/newsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faHeart, faComment, faShareAlt, faReply, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = newsData.find(item => item.id === parseInt(id));
  
  const [likes, setLikes] = useState(article ? article.likes : 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(article ? article.comments : []);
  const [newComment, setNewComment] = useState('');

  if (!article) {
      return (
          <div className="min-h-screen bg-steam-dark flex items-center justify-center text-white">
              <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
                  <button onClick={() => navigate('/news')} className="text-steam-accent hover:underline">Back to News</button>
              </div>
          </div>
      );
  }

  const handleLike = () => {
      if (isLiked) {
          setLikes(prev => prev - 1);
          setIsLiked(false);
      } else {
          setLikes(prev => prev + 1);
          setIsLiked(true);
          toast.success("You liked this article!");
      }
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
  };

  const handleSubmitComment = (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      const commentObj = {
          id: comments.length + 1,
          user: "You", // Mock user for now
          text: newComment,
          time: "Just now",
          likes: 0
      };

      setComments([commentObj, ...comments]);
      setNewComment('');
      toast.success("Comment posted!");
  };

  return (
    <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4">
      {/* Hero Header */}
      <div className="relative h-[400px] w-full max-w-6xl mx-auto rounded-2xl overflow-hidden mb-8 shadow-2xl">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-steam-dark via-transparent to-black/30"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full">
               <button onClick={() => navigate('/news')} className="text-gray-300 hover:text-white mb-4 flex items-center gap-2 transition">
                   <FontAwesomeIcon icon={faArrowLeft} /> Back to News
               </button>
               <span className="bg-steam-accent text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-3 inline-block">
                   {article.category}
               </span>
               <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight shadow-lg">{article.title}</h1>
               <div className="flex items-center gap-6 text-gray-300 text-sm">
                   <div className="flex items-center gap-2">
                       <FontAwesomeIcon icon={faUser} /> <span>{article.author}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <FontAwesomeIcon icon={faCalendar} /> <span>{article.date}</span>
                   </div>
               </div>
          </div>
      </div>

      <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="md:col-span-2">
              <div className="bg-steam-light p-8 rounded-xl border border-gray-800 shadow-lg mb-8">
                  <div 
                      className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                  
                  {/* Interaction Bar */}
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-700">
                      <button 
                          onClick={handleLike}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${isLiked ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                          <FontAwesomeIcon icon={faHeart} /> {likes} Likes
                      </button>
                      <button 
                          onClick={handleShare}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 transition"
                      >
                          <FontAwesomeIcon icon={faShareAlt} /> Share
                      </button>
                  </div>
              </div>

              {/* Comments Section */}
              <div className="bg-steam-light p-8 rounded-xl border border-gray-800 shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <FontAwesomeIcon icon={faComment} className="text-steam-accent" />
                      Comments ({comments.length})
                  </h3>

                  {/* Comment Form */}
                  <form onSubmit={handleSubmitComment} className="mb-8">
                      <textarea 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Join the discussion..."
                          className="w-full bg-steam-dark border border-gray-700 rounded-lg p-4 text-white outline-none focus:border-steam-accent transition min-h-[100px]"
                      />
                      <div className="flex justify-end mt-2">
                          <button type="submit" className="bg-steam-accent hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition">
                              Post Comment
                          </button>
                      </div>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-6">
                      {comments.length === 0 ? (
                          <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                      ) : (
                          comments.map(comment => (
                              <div key={comment.id} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0 animate-fadeIn">
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center font-bold text-white">
                                              {comment.user.charAt(0)}
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-white text-sm">{comment.user}</h4>
                                              <span className="text-xs text-gray-500">{comment.time}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <p className="text-gray-300 text-sm ml-14 mb-3">{comment.text}</p>
                                  <div className="ml-14 flex gap-4 text-xs text-gray-500">
                                      <button className="hover:text-white flex items-center gap-1 transition">
                                          <FontAwesomeIcon icon={faHeart} /> {comment.likes}
                                      </button>
                                      <button className="hover:text-white flex items-center gap-1 transition">
                                          <FontAwesomeIcon icon={faReply} /> Reply
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>

          {/* Sidebar: Related News */}
          <div className="hidden md:block">
              <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-steam-accent pl-3">Trending Now</h3>
              <div className="space-y-4">
                  {newsData.filter(n => n.id !== article.id).slice(0, 3).map(item => (
                      <div 
                          key={item.id} 
                          onClick={() => {
                              navigate(`/news/${item.id}`);
                              window.scrollTo(0, 0);
                          }}
                          className="bg-steam-light border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition cursor-pointer group"
                      >
                          <div className="h-32 overflow-hidden">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                          </div>
                          <div className="p-4">
                              <span className="text-[10px] text-steam-accent font-bold uppercase">{item.category}</span>
                              <h4 className="font-bold text-white text-sm mt-1 group-hover:text-blue-400 transition line-clamp-2">{item.title}</h4>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default NewsDetails;
