import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import { FaUsers, FaHeadset, FaCogs } from "react-icons/fa";
import { AiOutlineRobot } from "react-icons/ai";
import { MdLockOutline, MdDevices } from "react-icons/md";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      {/* Features section */}
      <section className="features-container">
        <h1 className="title gradient-text">Everything You Need to Connect</h1>
        <p className="subtitle">
          Powerful features designed to make your communication seamless, secure, and efficient.
        </p>

        <div className="features-grid">
          <div className="feature-card ">
            <FaUsers className="feature-icon" />
            <h3>Seamless Collaboration</h3>
            <p>Work in real-time without delays. Share ideas instantly with your team.</p>
          </div>

          <div className="feature-card">
            <AiOutlineRobot className="feature-icon" />
            <h3>AI-Powered Automation</h3>
            <p>Smart tools that handle repetitive tasks so you can focus on what matters.</p>
          </div>

          <div className="feature-card">
            <MdLockOutline className="feature-icon" />
            <h3>End-to-End Encryption</h3>
            <p>Secure, private conversations that stay between you and your recipients.</p>
          </div>

          <div className="feature-card">
            <MdDevices className="feature-icon" />
            <h3>Cross-Platform Access</h3>
            <p>Available on web, mobile, and desktop. Stay connected wherever you are.</p>
          </div>

          <div className="feature-card">
            <FaCogs className="feature-icon" />
            <h3>Customizable Workflows</h3>
            <p>Adapt the platform to your needs with flexible configuration options.</p>
          </div>

          <div className="feature-card">
            <FaHeadset className="feature-icon" />
            <h3>24/7 Support</h3>
            <p>Get instant help anytime. Our team is always ready to assist you.</p>
          </div>
        </div>

        <button className="cta-button">Start Communication</button>
      </section>
    </main>
  );
}
