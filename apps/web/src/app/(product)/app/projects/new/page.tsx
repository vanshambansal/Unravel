import { CreateProjectForm } from '@/features/projects/CreateProjectForm';
export default function NewProjectPage() {
  return <><header className="product-page-heading"><div><p className="product-eyebrow">Projects / New project</p><h1>Connect your website</h1><p>A project keeps one website and its reports together.</p></div></header>
    <div className="product-form-layout"><CreateProjectForm /><aside className="product-form-aside"><p className="product-eyebrow accent">WHAT HAPPENS NEXT</p><h2>Register now.<br />Record next.</h2><p>After creating your project, you’ll go straight to SDK setup.</p><p className="product-small">Recording integration is not available yet. Your website registration will be saved.</p></aside></div></>;
}
