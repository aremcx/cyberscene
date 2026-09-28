import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { APP_NAME, APP_DESCRIPTION } from '../../config/constants';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Articles', path: ROUTES.ARTICLES },
    { label: 'Tutorials', path: ROUTES.TUTORIALS },
    { label: 'News', path: ROUTES.NEWS },
    { label: 'Research', path: ROUTES.RESEARCH },
  ],
  Intelligence: [
    { label: 'Threat Intel', path: ROUTES.THREAT_INTEL },
    { label: 'CVE Database', path: ROUTES.CVE_DATABASE },
    { label: 'Tools Directory', path: ROUTES.TOOLS },
  ],
  Learn: [
    { label: 'Academy', path: ROUTES.ACADEMY },
    { label: 'Courses', path: ROUTES.COURSES },
    { label: 'Labs', path: ROUTES.LABS },
  ],
  Community: [
    { label: 'Community', path: ROUTES.COMMUNITY },
    { label: 'Jobs', path: ROUTES.JOBS },
    { label: 'Events', path: ROUTES.EVENTS },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {APP_DESCRIPTION}
            </p>
          </div>

          {/* Link sections */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to={ROUTES.PRIVACY} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link to={ROUTES.TERMS} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <Link to={ROUTES.CONTACT} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
