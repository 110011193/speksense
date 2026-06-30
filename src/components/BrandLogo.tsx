import { Link } from 'react-router-dom';

type Props = {
  to?: string;
  className?: string;
};

export function BrandLogo({ to = '/dashboard', className = 'dash-brand' }: Props) {
  const inner = (
    <>
      <img className="dash-brand-icon" src="/images/logo.png" alt="" aria-hidden="true" />
      <span className="dash-brand-name">SpekSense</span>
    </>
  );

  if (to.startsWith('http') || to.endsWith('.html')) {
    return (
      <a href={to} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {inner}
    </Link>
  );
}
