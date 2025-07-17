import { Link } from 'react-router-dom';
import './Navbar.css'

const Navbar = () => {

    return (
        <nav className="navbare">
        <div className="logoe">Roommate Finder</div>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>
    );
};

export default Navbar;