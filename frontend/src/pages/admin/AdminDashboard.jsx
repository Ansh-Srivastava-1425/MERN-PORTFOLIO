import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import API from '../../api/axios';
import { logoutAdmin } from '../../redux/slices/authSlice';
import { fetchProfile, updateProfile, addSkill, deleteSkill, updateResumeUrl } from '../../redux/slices/profileSlice';
import { fetchProjects, addProject, updateProject, deleteProject } from '../../redux/slices/projectSlice';
import { fetchTimeline, addEntry, updateEntry, deleteEntry } from '../../redux/slices/timelineSlice';
import { fetchMessages, markMessageAsRead, deleteMessage } from '../../redux/slices/messageSlice';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { fetchAllPostsAdmin, createPost as createPostThunk, updatePost as updatePostThunk, deletePost as deletePostThunk } from '../../redux/slices/postSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.profile);
  const { projects } = useSelector((state) => state.projects);
  const { timeline } = useSelector((state) => state.timeline);
  const { messages } = useSelector((state) => state.messages);
  const { posts } = useSelector((state) => state.posts);

  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState(null);

  // --- Profile Forms State ---
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    tagline: '',
    aboutMe: '',
    email: '',
    phone: '',
    githubURL: '',
    linkedinURL: '',
    portfolioURL: '',
    avatar: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      ogImagePublicId: '',
      twitterHandle: '',
    }
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [ogFile, setOgFile] = useState(null);

  // --- Blog Forms State ---
  const [postForm, setPostForm] = useState({
    title: '', excerpt: '', content: '', tags: '', published: false
  });
  const [editingPost, setEditingPost] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const blogFileRef = useRef(null);

  // --- Projects Forms State ---
  const [projectForm, setProjectForm] = useState({
    id: '', // Empty means creating new
    title: '',
    description: '',
    technologies: '',
    liveURL: '',
    githubURL: '',
    category: 'webdev',
    featured: false,
  });
  const [projectImage, setProjectImage] = useState(null);
  const projectFileRef = useRef(null);

  // --- Timeline Forms State ---
  const [timelineForm, setTimelineForm] = useState({
    id: '', // Empty means creating new
    title: '',
    description: '',
    from: '',
    to: '',
    present: false,
  });

  useEffect(() => {
    // Initial fetch of all dashboard data
    dispatch(fetchProfile());
    dispatch(fetchProjects());
    dispatch(fetchTimeline());
    dispatch(fetchMessages());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'blog') {
      dispatch(fetchAllPostsAdmin());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    API.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  // Populate profile fields when fetched
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || '',
        tagline: profile.tagline || '',
        aboutMe: profile.aboutMe || '',
        email: profile.email || '',
        phone: profile.phone || '',
        githubURL: profile.githubURL || '',
        linkedinURL: profile.linkedinURL || '',
        portfolioURL: profile.portfolioURL || '',
        avatar: profile.avatar || '',
        seo: {
          title: profile.seo?.title || '',
          description: profile.seo?.description || '',
          keywords: profile.seo?.keywords || '',
          ogImage: profile.seo?.ogImage || '',
          ogImagePublicId: profile.seo?.ogImagePublicId || '',
          twitterHandle: profile.seo?.twitterHandle || '',
        }
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (err) {
      toast.error(err || 'Logout failed');
    }
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImage = useCallback(() => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!completedCrop || !image || !canvas) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      setAvatarFile(croppedFile);
      setShowCropper(false);
      // Show preview
      const previewUrl = URL.createObjectURL(blob);
      setProfileForm(prev => ({ ...prev, avatarPreview: previewUrl }));
    }, 'image/jpeg', 0.95);
  }, [completedCrop]);

  const handleResumeSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please select a PDF file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    setUploadingResume(true);
    setResumeProgress(0);

    try {
      const res = await API.post('/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setResumeProgress(percentCompleted);
        },
      });

      dispatch(updateResumeUrl(res.data.resumeUrl));
      toast.success('Resume uploaded successfully!');
      setResumeFile(null);
      setResumeProgress(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (window.confirm('Are you sure you want to remove your resume?')) {
      try {
        await API.delete('/profile/resume');
        dispatch(updateResumeUrl(''));
        toast.success('Resume removed successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to remove resume');
      }
    }
  };

  const handleOgImageUpload = async (e) => {
    if (e) e.preventDefault();
    if (!ogFile) return;
    const formData = new FormData();
    formData.append('image', ogFile);
    try {
      const res = await API.post('/profile/og-image', formData);
      setProfileForm(prev => ({
        ...prev,
        seo: { ...prev.seo, ogImage: res.data.ogImage }
      }));
      setOgFile(null);
      toast.success('Social image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  // --- Blog Handlers ---
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.excerpt || !postForm.content) {
      toast.error('Title, excerpt, and content are required');
      return;
    }

    try {
      let savedPost;
      if (editingPost) {
        savedPost = await dispatch(updatePostThunk({ id: editingPost._id, data: postForm })).unwrap();
        toast.success('Post updated successfully!');
      } else {
        savedPost = await dispatch(createPostThunk(postForm)).unwrap();
        toast.success('Post created successfully!');
      }

      // Upload cover image if selected
      if (coverFile && savedPost && savedPost._id) {
        const formData = new FormData();
        formData.append('image', coverFile);
        setUploadingCover(true);
        setCoverProgress(0);

        try {
          await API.post(`/posts/${savedPost._id}/cover`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setCoverProgress(percentCompleted);
            },
          });
          toast.success('Cover image uploaded successfully!');
        } catch (uploadErr) {
          toast.error(uploadErr.response?.data?.message || 'Failed to upload cover image');
        } finally {
          setUploadingCover(false);
          setCoverFile(null);
          setCoverProgress(0);
        }
      }

      dispatch(fetchAllPostsAdmin());
      resetPostForm();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleEditPost = async (post) => {
    try {
      const res = await API.get(`/posts/admin/${post._id}`);
      const fullPost = res.data;
      setEditingPost(fullPost);
      setPostForm({
        title: fullPost.title || '',
        excerpt: fullPost.excerpt || '',
        content: fullPost.content || '',
        tags: fullPost.tags ? fullPost.tags.join(', ') : '',
        published: fullPost.published || false,
      });
      setCoverFile(null);
      if (blogFileRef.current) blogFileRef.current.value = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Failed to fetch full post content');
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post permanently?')) {
      try {
        await dispatch(deletePostThunk(id)).unwrap();
        toast.success('Post deleted successfully');
        if (editingPost && editingPost._id === id) {
          resetPostForm();
        }
      } catch (err) {
        toast.error(err || 'Failed to delete post');
      }
    }
  };

  const resetPostForm = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      excerpt: '',
      content: '',
      tags: '',
      published: false,
    });
    setCoverFile(null);
    if (blogFileRef.current) blogFileRef.current.value = '';
  };

  // --- Profile Handlers ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      let avatarUrl = profileForm.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        const res = await API.post('/profile/avatar', formData);
        avatarUrl = res.data.url;
      }

      await dispatch(updateProfile({ ...profileForm, avatar: avatarUrl })).unwrap();
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name) {
      toast.error('Skill name is required');
      return;
    }
    try {
      await dispatch(addSkill(skillForm)).unwrap();
      toast.success('Skill added!');
      setSkillForm({ name: '' });
    } catch (err) {
      toast.error(err || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Delete this skill?')) {
      try {
        await dispatch(deleteSkill(id)).unwrap();
        toast.success('Skill deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete skill');
      }
    }
  };

  // --- Project Handlers ---
  const handleProjectFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProjectForm({
      ...projectForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description || !projectForm.category) {
      toast.error('Please enter title, description, and category');
      return;
    }

    const formData = new FormData();
    formData.append('title', projectForm.title);
    formData.append('description', projectForm.description);
    formData.append('technologies', projectForm.technologies);
    formData.append('liveURL', projectForm.liveURL);
    formData.append('githubURL', projectForm.githubURL);
    formData.append('category', projectForm.category);
    formData.append('featured', projectForm.featured);
    if (projectImage) {
      formData.append('image', projectImage);
    }

    try {
      if (projectForm.id) {
        // Update Project
        await dispatch(updateProject({ id: projectForm.id, formData })).unwrap();
        toast.success('Project updated successfully!');
      } else {
        // Create Project
        await dispatch(addProject(formData)).unwrap();
        toast.success('Project created successfully!');
      }
      resetProjectForm();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleEditProject = (proj) => {
    setProjectForm({
      id: proj._id,
      title: proj.title || '',
      description: proj.description || '',
      technologies: proj.technologies ? proj.technologies.join(', ') : '',
      liveURL: proj.liveURL || '',
      githubURL: proj.githubURL || '',
      category: proj.category || 'webdev',
      featured: proj.featured || false,
    });
    setProjectImage(null);
    if (projectFileRef.current) projectFileRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also remove the image.')) {
      try {
        await dispatch(deleteProject(id)).unwrap();
        toast.success('Project deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete project');
      }
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      id: '',
      title: '',
      description: '',
      technologies: '',
      liveURL: '',
      githubURL: '',
      category: 'webdev',
      featured: false,
    });
    setProjectImage(null);
    if (projectFileRef.current) projectFileRef.current.value = '';
  };

  // --- Timeline Handlers ---
  const handleTimelineFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTimelineForm({
      ...timelineForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTimelineSubmit = async (e) => {
    e.preventDefault();
    if (!timelineForm.title || !timelineForm.description || !timelineForm.from) {
      toast.error('Title, description, and from date are required');
      return;
    }

    const payload = {
      title: timelineForm.title,
      description: timelineForm.description,
      from: timelineForm.from,
      to: timelineForm.present ? undefined : timelineForm.to || undefined,
      present: timelineForm.present,
    };

    try {
      if (timelineForm.id) {
        await dispatch(updateEntry({ id: timelineForm.id, entryData: payload })).unwrap();
        toast.success('Timeline entry updated successfully!');
      } else {
        await dispatch(addEntry(payload)).unwrap();
        toast.success('Timeline entry added successfully!');
      }
      resetTimelineForm();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleEditTimeline = (item) => {
    setTimelineForm({
      id: item._id,
      title: item.title || '',
      description: item.description || '',
      from: item.from ? new Date(item.from).toISOString().substring(0, 10) : '',
      to: item.to ? new Date(item.to).toISOString().substring(0, 10) : '',
      present: item.present || false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTimeline = async (id) => {
    if (window.confirm('Delete this timeline entry?')) {
      try {
        await dispatch(deleteEntry(id)).unwrap();
        toast.success('Timeline entry deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete entry');
      }
    }
  };

  const resetTimelineForm = () => {
    setTimelineForm({
      id: '',
      title: '',
      description: '',
      from: '',
      to: '',
      present: false,
    });
  };

  // --- Message Handlers ---
  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markMessageAsRead(id)).unwrap();
      toast.success('Marked as read');
    } catch (err) {
      toast.error(err || 'Failed to update message');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Delete this contact message permanently?')) {
      try {
        await dispatch(deleteMessage(id)).unwrap();
        toast.success('Message deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete message');
      }
    }
  };

  const handleToggleProject = async (id) => {
    try {
      await API.patch(`/projects/${id}/toggle`);
      dispatch(fetchProjects());
    } catch (err) {
      toast.error('Failed to toggle project visibility');
    }
  };

  const handleToggleTimeline = async (id) => {
    try {
      await API.patch(`/timeline/${id}/toggle`);
      dispatch(fetchTimeline());
    } catch (err) {
      toast.error('Failed to toggle entry visibility');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans pb-20 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none"></div>

      {/* Nav */}
      <header className="border-b border-slate-900 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-display">
              ADMIN DASHBOARD
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Welcome, {user?.name || 'Admin'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white transition-colors font-mono"
            >
              PREVIEW SITE ↗
            </a>
            <button 
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/5 rounded-lg transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8 relative z-10">
        
        {/* Stats Overview Widget */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Projects',   value: stats.totalProjects,   icon: '🚀', color: 'indigo' },
              { label: 'Messages',   value: stats.totalMessages,   icon: '📬', color: 'violet' },
              { label: 'Unread',     value: stats.unreadMessages,  icon: '🔔', color: stats.unreadMessages > 0 ? 'amber' : 'slate' },
              { label: 'Articles',   value: stats.totalPosts,      icon: '📝', color: 'cyan' },
              { label: 'Published',  value: stats.publishedPosts,  icon: '✅', color: 'green' },
              { label: 'Experience', value: stats.totalTimeline,   icon: '📅', color: 'pink' },
            ].map((stat, i) => (
              <div key={i}
                className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4
                  hover:border-indigo-500/20 transition-all duration-200">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-900 mb-8 font-mono text-sm overflow-x-auto whitespace-nowrap scrollbar-none">
          {['profile', 'projects', 'timeline', 'messages', 'blog'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 border-b-2 font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'border-indigo-500 text-white bg-indigo-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'timeline' ? 'Experience' : tab === 'blog' ? 'Blog' : tab}
              {tab === 'messages' && messages.filter(m => !m.read).length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-500 text-[10px] font-bold text-white">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile & Skills */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-lg font-bold font-display text-slate-200 mb-6">Profile Details</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tagline</label>
                      <input 
                        type="text" 
                        value={profileForm.tagline}
                        onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Bio / About Me</label>
                    <textarea 
                      rows="4"
                      value={profileForm.aboutMe}
                      onChange={(e) => setProfileForm({ ...profileForm, aboutMe: e.target.value })}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Public Email</label>
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Phone Number (Optional)</label>
                      <input 
                        type="text" 
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">GitHub URL</label>
                      <input 
                        type="text" 
                        value={profileForm.githubURL}
                        onChange={(e) => setProfileForm({ ...profileForm, githubURL: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LinkedIn URL</label>
                      <input 
                        type="text" 
                        value={profileForm.linkedinURL}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinURL: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Portfolio URL</label>
                      <input 
                        type="text" 
                        value={profileForm.portfolioURL}
                        onChange={(e) => setProfileForm({ ...profileForm, portfolioURL: e.target.value })}
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
                      Avatar Image
                    </label>

                    {/* Current/Preview Image */}
                    {(profileForm.avatarPreview || profileForm.avatar) && !showCropper && (
                      <img
                        src={profileForm.avatarPreview || profileForm.avatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-indigo-500/50"
                      />
                    )}

                    {/* File Picker */}
                    {!showCropper && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer"
                      />
                    )}

                    {/* Cropper Modal */}
                    {showCropper && imgSrc && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4">
                          <h3 className="text-white font-semibold text-lg mb-4">Crop Avatar</h3>
                          <p className="text-slate-400 text-sm mb-4">Drag to reposition. The crop is fixed to a 1:1 square ratio.</p>
                          
                          <div className="flex justify-center mb-4">
                            <ReactCrop
                              crop={crop}
                              onChange={(c) => setCrop(c)}
                              onComplete={(c) => setCompletedCrop(c)}
                              aspect={1}
                              circularCrop
                            >
                              <img
                                ref={imgRef}
                                src={imgSrc}
                                alt="Crop preview"
                                onLoad={onImageLoad}
                                className="max-h-80 max-w-full rounded-lg"
                              />
                            </ReactCrop>
                          </div>

                          {/* Hidden canvas for processing */}
                          <canvas ref={canvasRef} className="hidden" />

                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => { setShowCropper(false); setImgSrc(''); }}
                              className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={getCroppedImage}
                              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                            >
                              Apply Crop
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-6 mt-6">
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Resume / CV (PDF)
                    </label>
                    
                    {profile?.resumeUrl ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-4">
                        <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">
                          ✓ Resume Uploaded
                        </span>
                        <a 
                          href={profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-mono hover:underline"
                        >
                          View Current PDF ↗
                        </a>
                        <button
                          type="button"
                          onClick={handleResumeDelete}
                          className="ml-auto text-xs font-mono text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 mb-4 font-mono">
                        NO RESUME UPLOADED YET
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeSelect}
                          className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer"
                        />
                        {resumeFile && (
                          <p className="text-[10px] text-slate-400 mt-2 font-mono truncate">
                            Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleResumeUpload}
                        disabled={uploadingResume || !resumeFile}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold uppercase tracking-wider font-mono self-start md:self-auto cursor-pointer"
                      >
                        {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                      </button>
                    </div>

                    {uploadingResume && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Uploading PDF file...</span>
                          <span>{resumeProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-out"
                            style={{ width: `${resumeProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/5 pt-8 mt-8">
                    <h3 className="text-white font-semibold text-base mb-1 font-display">
                      SEO & Social Metadata
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 font-light">
                      Controls how your portfolio appears on Google, LinkedIn,
                      Twitter, and link previews.
                    </p>

                    <div className="space-y-5">

                      {/* Page Title */}
                      <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={profileForm.seo?.title || ''}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            seo: { ...prev.seo, title: e.target.value }
                          }))}
                          placeholder={(profileForm.fullName && profileForm.tagline) ? `${profileForm.fullName} | ${profileForm.tagline}` : 'e.g. John Doe | Full Stack Engineer'}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                        <p className="text-xs text-slate-650 mt-1 font-mono">
                          Leave blank to auto-use your name and tagline
                        </p>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                          Meta Description
                          <span className="ml-auto float-right normal-case">
                            {(profileForm.seo?.description || '').length}/160
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          maxLength={160}
                          value={profileForm.seo?.description || ''}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            seo: { ...prev.seo, description: e.target.value }
                          }))}
                          placeholder="Short description for Google search results..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
                        />
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                          Keywords (comma separated)
                        </label>
                        <input
                          type="text"
                          value={profileForm.seo?.keywords || ''}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            seo: { ...prev.seo, keywords: e.target.value }
                          }))}
                          placeholder="react, node.js, full stack developer, arduino..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>

                      {/* Twitter Handle */}
                      <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                          Twitter / X Handle (optional)
                        </label>
                        <input
                          type="text"
                          value={profileForm.seo?.twitterHandle || ''}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            seo: { ...prev.seo, twitterHandle: e.target.value }
                          }))}
                          placeholder="@yourhandle"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>

                      {/* OG Image */}
                      <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                          Social Share Image
                          <span className="normal-case text-slate-650 ml-2">
                            (recommended 1200×630px)
                          </span>
                        </label>

                        {profileForm.seo?.ogImage && (
                          <div className="mb-3">
                            <img
                              src={profileForm.seo.ogImage}
                              alt="OG preview"
                              className="w-full max-w-sm h-32 object-cover rounded-xl border border-white/10"
                            />
                            <p className="text-xs text-green-400 mt-1 font-mono">
                              ✓ Social image uploaded
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setOgFile(e.target.files[0])}
                            className="block text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer"
                          />
                          {ogFile && (
                            <button
                              type="button"
                              onClick={handleOgImageUpload}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                        {ogFile && (
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            {ogFile.name} selected
                          </p>
                        )}
                      </div>

                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md shadow-indigo-900/30"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>

            {/* Skills management */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Add Skill Form */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-lg font-bold font-display text-slate-200 mb-4">Add Skill</h3>
                <form onSubmit={handleAddSkill} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Skill Name</label>
                    <input 
                      type="text" 
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g. Node.js"
                      className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold uppercase tracking-wider"
                  >
                    Add Skill
                  </button>
                </form>
              </div>

              {/* Skills List */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-lg font-bold font-display text-slate-200 mb-4">Current Skills</h3>
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {profile.skills.map((skill) => (
                      <div key={skill._id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-900">
                        <div>
                          <div className="text-sm font-semibold">{skill.name}</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteSkill(skill._id)}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 font-mono text-xs">NO SKILLS FOUND</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            
            {/* Create / Edit Form */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-display text-slate-200 mb-6">
                {projectForm.id ? 'Edit Project' : 'Create New Project'}
              </h3>
              
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Project Title</label>
                    <input 
                      type="text" 
                      name="title"
                      value={projectForm.title}
                      onChange={handleProjectFormChange}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Category</label>
                    <select 
                      name="category"
                      value={projectForm.category}
                      onChange={handleProjectFormChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="webdev">Web Development</option>
                      <option value="robotics">Robotics & Hardware</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea 
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectFormChange}
                    rows="3"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Technologies (comma separated)</label>
                  <input 
                    type="text" 
                    name="technologies"
                    value={projectForm.technologies}
                    onChange={handleProjectFormChange}
                    placeholder="React, Redux, Node.js, Cloudinary"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">GitHub Repo URL</label>
                    <input 
                      type="text" 
                      name="githubURL"
                      value={projectForm.githubURL}
                      onChange={handleProjectFormChange}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live Demo URL</label>
                    <input 
                      type="text" 
                      name="liveURL"
                      value={projectForm.liveURL}
                      onChange={handleProjectFormChange}
                      className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Project Image</label>
                    <input 
                      type="file" 
                      ref={projectFileRef}
                      onChange={(e) => setProjectImage(e.target.files[0])}
                      accept="image/*"
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input 
                      type="checkbox" 
                      name="featured"
                      id="featured"
                      checked={projectForm.featured}
                      onChange={handleProjectFormChange}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="featured" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                      FEATURED ON LANDING PAGE
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md shadow-indigo-900/30"
                  >
                    {projectForm.id ? 'Update Project' : 'Add Project'}
                  </button>
                  {projectForm.id && (
                    <button 
                      type="button" 
                      onClick={resetProjectForm}
                      className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 text-slate-300 font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Projects List */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-display text-slate-200 mb-6">Existing Projects</h3>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((proj) => (
                    <div key={proj._id} className="flex flex-col justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-950/50">
                      <div className="flex gap-4">
                        {proj.imageURL && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900">
                            <img src={proj.imageURL} alt={proj.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-200">{proj.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-mono
                               ${proj.isPublished
                                 ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                 : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                               }`}>
                               {proj.isPublished ? 'LIVE' : 'DRAFT'}
                             </span>
                            {proj.featured && (
                              <span className="text-[8px] font-mono font-bold bg-purple-600/30 text-purple-400 px-1 rounded border border-purple-500/20">
                                FT
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">
                            {proj.category === 'webdev' ? 'Web Dev' : 'Robotics'}
                          </span>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-900/80">
                        <button
                           onClick={() => handleToggleProject(proj._id)}
                           title={proj.isPublished ? 'Click to unpublish' : 'Click to publish'}
                           className={`relative w-11 h-6 rounded-full transition-colors duration-200
                             ${proj.isPublished ? 'bg-indigo-600' : 'bg-white/10'}`}
                         >
                           <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                             shadow transition-transform duration-200
                             ${proj.isPublished ? 'translate-x-5' : 'translate-x-0'}`}
                           />
                         </button>
                        <button 
                          onClick={() => handleEditProject(proj)}
                          className="px-3 py-1.5 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(proj._id)}
                          className="px-3 py-1.5 text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 font-mono text-xs">NO PROJECTS FOUND</div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-8">
            
            {/* Create / Edit Form */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-display text-slate-200 mb-6">
                {timelineForm.id ? 'Edit Timeline Entry' : 'Add Timeline Entry'}
              </h3>
              
              <form onSubmit={handleTimelineSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Role Title / Event Name</label>
                  <input 
                    type="text" 
                    name="title"
                    value={timelineForm.title}
                    onChange={handleTimelineFormChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea 
                    name="description"
                    value={timelineForm.description}
                    onChange={handleTimelineFormChange}
                    rows="3"
                    className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">From Date</label>
                    <input 
                      type="date" 
                      name="from"
                      value={timelineForm.from}
                      onChange={handleTimelineFormChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">To Date</label>
                    <input 
                      type="date" 
                      name="to"
                      value={timelineForm.to}
                      onChange={handleTimelineFormChange}
                      disabled={timelineForm.present}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <input 
                      type="checkbox" 
                      name="present"
                      id="present"
                      checked={timelineForm.present}
                      onChange={handleTimelineFormChange}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="present" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                      CURRENT ROLE (PRESENT)
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md shadow-indigo-900/30"
                  >
                    {timelineForm.id ? 'Update Entry' : 'Add Entry'}
                  </button>
                  {timelineForm.id && (
                    <button 
                      type="button" 
                      onClick={resetTimelineForm}
                      className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 text-slate-300 font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Timeline Entries List */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-display text-slate-200 mb-6">Existing Experience Timeline</h3>
              {timeline.length > 0 ? (
                <div className="space-y-4">
                  {[...timeline].sort((a,b) => new Date(b.from) - new Date(a.from)).map((item) => (
                    <div key={item._id} className="flex flex-col md:flex-row justify-between md:items-start p-4 rounded-xl border border-slate-800/80 bg-slate-950/50 gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-200">{item.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-mono
                             ${item.isPublished
                               ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                               : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                             }`}>
                             {item.isPublished ? 'LIVE' : 'DRAFT'}
                           </span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {new Date(item.from).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                            {' - '}
                            {item.present ? 'Present' : item.to ? new Date(item.to).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 border-slate-900/80 pt-2 md:pt-0 w-full md:w-auto justify-end">
                        <button
                           onClick={() => handleToggleTimeline(item._id)}
                           title={item.isPublished ? 'Click to hide' : 'Click to show'}
                           className={`relative w-11 h-6 rounded-full transition-colors duration-200
                             ${item.isPublished ? 'bg-indigo-600' : 'bg-white/10'}`}
                         >
                           <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                             shadow transition-transform duration-200
                             ${item.isPublished ? 'translate-x-5' : 'translate-x-0'}`}
                           />
                         </button>
                        <button 
                          onClick={() => handleEditTimeline(item)}
                          className="px-3 py-1.5 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDeleteTimeline(item._id)}
                          className="px-3 py-1.5 text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 font-mono text-xs">NO TIMELINE ENTRIES FOUND</div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Messages */}
        {activeTab === 'messages' && (
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
            <h3 className="text-lg font-bold font-display text-slate-200 mb-6">Inbox Messages</h3>
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`p-5 rounded-xl border transition-colors flex flex-col justify-between gap-4 ${
                      msg.read 
                        ? 'border-slate-900 bg-slate-950/20' 
                        : 'border-indigo-500/20 bg-indigo-500/5'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Message Metadata Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{msg.senderName}</span>
                            {!msg.read && (
                              <span className="text-[8px] font-mono font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded tracking-wider">
                                UNREAD
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block">{msg.email}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 self-start md:self-auto">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Message Body */}
                      <p className="text-slate-300 font-light text-sm whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-900/50">
                        {msg.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900/40">
                      {!msg.read && (
                        <button 
                          onClick={() => handleMarkAsRead(msg._id)}
                          className="px-3.5 py-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                        >
                          MARK AS READ
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="px-3.5 py-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        DELETE PERMANENTLY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 font-mono text-sm">INBOX IS EMPTY</div>
            )}
          </div>
        )}



        {/* Tab 6: Blog */}
        {activeTab === 'blog' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side — Post list */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-display text-slate-200">Articles</h3>
                  <button 
                    onClick={resetPostForm}
                    className="px-2.5 py-1 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/5 rounded transition-all"
                  >
                    + NEW POST
                  </button>
                </div>
                
                {posts && posts.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {posts.map((post) => (
                      <div key={post._id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{post.title}</h4>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            post.published 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                          <span className="text-[9px] font-mono text-slate-500">{post.readTime}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditPost(post)}
                              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300"
                            >
                              EDIT
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post._id)}
                              className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 font-mono text-xs">NO ARTICLES FOUND</div>
                )}
              </div>
            </div>

            {/* Right side — Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-display text-slate-200">
                    {editingPost ? `Edit: ${editingPost.title}` : 'Write New Article'}
                  </h3>
                  <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-lg p-0.5 font-mono text-[10px]">
                    <button 
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-3 py-1 rounded transition-all ${!previewMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      WRITE
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-3 py-1 rounded transition-all ${previewMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      PREVIEW
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Post Title</label>
                      <input 
                        type="text"
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        placeholder="e.g. Mastering Redux in React Applications"
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tags (comma separated)</label>
                      <input 
                        type="text"
                        value={postForm.tags}
                        onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                        placeholder="e.g. react, redux, state management"
                        className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Excerpt (Short Summary)</label>
                    <textarea 
                      rows="2"
                      value={postForm.excerpt}
                      onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                      placeholder="Write a brief intro or summary of the post..."
                      className="w-full px-4.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Content (Markdown)</label>
                    
                    {!previewMode ? (
                      <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800" data-color-mode="dark">
                        <MDEditor 
                          value={postForm.content}
                          onChange={(val) => setPostForm((prev) => ({ ...prev, content: val || '' }))}
                          height={400}
                        />
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none bg-slate-950 p-6 rounded-xl border border-slate-800 min-h-[400px] overflow-y-auto max-h-[500px]">
                        {postForm.content ? (
                          <ReactMarkdown>{postForm.content}</ReactMarkdown>
                        ) : (
                          <p className="text-slate-500 font-mono text-xs">Nothing to preview. Start writing content...</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-6 mt-6">
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      Cover Image (Optional)
                    </label>
                    
                    {(editingPost?.coverImage || coverFile) && (
                      <div className="mb-4">
                        <p className="text-[10px] font-mono text-slate-500 mb-2">IMAGE PREVIEW</p>
                        <img 
                          src={coverFile ? URL.createObjectURL(coverFile) : editingPost.coverImage} 
                          alt="Cover preview" 
                          className="w-48 h-24 object-cover rounded-xl border border-indigo-500/20"
                        />
                      </div>
                    )}

                    <input 
                      type="file"
                      ref={blogFileRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setCoverFile(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer"
                    />
                    
                    {uploadingCover && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Uploading cover image...</span>
                          <span>{coverProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-out"
                            style={{ width: `${coverProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="checkbox"
                      id="published"
                      checked={postForm.published}
                      onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })}
                      className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="published" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                      PUBLISH IMMEDIATELY (Otherwise saves as draft)
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      type="submit"
                      disabled={uploadingCover}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-md shadow-indigo-900/30 disabled:opacity-50"
                    >
                      {editingPost ? 'Save Post' : 'Create Post'}
                    </button>
                    {editingPost && (
                      <button 
                        type="button"
                        onClick={resetPostForm}
                        className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 text-slate-300 font-medium text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                </form>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
