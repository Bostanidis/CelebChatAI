"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Loader2, CircleUserRound, UserRound, CircleSlash, Heart, MessageCircle, PenSquare, MoreHorizontal, Share2, Bookmark, Users2, CalendarDays, Settings, UserPlus } from 'lucide-react';
import supabase from "@/utils/supabase/client";
import NewPostModal from '@/components/NewPostModal';
import formatPostDate from '@/utils/functions/formatPostDate';

function ProfileContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const params = useParams();
  const user_id = params.user_id;
  const [profile, setProfile] = useState({ username: '', profilePicture: '' });
  const [posts, setPosts] = useState([]);
  const [hasPosts, setHasPosts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  
  const isOwnProfile = user?.id === user_id;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user_id) return;
      setLoading(true);
      
      console.log("Fetching data for user_id:", user_id);
      
      try {
        // Log the raw responses before processing
        const profileResponse = await supabase
          .from('profiles')
          .select('username, profile_picture, created_at, followers, followed_accounts')
          .eq('id', user_id)
          .single();
        
        console.log("Profile response:", profileResponse);
        
        const postsResponse = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });
      

        if (profileResponse.error) throw profileResponse.error;
        if (postsResponse.error) throw postsResponse.error;
    
        setProfile({
          username: profileResponse.data?.username || '',
          profilePicture: profileResponse.data?.profile_picture || '',
          created_at: profileResponse.data?.created_at || '',
          followers: profileResponse.data?.followers || 0,
          followed_accounts: profileResponse.data?.followed_accounts || []
        });
    
        const posts = postsResponse.data || [];
        setPosts(posts);
        setHasPosts(posts.length > 0);

        // Set the initial followers count
        setFollowerCount(profileResponse.data?.followers || 0);

        if (user && user.followed_accounts) {
          setIsFollowing(user.followed_accounts.includes(user_id));
        }
    
      } catch (error) {
        console.error('Data fetch error:', error);
        setError(error.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user_id, user]);

  // Add console logs to debug the flow
  const handlePostCreated = async () => {
    console.log('Post created callback triggered');
    
    if (!user_id) {
      console.warn('Cannot fetch posts: No user ID available');
      return;
    }
    
    setLoading(true);
    
    try {
      // Give Supabase a moment to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the currently authenticated user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("Current auth user:", currentUser?.id);
      console.log("Fetching posts for user_id:", user_id);
      
      // Fetch posts with debug info
      const { data, error, status } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      
      console.log("Fetch status:", status);
      console.log("Fetch error:", error);
      console.log("Fetched posts:", data);
      
      if (error) {
        console.error('Error fetching posts:', error);
        setError(error.message || 'Failed to fetch posts');
        return;
      }
      
      if (data) {
        setPosts(data);
        setHasPosts(data.length > 0);
      }
    } catch (err) {
      console.error('Unexpected error fetching posts:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post) => {
    try {
      // 1. build the new likes‑array and count
      let currentLikedBy = post.is_liked_by || [];
      const isLiked      = currentLikedBy.includes(user?.id);
      let   updatedLikes = post.likes + (isLiked ? -1 : +1);

      if (isLiked) {
        // remove
        currentLikedBy = currentLikedBy.filter(id => id !== user?.id);
      } else {
        // add
        currentLikedBy = [...currentLikedBy, user?.id];
      }

      console.log(isLiked)
      console.log(currentLikedBy)

      // 2. send to Supabase
      const { data, error } = await supabase
        .from("posts")
        .update({
          likes: updatedLikes,
          is_liked_by: currentLikedBy
        })
        .eq("id", post.id)
        .select('*')
        .single();

      if (error) throw error;

      // Update the local post state correctly with all post data
      setPosts(prev =>
        prev.map(p => p.id === post.id ? { ...p, likes: updatedLikes, is_liked_by: currentLikedBy } : p)
      );

    } catch (err) {
      console.error("Error updating likes:", err.message);
    }
  };


  const handleFollow = async (profileId) => {
    try {
      // First verify we have the correct user variables
      if (!user || !user.id) {
        throw new Error("Current user information is missing");
      }
      
      // Validate profileId to prevent null values
      if (!profileId) {
        console.error("Invalid profileId provided:", profileId);
        throw new Error("Invalid profile ID: cannot follow/unfollow a null or undefined profile");
      }
      // First, get the target profile to work with accurate data
      const { data: targetProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching target profile:", fetchError);
        throw fetchError;
      }
      
      // Get the current state of followed accounts from the CURRENT user
      const { data: currentUserData, error: fetchUserError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (fetchUserError) {
        console.error("Error fetching current user data:", fetchUserError);
        throw fetchUserError;
      }
      
      let currentlyFollowingAccounts = currentUserData.followed_accounts || [];
      console
      // Check if already following the account
      let isFollowing = currentlyFollowingAccounts.includes(profileId);
      
      // Clean up the existing array to remove any null values
      currentlyFollowingAccounts = currentlyFollowingAccounts.filter(id => id !== null && id !== undefined);
      
      // Toggle following status
      if (isFollowing) {
        // Remove the user from followed accounts using filter
        currentlyFollowingAccounts = currentlyFollowingAccounts.filter(prev => prev !== profileId);
        isFollowing = false;
      } else {
        // Add the user to followed accounts
        currentlyFollowingAccounts = [...currentlyFollowingAccounts, profileId];
        isFollowing = true;
      }
      
      // Safety check to ensure we're not adding null values
      if (currentlyFollowingAccounts.includes(null) || currentlyFollowingAccounts.includes(undefined)) {
        console.error("Attempted to store null/undefined in followed_accounts", currentlyFollowingAccounts);
        currentlyFollowingAccounts = currentlyFollowingAccounts.filter(id => id !== null && id !== undefined);
      }

      // Update the CURRENT user's profile with new followed_accounts
      const { data: updatedCurrentUser, error: updateUserError } = await supabase
        .from("profiles")
        .update({
          followed_accounts: currentlyFollowingAccounts
        })
        .eq("id", user.id)
        .select('*')
        .single();

      if (updateUserError) {
        console.error("Supabase update error:", updateUserError);
        throw updateUserError;
      }

      // Calculate the new followers count based on the fetched target profile
      const currentFollowers = targetProfile.followers || 0;
      const newFollowersCount = isFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1);
      
      // Update the target profile's follower count
      const { data: updatedTargetProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
          followers: newFollowersCount
        })
        .eq("id", profileId)
        .select('*')
        .single();
        
      if (updateError) {
        console.error("Error updating target profile:", updateError);
        throw updateError;
      }
      
      // Return the updated data
      return { 
        currentUserData: updatedCurrentUser,
        targetProfileData: updatedTargetProfile,
        isFollowing 
      };
    } catch (err) {
      console.error("Error in handleFollow:", err);
      throw err;
    }
  };

  const handleFollowWithState = async () => {
    try {
      await handleFollow(user_id);
      
      // Update UI immediately
      setIsFollowing(prev => !prev);
      
      // Update follower count
      setFollowerCount(prev => isFollowing ? Math.max(0, prev - 1) : prev + 1);
    } catch (err) {
      console.error("Error updating follow state:", err);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center min-h-screen w-full py-8 px-6 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        {/* Profile header section with subtle gradient */}
        <div className="w-full max-w-4xl rounded-4xl bg-gradient-to-b mb-10 from-neutral-50 to-white dark:from-neutral-900/85 dark:to-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mx-6">
              {/* Profile picture with improved styling */}
              <div className="h-24 w-24 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-white dark:ring-neutral-800 shadow-md">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                    <UserRound size={40} className="text-neutral-400 dark:text-neutral-500" />
                  </div>
                )}
              </div>
              
              {/* Profile info with better typography and layout */}
              <div className="flex-1 space-y-2">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{profile.username}</h1>
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Users2 size={16} />
                    <span>{followerCount} Followers</span>
                  </span>
                  <span className="hidden md:inline-block h-1 w-1 bg-neutral-400 dark:bg-neutral-600 rounded-full"></span>
                  <span className="hidden md:flex items-center gap-1">
                    <CalendarDays size={16} />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
              
              {/* Conditional buttons with improved styling */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={() => router.push('/settings')}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all border border-neutral-200 dark:border-neutral-700 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      <span>Edit Profile</span>
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-all shadow-sm flex items-center gap-2"
                    >
                      <PenSquare size={16} />
                      <span>New Post</span>
                    </button>
                  </>
                ) : (isFollowing ? (
                  <button 
                    onClick={handleFollowWithState} 
                    className="px-5 py-2 rounded-full text-sm font-medium bg-transparent ring-2 ring-neutral-300 dark:ring-neutral-600 text-neutral-800 dark:text-white transition-all shadow-sm flex items-center gap-2"
                  >
                    Following
                  </button>
                ) : (
                  <button 
                    onClick={handleFollowWithState}
                    className="px-5 py-2 rounded-full text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-all shadow-sm flex items-center gap-2"
                  >
                    <UserPlus size={16} />
                    <span>Follow</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content section */}
        <div className={"w-full px-4 py-6 " + (hasPosts ? " max-w-3xl" : " max-w-4xl")}>
          {/* Posts grid */}
          {hasPosts ? (
            <div className="grid gap-12">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="rounded-xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Post header */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
                        {profile.profilePicture ? (
                          <img 
                            src={profile.profilePicture} 
                            alt={profile.username} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CircleUserRound size={24} className="text-neutral-400 dark:text-neutral-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{profile.username}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      
                      {/* More options button */}
                      <button className="ml-auto p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <MoreHorizontal size={20} className="text-neutral-500 dark:text-neutral-400" />
                      </button>
                    </div>
                    <p className="text-base text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                  </div>
                  
                  {/* Post image with better aspect ratio handling */}
                  {post.image && (
                    <div className="w-full bg-neutral-100 dark:bg-neutral-700">
                      <img 
                        src={post.image}
                        alt="Post content"
                        className="w-full max-h-[24rem] object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Post engagement with improved interaction design */}
                  <footer className="px-5 py-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-6">
                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => handleLike(post)}
                        aria-label="Like post"
                        className="flex items-center gap-2 p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <Heart 
                          size={18} 
                          className={post.is_liked_by.includes(user?.id) 
                            ? "fill-red-600 text-red-600" 
                            : "text-neutral-500 dark:text-neutral-400"} 
                        />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>

                      {/* Comments button */}
                      <button
                        type="button"
                        aria-label={`${post.comments} comments`}
                        className="flex items-center gap-2 p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <MessageCircle size={18} className="text-neutral-500 dark:text-neutral-400" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                      
                    </div>

                    {/* Posted at */}
                    <button
                      type="button"
                      aria-label={`${post.comments} comments`}
                      className="flex items-center gap-2 p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <span className="text-sm font-medium">Posted {formatPostDate(post.created_at)}</span>
                    </button>
                    
                  </footer>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="bg-neutral-100 dark:bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CircleSlash size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">No Posts Yet</p>
              <p className="text-sm mt-1">Posts will appear here once created</p>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 px-5 py-2 rounded-full text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-all shadow-sm flex items-center gap-2"
                >
                  <PenSquare size={16} />
                  <span>Create Your First Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <NewPostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  )
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [loading, user, router, isRedirecting]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null;

  return <ProfileContent />
}