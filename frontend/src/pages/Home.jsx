import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile } from '../redux/slices/profileSlice';
import { fetchTimeline } from '../redux/slices/timelineSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import { sendMessage } from '../redux/slices/messageSlice';
import { fetchPosts } from '../redux/slices/postSlice';
import useTheme from '../hooks/useTheme';

const Home = () => {
  const dispatch = useDispatch();
  const { profile, loading: profileLoading } = useSelector((state) => state.profile);
  const { timeline, loading: timelineLoading } = useSelector((state) => state.timeline);
  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { posts, loading: postsLoading } = useSelector((state) => state.posts);

  const { theme, toggleTheme } = useTheme();

  const [activeCategory, setActiveCategory] = useState('all');
  const [formData, setFormData] = useState({
    senderName: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchTimeline());
    dispatch(fetchProjects());
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    if (profile && profile.seo) {
      const { title, description, keywords, ogImage } = profile.seo;

      if (title) {
        document.title = title;
      } else if (profile.fullName) {
        document.title = `${profile.fullName} | Portfolio`;
      }

      const updateOrCreateMeta = (nameOrProperty, value, isProperty = false) => {
        if (value === undefined || value === null) return;
        const selector = isProperty 
          ? `meta[property="${nameOrProperty}"]` 
          : `meta[name="${nameOrProperty}"]`;
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement('meta');
          if (isProperty) {
            element.setAttribute('property', nameOrProperty);
          } else {
            element.setAttribute('name', nameOrProperty);
          }
          document.head.appendChild(element);
        }
        element.setAttribute('content', value);
      };

      updateOrCreateMeta('description', description);
      updateOrCreateMeta('keywords', keywords);

      // Open Graph Tags
      updateOrCreateMeta('og:title', title || (profile.fullName ? `${profile.fullName} | Portfolio` : ''), true);
      updateOrCreateMeta('og:description', description, true);
      updateOrCreateMeta('og:image', ogImage, true);
      updateOrCreateMeta('og:type', 'website', true);

      // Twitter Cards Tags
      updateOrCreateMeta('twitter:card', 'summary_large_image');
      updateOrCreateMeta('twitter:title', title || (profile.fullName ? `${profile.fullName} | Portfolio` : ''));
      updateOrCreateMeta('twitter:description', description);
      updateOrCreateMeta('twitter:image', ogImage);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.senderName || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(sendMessage(formData)).unwrap();
      toast.success('Message sent successfully!');
      setFormData({ senderName: '', email: '', message: '' });
    } catch (err) {
      toast.error(err || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter projects by category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  // Sort timeline entries by from date (newest first)
  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.from) - new Date(a.from));

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10,10,15,0.75)' : 'rgba(248,250,252,0.85)',
          borderBottom: '1px solid var(--border)',
        }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-display">
            PORTFOLIO
          </Link>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
            <a href="#experience" className="hover:text-indigo-400 transition-colors">Experience</a>
            <a href="#projects" className="hover:text-indigo-400 transition-colors">Projects</a>
            <a href="#blog" className="hover:text-indigo-400 transition-colors">Blog</a>
            <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full border border-white/10 bg-white/5 hover:border-indigo-500/50 transition-all duration-300 flex items-center px-1"
              aria-label="Toggle theme"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 transform
                ${theme === 'dark'
                  ? 'translate-x-0 bg-indigo-500'
                  : 'translate-x-7 bg-amber-400'
                }`}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>
            <Link 
              to="/admin/login" 
              className="px-4 py-2 text-xs font-mono tracking-wider border border-indigo-500/30 text-indigo-400 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all duration-200"
            >
              ADMIN PANEL
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 min-w-0 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              AVAILABLE FOR WORK
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profile?.fullName || 'Portfolio Owner'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>
              {profile?.tagline || 'Full Stack Web Developer & Tech Enthusiast'}
            </p>
            <p className="max-w-xl mx-auto md:mx-0 font-light leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {profile?.aboutMe || 'Welcome to my portfolio! I build premium web applications and intelligent hardware systems. Explore my experience, projects, and get in touch.'}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <a 
                href="#contact" 
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-900/30"
              >
                Get In Touch
              </a>
              <a 
                href="#projects" 
                className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                View My Work
              </a>
              {profile?.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:text-indigo-400"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CV
                </a>
              )}
            </div>
          </div>

          {/* Profile Image Card */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-lg group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="flex items-center justify-center relative">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.fullName} 
                    className="w-72 h-72 rounded-full object-cover object-top border-2 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                  />
                ) : (
                  <div className="w-72 h-72 rounded-full border-2 flex flex-col items-center justify-center"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    <svg className="w-20 h-20 mb-2 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>NO PHOTO INSTALLED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      {/* About & Skills Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20 relative z-10 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-3xl font-bold font-display flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Skills & Expertise
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </h2>
            <p className="font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              My technical toolkit consists of modern frontend and backend technologies, along with engineering disciplines. Here is my current mastery breakdown.
            </p>
            {profile?.email && (
              <div className="pt-4 space-y-2">
                <div className="text-xs uppercase tracking-wider font-mono" style={{ color: 'var(--text-muted)' }}>CONTACT INFORMATION</div>
                <div className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{profile.email}</div>
                {profile.phone && <div className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{profile.phone}</div>}
              </div>
            )}
            <div className="flex gap-4 pt-4">
              {profile?.githubURL && (
                <a href={profile.githubURL} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-xs font-mono">GITHUB ↗</span>
                </a>
              )}
              {profile?.linkedinURL && (
                <a href={profile.linkedinURL} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-xs font-mono">LINKEDIN ↗</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="backdrop-blur-md rounded-2xl p-8 space-y-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 rounded-full text-sm transition-all duration-200 hover:border-indigo-500/50 hover:text-indigo-400"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                  <p className="font-mono text-sm">NO SKILLS DEFINED YET</p>
                  <p className="text-xs mt-1">Configure profile details inside the Admin Panel.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Experience / Timeline Section */}
      <section id="experience" className="max-w-6xl mx-auto px-6 py-20 relative z-10 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>Experience & Timeline</h2>
          <p className="font-light max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A chronological timeline of my professional roles, milestones, and achievements.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {sortedTimeline.length > 0 ? (
            <>
              {/* Connecting line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/80 via-purple-500/40 to-transparent pointer-events-none"></div>

              <div className="space-y-12">
                {sortedTimeline.map((item) => (
                  <div key={item._id} className="relative pl-12 group">
                    {/* Timeline bullet */}
                    <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 z-10 group-hover:bg-indigo-500 transition-all duration-300"
                      style={{ backgroundColor: 'var(--bg-primary)' }}></div>

                    <div className="space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <h3 className="text-lg font-bold font-display group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded self-start md:self-auto"
                          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                          {new Date(item.from).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                          {' - '}
                          {item.present 
                            ? 'Present' 
                            : item.to 
                              ? new Date(item.to).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) 
                              : ''}
                        </span>
                      </div>
                      <p className="font-light text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <p className="font-mono text-sm">NO TIMELINE ENTRIES FOUND</p>
              <p className="text-xs mt-1">Populate experience data in the Admin Panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="max-w-6xl mx-auto px-6 py-20 relative z-10 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-display flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Featured Projects
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            </h2>
            <p className="font-light max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              A curated selection of software and robotics applications I have designed and engineered.
            </p>
          </div>

          {/* Filtering tabs */}
          <div className="flex items-center rounded-xl p-1 font-mono text-xs self-start md:self-auto"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setActiveCategory('all')} 
              className={`px-4 py-2 rounded-lg transition-all ${activeCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'hover:text-indigo-400'}`}
              style={{ color: activeCategory === 'all' ? 'white' : 'var(--text-muted)' }}
            >
              ALL
            </button>
            <button 
              onClick={() => setActiveCategory('webdev')} 
              className={`px-4 py-2 rounded-lg transition-all ${activeCategory === 'webdev' ? 'bg-indigo-600 text-white shadow-md' : 'hover:text-indigo-400'}`}
              style={{ color: activeCategory === 'webdev' ? 'white' : 'var(--text-muted)' }}
            >
              WEB DEV
            </button>
            <button 
              onClick={() => setActiveCategory('robotics')} 
              className={`px-4 py-2 rounded-lg transition-all ${activeCategory === 'robotics' ? 'bg-indigo-600 text-white shadow-md' : 'hover:text-indigo-400'}`}
              style={{ color: activeCategory === 'robotics' ? 'white' : 'var(--text-muted)' }}
            >
              ROBOTICS
            </button>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project._id} className="group rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:translate-y-[-4px]"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden border-b flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    {project.imageURL ? (
                      <img 
                        src={project.imageURL} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-12 h-12 mb-1 stroke-current" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-mono tracking-widest uppercase">NO IMAGE AVAILABLE</span>
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-purple-600 text-[10px] font-mono font-bold tracking-wider text-white shadow-md">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
                      {project.category === 'webdev' ? 'Web Development' : 'Robotics & Hardware'}
                    </span>
                    <h3 className="text-lg font-bold font-display group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {project.title}
                    </h3>
                    <p className="font-light text-sm line-clamp-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  {/* Tech stack */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 text-[10px] font-mono rounded"
                          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Links */}
                  <div className="flex items-center gap-4 pt-2 text-xs font-mono" style={{ borderTop: '1px solid var(--border)' }}>
                    {project.githubURL && (
                      <a 
                        href={project.githubURL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-white transition-colors flex items-center gap-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Source Code ↗
                      </a>
                    )}
                    {project.liveURL && (
                      <a 
                        href={project.liveURL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                      >
                        Live Demo ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <p className="font-mono text-sm">NO PROJECTS ADDED YET</p>
            <p className="text-xs mt-1">Create projects through the Admin Dashboard.</p>
          </div>
        )}
      </section>

      {/* BLOG SECTION */}
      <section id="blog" className="max-w-6xl mx-auto px-6 py-20 relative z-10 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4 font-display flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Articles & Writing
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </h2>
            <p className="max-w-xl font-light" style={{ color: 'var(--text-secondary)' }}>
              Thoughts on web development, embedded systems, and building things that matter.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <p className="font-mono text-sm">NO ARTICLES PUBLISHED YET</p>
              <p className="text-sm mt-2">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link key={post._id} to={`/blog/${post.slug}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:translate-y-[-3px]"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  
                  {post.coverImage && (
                    <img src={post.coverImage} alt={post.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span key={i}
                          className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 leading-snug group-hover:text-indigo-400 transition-colors font-display"
                      style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      <span>{post.readTime}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-20 relative z-10 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Let's Connect
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </h2>
            <p className="font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              If you want to collaborate on a project, discuss job opportunities, or simply share feedback, leave me a message. I usually respond within 24 hours.
            </p>
            
            <div className="space-y-4 pt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">✉</span>
                <span className="font-mono">{profile?.email || 'email@example.com'}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">📞</span>
                  <span className="font-mono">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4 backdrop-blur-md rounded-2xl p-8"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Your Name</label>
                <input 
                  type="text" 
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. john@example.com"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your request..."
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-indigo-900/30 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Sending Message...
                  </>
                ) : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs relative z-10 transition-colors duration-300"
        style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        <p className="mb-2">© {new Date().getFullYear()} {profile?.fullName || 'Portfolio Owner'}. All rights reserved.</p>
        <p>Built using React, Vite, Redux Toolkit, Tailwind CSS v4, Node.js & MongoDB.</p>
      </footer>

    </div>
  );
};

export default Home;
