// RoommateCard.jsx
import React from 'react';
import './RoommateCard.css'; // Style as needed

const RoommateCard = ({ roommate }) => {
  return (
    <div className="roommate-card">  
      <img src={"https://res.cloudinary.com/dh1rs2zgb/image/upload/v1753801839/finder_logo_awoliq.png"} alt={`${roommate.name}'s profile`}  loading="lazy"  />
      <h4>{roommate.name}</h4>
      <p>{roommate.bio}</p>
    </div>
  );
};

export default  React.memo(RoommateCard);
