import React from "react";
import { Mail, Phone, MapPin, Globe, Award, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import ParallaxSection from "../components/ParallaxSection";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", bounce: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const About = () => {
  return (
    <div className="bg-stone-950 font-sans selection:bg-accent-500/30 w-full relative">
      <ParallaxSection id="about-page" bgImage="/about-background.jpg">
        <div className="flex flex-col gap-12 sm:gap-24 w-full pb-24">
          
          {/* 1. HERO SECTION */}
          <section className="relative min-h-[60vh] flex items-center justify-center">
            {/* Hero Content */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold tracking-widest uppercase mb-6"
              >
                <Globe size={16} /> Discover the World
              </motion.div>
              <motion.h1
                className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Journey with <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">DevGo</span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-stone-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Your ultimate travel companion for seamless booking, personalized itineraries, and unforgettable adventures.
              </motion.p>
            </div>
          </section>

          {/* 2. OUR STORY & MISSION */}
          <section className="py-12 px-6 relative">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Image Side */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeUp}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" alt="Airplane" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="absolute -bottom-10 -right-10 bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/10 hidden md:block">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-accent-500 text-white rounded-2xl flex items-center justify-center">
                        <Award size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white">10+</h3>
                        <p className="text-stone-300 font-medium">Years of Excellence</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Text Side */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeUp}
                >
                  <h2 className="text-sm font-bold text-accent-400 tracking-widest uppercase mb-3">Our Mission</h2>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                    Empowering travelers to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">explore with ease.</span>
                  </h3>
                  <p className="text-lg text-stone-300 mb-6 leading-relaxed">
                    DevGo started with a simple idea: traveling should be exciting, not stressful. We've built a platform that brings together the best tours, seamless AI planning, and secure booking in one place.
                  </p>
                  <p className="text-lg text-stone-300 leading-relaxed mb-10">
                    Our mission is to provide reliable, hassle-free travel booking services that empower our customers to discover the world. We strive to offer exceptional support and the most memorable travel experiences.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                      <ShieldCheck size={28} className="text-accent-400 mb-3" />
                      <h4 className="font-bold text-white mb-1">Trusted & Secure</h4>
                      <p className="text-sm text-stone-400">Your data and payments are always protected.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                      <Heart size={28} className="text-red-400 mb-3" />
                      <h4 className="font-bold text-white mb-1">Crafted with Love</h4>
                      <p className="text-sm text-stone-400">Every itinerary is tailored to perfection.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 3. WHY CHOOSE US (Glassmorphism Cards) */}
          <section className="py-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                  Why Choose <span className="text-accent-400">Us?</span>
                </h2>
                <p className="text-stone-300 text-lg max-w-2xl mx-auto">
                  We go above and beyond to ensure your journey is nothing short of extraordinary.
                </p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
                    title: "Professional Service",
                    desc: "Expert assistance and 24/7 personalized guidance to ensure your trip is perfectly planned.",
                  },
                  {
                    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
                    title: "Unique Destinations",
                    desc: "Curated exclusive travel packages to hidden gems and world-renowned locations.",
                  },
                  {
                    img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
                    title: "Best Value",
                    desc: "Competitive rates and affordable luxury. We ensure you get the most out of every penny.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-500/0 via-transparent to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="rounded-2xl overflow-hidden mb-6 aspect-video relative">
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={item.img}
                        alt={item.title}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-stone-300 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* 4. TEAM SECTION */}
          <section className="py-12 px-6">
            <motion.div
              className="max-w-7xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">Leader</span>
              </h2>
              <p className="text-lg text-stone-300 max-w-2xl mx-auto mb-16">
                The visionary behind DevGo, dedicated to transforming the way you experience travel.
              </p>
              
              <div className="flex justify-center">
                <motion.div
                  className="group relative w-full max-w-sm"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-accent-400 to-amber-400 rounded-[3rem] blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-white/20 shadow-inner">
                      <img
                        className="w-full h-full object-cover"
                        src="/CEO.jpg"
                        alt="Devllihc"
                        onError={(e) => {
                          e.target.src = "https://ui-avatars.com/api/?name=Devllihc&background=14b8a6&color=fff&size=256"
                        }}
                      />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1">Devllihc</h3>
                    <p className="text-accent-400 font-bold uppercase tracking-wider text-sm mb-4">Founder & CEO</p>
                    <p className="text-stone-300 text-center">"Travel is the only thing you buy that makes you richer. Let's make it extraordinary."</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* 5. CONTACT SECTION */}
          <section className="py-12 relative overflow-hidden">
            <motion.div
              className="max-w-5xl mx-auto px-6 relative z-10 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Ready to start your journey?
              </h2>
              <p className="text-xl text-stone-300 mb-12 max-w-2xl mx-auto">
                Contact us today and let our experts craft the perfect itinerary for your next adventure.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: <Mail size={24} />, title: "Email", content: "buihoang3002@gmail.com" },
                  { icon: <Phone size={24} />, title: "Phone", content: "+84 999 999 999" },
                  { icon: <MapPin size={24} />, title: "Address", content: "Ha Noi, Viet Nam" },
                ].map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white hover:bg-white/20 transition-colors">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-stone-300">{item.content}</p>
                  </div>
                ))}
              </div>

              <a
                href="mailto:buihoang3002@gmail.com"
                className="inline-flex items-center gap-2 px-10 py-4 bg-accent-500 text-white rounded-full font-black text-lg hover:shadow-2xl hover:scale-105 hover:bg-accent-400 transition-all duration-300"
              >
                Contact Us Now
              </a>
            </motion.div>
          </section>

          <Footer />
        </div>
      </ParallaxSection>
    </div>
  );
};

export default About;
