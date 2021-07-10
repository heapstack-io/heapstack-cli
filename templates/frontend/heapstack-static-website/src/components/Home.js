import React from "react";
import Hero from "./hero";
const Home = () => {
  return (
    <div className="ui container">
      <Hero />
      <div className="ui three column grid">
        <div className="column">
          <div className="ui segment">
            <h4>Amazon Web Services</h4>
            <p>
              Purus semper eget duis at tellus at urna condimentum mattis. Non
              blandit massa enim nec. Integer enim neque volutpat ac tincidunt
              vitae semper quis. Accumsan tortor posuere ac ut consequat semper
              viverra nam.
            </p>
            <p>
              <a href="/">Learn more</a>
            </p>
          </div>
        </div>
        <div className="column">
          <div className="ui segment">
            <h4>Google Cloud</h4>
            <p>
              Ut venenatis tellus in metus vulputate. Amet consectetur
              adipiscing elit pellentesque. Sed arcu non odio euismod lacinia at
              quis risus. Faucibus turpis in eu mi bibendum neque egestas cmonsu
              songue. Phasellus vestibulum lorem sed risus.
            </p>
            <p>
              <a href="/">Learn more</a>
            </p>
          </div>
        </div>
        <div className="column">
          <div className="ui segment">
            <h4>Azure</h4>
            <p>
              Imperdiet dui accumsan sit amet nulla facilisi morbi. Fusce ut
              placerat orci nulla pellentesque dignissim enim. Libero id
              faucibus nisl tincidunt eget nullam. Commodo viverra maecenas
              accumsan lacus vel facilisis.
            </p>
            <p>
              <a href="/">Learn more</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
