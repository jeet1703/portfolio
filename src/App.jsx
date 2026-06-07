import React, { useEffect, useState } from 'react';
import './index.css'; // Global styles

function App() {
  const [activeNav, setActiveNav] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // 1. Intersection Observer for Fade-In animations
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 2. Scroll handler for navbar
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      let current = '';
      
      sections.forEach(section => {
          const sectionTop = section.offsetTop;
          if (window.scrollY >= (sectionTop - 200)) {
              current = section.getAttribute('id');
          }
      });
      setActiveNav(current);

      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      fadeElements.forEach(el => observer.unobserve(el));
    };
  }, []);



  return (
    <>
      <div className="grid-bg"></div>
      
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
              <a href="#" className="logo">PS.</a>
              <ul className="nav-links">
                  <li><a href="#about" className={activeNav === 'about' ? 'active' : ''}>About</a></li>
                  <li><a href="#experience" className={activeNav === 'experience' ? 'active' : ''}>Experience</a></li>
                  <li><a href="#projects" className={activeNav === 'projects' ? 'active' : ''}>Projects</a></li>
                  <li><a href="#skills" className={activeNav === 'skills' ? 'active' : ''}>Skills</a></li>
                  <li><a href="#contact" className={activeNav === 'contact' ? 'active' : ''}>Contact</a></li>
              </ul>
              <a href="#contact" className="btn-primary-sm">Contact Me</a>
          </div>
      </nav>

      <main>
          <section className="hero" id="hero">
              <div className="hero-content fade-in">
                  <p className="hero-greeting">Hello, I'm</p>
                  <h1 className="hero-name">PRABHJEET<br/>SINGH</h1>
                  <p className="hero-subtitle">Full Stack Developer</p>
                  <div className="hero-actions">
                      <a href="#contact" className="btn-primary">Let's Talk <i className="ph ph-arrow-right"></i></a>
                      <div className="social-links">
                          <a href="https://github.com/jeet1703" target="_blank" rel="noreferrer" aria-label="GitHub"><i className="ph ph-github-logo"></i></a>
                          <a href="https://linkedin.com/in/prabhjeetsinghh" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="ph ph-linkedin-logo"></i></a>
                          <a href="mailto:prabhjeetdec03@gmail.com" aria-label="Email"><i className="ph ph-envelope-simple"></i></a>
                          <a href="https://leetcode.com/u/Jeet1703" target="_blank" rel="noreferrer" aria-label="LeetCode"><i className="ph ph-code"></i></a>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section" id="about">
              <div className="container">
                  <h2 className="section-title fade-in">BACKGROUND</h2>
                  <div className="card education-card fade-in">
                      <div className="card-header">
                          <h3>Amity University Uttar Pradesh</h3>
                          <span className="date">Sep 2022 – June 2026</span>
                      </div>
                      <p className="role">B.Tech in Computer Science and Engineering</p>
                      <p className="location"><i className="ph ph-map-pin"></i> Noida, India</p>
                      <div className="highlights">
                          <span className="tag">CGPA: 8.82</span>
                      </div>
                  </div>

                  <div className="grid-2-col fade-in">
                      <div className="card">
                          <h3>Achievements</h3>
                          <ul className="list">
                              <li>Solved 300+ problems on LeetCode</li>
                              <li>Runner-up, Netflix Code Heist (top 100 teams nationwide)</li>
                              <li>Spearheaded Devlution hackathon event (200+ participants)</li>
                          </ul>
                      </div>
                      <div className="card">
                          <h3>Leadership & Volunteering</h3>
                          <ul className="list">
                              <li><strong>Google Developer Groups On Campus</strong> – Co-Organiser</li>
                              <li><strong>Microsoft Learn Student Chapter</strong> – Technical Lead</li>
                              <li><strong>Google Developer Student Clubs</strong> – Core Member</li>
                              <li><strong>GeeksforGeeks</strong> – Technical Team Member</li>
                              <li><strong>Achal Welfare Foundation</strong> – Intern</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section" id="experience">
              <div className="container">
                  <h2 className="section-title fade-in">EXPERIENCE</h2>
                  
                  <div className="timeline">
                      <div className="timeline-item fade-in">
                          <div className="timeline-dot"></div>
                          <div className="card">
                              <div className="card-header">
                                  <h3>Samsung Electro Mechanics</h3>
                                  <span className="date">June 2025 – Present</span>
                              </div>
                              <p className="role">Java Full Stack Developer Intern</p>
                              <p className="location"><i className="ph ph-map-pin"></i> Bengaluru, India</p>
                              <ul className="task-list">
                                  <li>Architected a Model Store platform to serve open-source LLMs on Kubernetes, designing a gateway with rate limiting and concurrency control.</li>
                                  <li>Led OS-aware migration of 20+ microservices from Java 8 → 17 and Spring Boot 2 → 3 across a Linux-based Kubernetes ecosystem.</li>
                                  <li>Engineered low-latency distributed microservices on Linux with Java 17 and Spring Boot, integrating Oracle DB and Redis.</li>
                                  <li>Deployed and managed containerised inference services on Kubernetes, configuring pod scheduling and persistent storage.</li>
                                  <li>Automated CI/CD pipelines using Jenkins across 5+ services integrating Docker and Kubernetes.</li>
                              </ul>
                          </div>
                      </div>

                      <div className="timeline-item fade-in">
                          <div className="timeline-dot"></div>
                          <div className="card">
                              <div className="card-header">
                                  <h3>Defence Research and Development Organisation (DRDO)</h3>
                                  <span className="date">April 2025 – May 2025</span>
                              </div>
                              <p className="role">Web Development Intern</p>
                              <p className="location"><i className="ph ph-map-pin"></i> Delhi, India</p>
                              <ul className="task-list">
                                  <li>Led development of a web-based project proposal and grant management platform for a government R&D body.</li>
                                  <li>Built 2 full-stack web applications using React.js, Node.js, and REST APIs, delivering scalable backend services.</li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section" id="projects">
              <div className="container">
                  <h2 className="section-title fade-in">PROJECTS</h2>
                  <div className="grid-2-col">
                      <div className="card project-card fade-in">
                          <div className="project-header">
                              <h3>Chess Arena</h3>
                              <a href="https://github.com/jeet1703/Chess" className="project-link"><i className="ph ph-arrow-up-right"></i></a>
                          </div>
                          <p className="project-desc">A full-stack real-time multiplayer chess platform using WebSockets for bidirectional communication and sub-second move propagation.</p>
                          <ul className="task-list">
                              <li>Designed a stateful backend enforcing server-side game authority with matchmaking and disconnect handling.</li>
                          </ul>
                          <div className="tags">
                              <span className="tag">React</span>
                              <span className="tag">TypeScript</span>
                              <span className="tag">Node.js</span>
                              <span className="tag">WebSockets</span>
                          </div>
                      </div>

                      <div className="card project-card fade-in">
                          <div className="project-header">
                              <h3>WebVizion</h3>
                              <a href="https://github.com/jeet1703/RUM" className="project-link"><i className="ph ph-arrow-up-right"></i></a>
                          </div>
                          <p className="project-desc">A backend-driven Real User Monitoring (RUM) platform to ingest, process, and analyse frontend performance metrics.</p>
                          <ul className="task-list">
                              <li>Optimised the ingestion pipeline using intelligent batching, reducing network overhead by 80%.</li>
                          </ul>
                          <div className="tags">
                              <span className="tag">Java</span>
                              <span className="tag">Spring Boot</span>
                              <span className="tag">React</span>
                              <span className="tag">Docker</span>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section" id="skills">
              <div className="container">
                  <h2 className="section-title fade-in">SKILLS & EXPERTISE</h2>
                  <div className="grid-3-col">
                      <div className="card skill-card fade-in">
                          <h3>Languages & Core</h3>
                          <div className="tags alt">
                              <span className="tag">Java (8/17)</span>
                              <span className="tag">Python</span>
                              <span className="tag">C/C++</span>
                              <span className="tag">JavaScript</span>
                              <span className="tag">TypeScript</span>
                              <span className="tag">HTML/CSS</span>
                          </div>
                      </div>
                      <div className="card skill-card fade-in">
                          <h3>Backend & Databases</h3>
                          <div className="tags alt">
                              <span className="tag">Spring Boot</span>
                              <span className="tag">Node.js</span>
                              <span className="tag">FastAPI</span>
                              <span className="tag">Express.js</span>
                              <span className="tag">Oracle DB</span>
                              <span className="tag">PostgreSQL</span>
                              <span className="tag">MongoDB</span>
                          </div>
                      </div>
                      <div className="card skill-card fade-in">
                          <h3>Cloud, Infra & DevOps</h3>
                          <div className="tags alt">
                              <span className="tag">AWS</span>
                              <span className="tag">Docker</span>
                              <span className="tag">Kubernetes</span>
                              <span className="tag">Jenkins</span>
                              <span className="tag">ArgoCD</span>
                              <span className="tag">Git/GitHub</span>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section" id="certifications">
              <div className="container">
                  <h2 className="section-title fade-in">CERTIFICATIONS</h2>
                  <div className="cert-grid fade-in">
                      <div className="cert-item">
                          <i className="ph ph-certificate"></i>
                          <span>CCNA: Introduction to Networks</span>
                      </div>
                      <div className="cert-item">
                          <i className="ph ph-cloud-check"></i>
                          <span>AWS Cloud Practitioner</span>
                      </div>
                      <div className="cert-item">
                          <i className="ph ph-webhooks-logo"></i>
                          <span>Postman API Fundamentals</span>
                      </div>
                      <div className="cert-item">
                          <i className="ph ph-file-code"></i>
                          <span>Python for Data Science</span>
                      </div>
                      <div className="cert-item">
                          <i className="ph ph-stack"></i>
                          <span>100x Devs Full Stack</span>
                      </div>
                  </div>
              </div>
          </section>

          <section className="section" id="contact">
              <div className="container">
                  <h2 className="section-title text-center fade-in">CONTACT ME</h2>
                  <div className="contact-wrapper fade-in">
                      <div className="contact-info">
                          <div className="contact-item">
                              <i className="ph ph-envelope-simple"></i>
                              <div>
                                  <h4>Email</h4>
                                  <p><a href="mailto:prabhjeetdec03@gmail.com">prabhjeetdec03@gmail.com</a></p>
                              </div>
                          </div>
                          <div className="contact-item">
                              <i className="ph ph-linkedin-logo"></i>
                              <div>
                                  <h4>LinkedIn</h4>
                                  <p><a href="https://linkedin.com/in/prabhjeetsinghh" target="_blank" rel="noreferrer">linkedin.com/in/prabhjeetsinghh</a></p>
                              </div>
                          </div>
                          <div className="contact-item">
                              <i className="ph ph-map-pin"></i>
                              <div>
                                  <h4>Location</h4>
                                  <p>Noida / Delhi NCR, India</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </main>

      <footer>
          <div className="container footer-content">
              <p>&copy; 2026 Prabhjeet Singh. All rights reserved.</p>
              <div className="footer-links">
                  <a href="https://github.com/jeet1703" target="_blank" rel="noreferrer">GitHub</a>
                  <a href="https://linkedin.com/in/prabhjeetsinghh" target="_blank" rel="noreferrer">LinkedIn</a>
                  <a href="https://leetcode.com/u/Jeet1703" target="_blank" rel="noreferrer">LeetCode</a>
              </div>
          </div>
      </footer>
    </>
  );
}

export default App;
