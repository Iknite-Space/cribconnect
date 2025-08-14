import './Footer.css';

const Footer = () => {

    return (
        <footer className="footer">
        &copy; {new Date().getFullYear()} Roommate Finder. All rights reserved.
      </footer>
    );
};

export default Footer;