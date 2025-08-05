// RoommateCard.jsx
import React from 'react';
import './RoommateCard.css'; 

const RoommateCard = ({ roommate }) => {
  return (
    <div className="roommate-card">  
      <img src={roommate.photo} alt={`${roommate.name}'s profile`}  loading="lazy"  />
      <h4>{roommate.name}</h4>
      <p>{roommate.bio}</p>
    </div>
  );
};

export default  React.memo(RoommateCard);