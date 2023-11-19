import { Link, useMatch, useResolvedPath } from "react-router-dom";
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/homegit" className="app-title">KSU Reservations</Link>
      <ul>
        <CustomLink to="/devices">Device Reservation</CustomLink>
        <CustomLink to="/rooms">Room Reservation</CustomLink>
        <CustomLink to="/admin">Admin</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath= useResolvedPath(to);
  const isActive= useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}