
export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  website?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeData {
  fullName: string;
  title: string;
  summary: string;
  contact: ContactInfo;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
}

export enum Step {
  UPLOAD = 'upload',
  EXTRACTING = 'extracting',
  EDIT = 'edit',
  PREVIEW = 'preview',
  DOWNLOAD = 'download'
}

export interface TemplateStyle {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}
