import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUserFriends, FaShieldAlt, FaComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../assets/components/Navbar';
import Footer from '../assets/components/Footer';
import RoommateCard from '../assets/components/RoommateCard';
import '../styles/HomePage.css';

const displayCount = 10;
const swapCount = 3;

const createInitialSlots = (roommates) => {
  return Array(displayCount)
    .fill(null)
    .map((_, i) => ({ slotId: i, roommate: roommates[i] || null }));
};

const HomePage = () => {
  const [roommates, setRoommates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [updatedIndexes, setUpdatedIndexes] = useState([]);

  useEffect(() => {
    const fetchRoommates = async () => {
      const dummyData = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        name: ['Alex', 'Maria', 'Sam', 'Zara', 'Leo', 'Tina', 'Ryan', 'Nina', 'Jay', 'Kim', 'Olivia', 'Ben',
               'Daisy', 'Liam', 'Eva', 'Noah', 'Jade', 'Finn', 'Amy', 'Tom', 'Cleo', 'Max', 'Elle', 'Neo'][i],
        photo: `https://res.cloudinary.com/dh1rs2zgb/image/upload/${[
          'v1754384964/alex_flfclx', 'v1754384965/maria_oomsxi', 'v1754384966/sam_fwkxn0',  'v1754384963/zara_zekouf', 
          'v1754384992/leo_zmq0di', 'v1754384978/tina_qmcw02','v1754385011/ryan_bqcrgm','v1754384984/nina_nhstcs', 
          'v1754384979/jay_dsxgqq', 'v1754384987/kim_pyg7ae', 'v1754384981/olivia_lewiix','v1754384986/ben_zrm47f',
          'v1754384990/daisy_k8adro', 'v1754384996/liam_fn6vbl', 'v1754385001/eva_ifmejl', 'v1754385004/noah_scx45g',
           'v1754385020/jade_d9knyo', 'v1754385017/finn_acwnsy', 'v1754385020/amy_qhl24t','v1754386788/face_xqu0co', 
           'v1754386788/face_xqu0co', 'v1754386788/face_xqu0co', 'v1754386788/face_xqu0co', 'v1754386788/face_xqu0co'][i]}.jpg`,

        bio: 'Awesome roommate!'
        // location: ['Tokyo', 'Kyoto', 'Osaka', 'Nagoya', 'Fukuoka', 'Kobe', 'Sapporo', 'Yokohama', 'Sendai', 'Hiroshima',
        //           'Kanazawa', 'Nara', 'Osaka', 'Kagoshima', 'Okayama', 'Matsuyama', 'Kochi', 'Okinawa', 'Fukui', 'Toyama',
        //           'Gifu', 'Utsunomiya', 'Shizuoka', 'Takamatsu'][i]
      }));
      setRoommates(dummyData);
      setSlots(createInitialSlots(dummyData));
    };

    fetchRoommates();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (roommates.length <= displayCount) return;

      const unused = roommates.filter(
        (r) => !slots.some((slot) => slot.roommate?.id === r.id)
      );

      let remainingIndexes = [...Array(displayCount).keys()].filter(
        (i) => !updatedIndexes.includes(i)
      );

      if (remainingIndexes.length < swapCount) {
        setUpdatedIndexes([]);
        remainingIndexes = [...Array(displayCount).keys()];
      }

      const indexesToReplace = remainingIndexes
        .sort(() => 0.5 - Math.random())
        .slice(0, swapCount);

      const newCards = unused
        .sort(() => 0.5 - Math.random())
        .slice(0, swapCount);

      const newSlots = [...slots];
      indexesToReplace.forEach((idx, i) => {
        if (newCards[i]) {
          newSlots[idx] = {
            ...newSlots[idx],
            roommate: newCards[i]
          };
        }
      });

      setSlots(newSlots);
      setUpdatedIndexes((prev) => [...prev, ...indexesToReplace]);
    }, 4000);

    return () => clearInterval(interval);
  }, [roommates, slots, updatedIndexes]);

  const featureRef = useRef(null);
  const howRef = useRef(null);
  
  const scrollToFeatures = () => {
    featureRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHow = () => {
  howRef.current?.scrollIntoView({ behavior: 'smooth' });
};


 return (
  <>
    <div className="homepagee">
      
        {/* 🧭 Navbar Section */}
        <div className="navbar-container">
          <Navbar onFeaturesClick={scrollToFeatures} onHowClick={scrollToHow}/>
        </div>

        {/* 🦸 Hero Section */}
        <div className="hero-container">
          <header className="heroe">
            <h1>Find Your Perfect Roommate</h1>
            <p>Browse verified listings and connect with people who match your lifestyle.</p>
            <p>Smart. Safe. Simple.</p>
            <Link to="/login" className="cta-btne">Get Started</Link>
            {/* <button onClick={scrollToFeatures} className="scroll-to-features">Learn More</button> */}
          </header>
        </div>
      </div>

      {/* 🧑‍🤝‍🧑 Suggested Roommates Section */}
      <div className="roommate-grid-container">
        <section ref={featureRef} id="#featurese" className="roommate-grid">
          <h2>Suggested Roommates</h2>
          <div className="grid-container">
            {slots.map(({ slotId, roommate }) => (
              <div className="roommate-card-wrapper" key={slotId}>
                <Link to="/login" className="roommate-card-link">
                <AnimatePresence mode="wait">
                  {roommate && (
                    <motion.div
                      key={roommate.id}
                      style={{ overflow: 'hidden' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      <RoommateCard roommate={roommate} />
                    </motion.div>
                  )}
                </AnimatePresence>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 🌟 Features Section */}
      <div className="features-container">
        <section ref={howRef} id="#howe" className="featurese">
          <div className="feature-boxe">
            <FaUserFriends size={40} color="#043b6bff" />
            <h3>Personality Matching</h3>
            <p>We match you based on lifestyle and living preferences, not just location.</p>
          </div>
          <div className="feature-boxe">
            <FaShieldAlt size={40} color="#043b6bff" />
            <h3>Verified Profiles</h3>
            <p>Every roommate is verified for safety and authenticity.</p>
          </div>
          <div className="feature-boxe">
            <FaComments size={40} color="#043b6bff" />
            <h3>Chat & Connect</h3>
            <p>Built-in messaging makes it easy to get to know potential roommates.</p>
          </div>
        </section>
      </div>

      {/* 📍 Footer Section */}
      <div className="footer-container">
        <Footer />
      </div>
    
  </>
);

};

export default HomePage;
