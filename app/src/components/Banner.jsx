import "./Banner.css";

function Banner({name}) {
  return (
    <div className='banner-container'>
       {name ? <h2 className="banner-name">{name}</h2> : <h2>Select a chat</h2>}
    </div>
  );
}

export default Banner;
