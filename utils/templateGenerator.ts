
import { ResumeData, TemplateStyle } from "../types";

export const generateHtml = (data: ResumeData, style: TemplateStyle): string => {
  const isDark = style.id === 'midnight';
  const isFuturistic = style.id === 'futuristic';
  
  const bgColor = isDark ? '#0f172a' : '#f9fafb';
  const textColor = isDark ? '#f8fafc' : '#111827';
  const cardBg = isDark ? '#1e293b' : 'white';
  const borderColor = isDark ? '#334155' : '#e5e7eb';
  const mutedText = isDark ? '#94a3b8' : '#6b7280';
  const cardBorder = isFuturistic ? `2px solid ${style.primaryColor}` : `1px solid ${borderColor}`;

  const skillsHtml = data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
  
  const experienceHtml = data.experience.map(exp => `
    <div class="card mb-6">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xl font-bold">${exp.company}</h3>
        <span class="muted-text text-sm">${exp.startDate} - ${exp.endDate}</span>
      </div>
      <p class="text-lg font-medium text-primary mb-2">${exp.position}</p>
      <ul class="list-disc pl-5 text-content">
        ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const projectsHtml = data.projects.map(proj => `
    <div class="card">
      <h3 class="text-xl font-bold mb-2">${proj.title}</h3>
      <p class="text-content mb-4">${proj.description}</p>
      <div class="flex flex-wrap gap-2 mb-4">
        ${proj.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
      ${proj.link ? `<a href="${proj.link}" target="_blank" class="text-primary hover:underline font-bold">View Project &rarr;</a>` : ''}
    </div>
  `).join('');

  const educationHtml = data.education.map(edu => `
    <div class="mb-4">
      <h3 class="text-lg font-bold">${edu.institution}</h3>
      <p class="muted-text">${edu.degree} in ${edu.field} | ${edu.graduationDate}</p>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.fullName} | Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: ${style.primaryColor};
            --secondary: ${style.secondaryColor};
            --bg: ${bgColor};
            --text: ${textColor};
            --card-bg: ${cardBg};
            --border: ${borderColor};
            --muted: ${mutedText};
        }
        body { 
            font-family: ${style.fontFamily}, sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            margin: 0;
            line-height: 1.5;
        }
        .text-primary { color: var(--primary); }
        .bg-primary { background-color: var(--primary); }
        .muted-text { color: var(--muted); }
        .text-content { color: var(--text); opacity: 0.9; }
        .skill-tag { 
            background: ${isDark ? '#334155' : '#f3f4f6'}; 
            padding: 4px 12px; 
            border-radius: ${isFuturistic ? '0' : '9999px'}; 
            font-size: 0.875rem; 
            color: var(--text);
            border: 1px solid var(--border);
        }
        .tech-tag {
            background: ${style.primaryColor}20;
            color: var(--primary);
            font-size: 0.75rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: ${isFuturistic ? '0' : '4px'};
            text-transform: ${isFuturistic ? 'uppercase' : 'none'};
        }
        .card { 
            background: var(--card-bg); 
            border: ${cardBorder}; 
            padding: 24px; 
            border-radius: ${isFuturistic ? '0' : '12px'}; 
            box-shadow: ${isFuturistic ? '4px 4px 0 var(--primary)' : '0 1px 3px rgba(0,0,0,0.1)'};
        }
        header { 
            background: var(--card-bg); 
            border-bottom: 1px solid var(--border);
        }
        nav a { color: var(--text); }
        nav a:hover { color: var(--primary); }
        ${isFuturistic ? `
            h1, h2, h3 { text-transform: uppercase; letter-spacing: 2px; }
            .btn-cta { border-radius: 0 !important; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); }
        ` : ''}
    </style>
</head>
<body>
    <header class="sticky top-0 z-50 py-4 shadow-sm">
        <div class="container mx-auto px-6 flex justify-between items-center">
            <h1 class="text-2xl font-bold tracking-tighter">${data.fullName}</h1>
            <nav class="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest">
                <a href="#about">About</a>
                <a href="#experience">Experience</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>

    <main class="container mx-auto px-6 py-12 max-w-5xl">
        <section id="about" class="mb-20">
            <div class="grid md:grid-cols-3 gap-12 items-center">
                <div class="md:col-span-2">
                    <h2 class="text-4xl md:text-6xl font-black mb-6 leading-tight">${data.title}</h2>
                    <p class="text-xl muted-text leading-relaxed mb-8">${data.summary}</p>
                    <div class="flex flex-wrap gap-3">
                        ${skillsHtml}
                    </div>
                </div>
                <div class="flex flex-col items-center md:items-end space-y-4 text-sm font-medium">
                    <div class="flex items-center space-x-2"><span>📍 ${data.contact.location}</span></div>
                    <div class="flex items-center space-x-2"><span>✉️ ${data.contact.email}</span></div>
                    ${data.contact.phone ? `<div class="flex items-center space-x-2"><span>📞 ${data.contact.phone}</span></div>` : ''}
                    <div class="flex space-x-4 pt-4">
                        ${data.contact.linkedIn ? `<a href="${data.contact.linkedIn}" target="_blank" class="hover:text-primary transition">LINKEDIN</a>` : ''}
                        ${data.contact.github ? `<a href="${data.contact.github}" target="_blank" class="hover:text-primary transition">GITHUB</a>` : ''}
                    </div>
                </div>
            </div>
        </section>

        <section id="experience" class="mb-20">
            <h2 class="text-3xl font-black mb-10 pb-2 border-b-4 border-primary inline-block">Work Experience</h2>
            <div class="space-y-8">
                ${experienceHtml}
            </div>
        </section>

        <section id="projects" class="mb-20">
            <h2 class="text-3xl font-black mb-10 pb-2 border-b-4 border-primary inline-block">Featured Projects</h2>
            <div class="grid md:grid-cols-2 gap-8">
                ${projectsHtml}
            </div>
        </section>

        <section id="education" class="mb-20">
            <h2 class="text-3xl font-black mb-10 pb-2 border-b-4 border-primary inline-block">Education</h2>
            <div class="card">
                ${educationHtml}
            </div>
        </section>

        <section id="contact" class="text-center py-20 bg-primary/5 rounded-3xl border border-primary/20">
            <h2 class="text-4xl font-black mb-6">Get In Touch</h2>
            <p class="muted-text mb-10 max-w-xl mx-auto text-lg font-medium">I'm currently open to new opportunities and interesting collaborations. Let's build something great together.</p>
            <a href="mailto:${data.contact.email}" class="btn-cta inline-block bg-primary text-white font-black py-5 px-12 rounded-full transition hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 text-lg">
                SAY HELLO
            </a>
        </section>
    </main>

    <footer class="py-12 border-t border-border text-center muted-text text-sm font-bold tracking-widest uppercase">
        <p>&copy; ${new Date().getFullYear()} ${data.fullName}. All rights reserved.</p>
    </footer>
</body>
</html>
`;
};
