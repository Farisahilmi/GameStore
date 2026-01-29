import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStar, faHeart, faUserPlus, faHistory } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ActivityFeed = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
        const token = localStorage.getItem('token');
        const url = user ? '/api/activities/friends' : '/api/activities';
        const res = await axios.get(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setActivities(res.data.data);
    } catch (err) {
        console.error('Failed to fetch activities');
    } finally {
        setLoading(false);
    }
  };

  const getIcon = (type) => {
      switch (type) {
          case 'PURCHASE': return <FontAwesomeIcon icon={faShoppingCart} className="text-green-500" />;
          case 'REVIEW': return <FontAwesomeIcon icon={faStar} className="text-yellow-500" />;
          case 'WISHLIST': return <FontAwesomeIcon icon={faHeart} className="text-pink-500" />;
          case 'FRIEND_ACCEPTED': return <FontAwesomeIcon icon={faUserPlus} className="text-blue-500" />;
          default: return <FontAwesomeIcon icon={faHistory} className="text-gray-500" />;
      }
  };

  if (loading) return (
      <div className="bg-steam-light rounded-xl border border-gray-800 p-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-700/50 rounded"></div>)}
          </div>
      </div>
  );

  return (
    <div className="bg-steam-light/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <FontAwesomeIcon icon={faHistory} className="text-steam-accent" />
          {user ? 'Friend Activity' : 'Recent Activity'}
      </h3>

      <div className="space-y-6">
          {activities.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No recent activity to show.</p>
          ) : (
              activities.map(activity => (
                  <div key={activity.id} className="flex gap-4 group">
                      <div className="shrink-0 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 group-hover:border-steam-accent transition">
                          {getIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 leading-snug">
                              <Link to={`/profile/${activity.userId}`} className="font-bold text-white hover:text-steam-accent transition">
                                  {activity.user.name}
                              </Link>
                              {' '}{activity.message}
                          </p>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1 block">
                              {new Date(activity.createdAt).toLocaleString()}
                          </span>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

export default ActivityFeed;
