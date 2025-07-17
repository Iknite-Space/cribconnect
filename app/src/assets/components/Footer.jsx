import './Footer.css';

const Footer = () => {

    return (
        <footer className="footere">
        &copy; {new Date().getFullYear()} Roommate Finder. All rights reserved.
      </footer>
    );
};

export default Footer;