import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="flex items-center justify-between gap-4 py-3 mt-auto">
      <img src="/logoTravel.png" width={120} alt="logo" className="mb-2" />
      <p className="flex-1 border-l border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden">
        &copy; 2024 DevGo. All Rights Reserved. | Powered by Innovation.
      </p>
      <div className="flex gap-2.5">
        <img src={assets.facebook_icon} alt="fbimg" width={35} />
        <img src={assets.twitter_icon} alt="fbimg" width={35} />
        <img src={assets.instagram_icon} alt="fbimg" width={35} />
      </div>
    </footer>
  );
};

export default Footer;
