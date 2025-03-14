"use client";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import { FaUsers, FaHeadset, FaCogs } from "react-icons/fa";
import { AiOutlineRobot } from "react-icons/ai";
import { MdLockOutline, MdDevices } from "react-icons/md";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [isYearlyPlan, setIsYearlyPlan] = useState(false);

  const faqItems: FAQItem[] = [
    {
      question: "How does peer-to-peer communication work?",
      answer:
        "Our system creates direct connections between users' devices without intermediaries, using end-to-end encryption for secure communication.",
    },
    {
      question: "Is my data stored on servers?",
      answer:
        "No, we never store your messages or files on central servers. All communication happens directly between users' devices.",
    },
    {
      question: "What encryption standards do you use?",
      answer:
        "We use AES-256 encryption for all data transfers and XChaCha20 for message encryption, ensuring military-grade security.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <HeroSection />

      {/* Features Section */}
      <section className="features-container">
        <h1 className="title gradient-text">Everything You Need to Connect</h1>
        <p className="subtitle">
          Powerful features designed to make your communication seamless,
          secure, and efficient.
        </p>

        <div className="features-grid">
          {[
            {
              Icon: FaUsers,
              title: "Seamless Collaboration",
              text: "Work in real-time without delays. Share ideas instantly with your team.",
            },
            {
              Icon: AiOutlineRobot,
              title: "AI-Powered Automation",
              text: "Smart tools that handle repetitive tasks so you can focus on what matters.",
            },
            {
              Icon: MdLockOutline,
              title: "End-to-End Encryption",
              text: "Secure, private conversations that stay between you and your recipients.",
            },
            {
              Icon: MdDevices,
              title: "Cross-Platform Access",
              text: "Available on web, mobile, and desktop. Stay connected wherever you are.",
            },
            {
              Icon: FaCogs,
              title: "Customizable Workflows",
              text: "Adapt the platform to your needs with flexible configuration options.",
            },
            {
              Icon: FaHeadset,
              title: "24/7 Support",
              text: "Get instant help anytime. Our team is always ready to assist you.",
            },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <feature.Icon className="feature-icon" />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="section-header">
          <h1>Choose the Perfect Plan for Your Needs</h1>
          <p>
            Flexible pricing options designed to scale with your requirements
          </p>

          <div className="toggle-switch">
            <button
              className={`toggle-label ${!isYearlyPlan ? "active" : ""}`}
              onClick={() => setIsYearlyPlan(false)}
            >
              Monthly
            </button>
            <button
              className={`toggle-label ${isYearlyPlan ? "active" : ""}`}
              onClick={() => setIsYearlyPlan(true)}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="pricing-cards">
          {[
            {
              title: "Free",
              price: "$0",
              description: "Perfect for individuals just getting started",
              features: [
                "Basic communication tools",
                "5GB storage",
                "Up to 5 users",
              ],
              cta: "Get Started",
            },
            {
              title: "Pro",
              price: "$9.99",
              description: "Ideal for small teams and professionals",
              features: ["Advanced features", "10GB storage", "Up to 20 users"],
              cta: "Start Free Trial",
              badge: "Most Popular",
            },
            {
              title: "Enterprise",
              price: "Custom",
              description: "For organizations with advanced needs",
              features: [
                "Premium support",
                "Unlimited storage",
                "Unlimited users",
              ],
              cta: "Contact Sales",
            },
          ].map((plan, index) => (
            <div key={index} className="pricing-card">
              {plan.badge && <div className="popular-badge">{plan.badge}</div>}
              <h2>{plan.title}</h2>
              <div className="price">{plan.price}</div>
              <p>{plan.description}</p>
              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button className="cta-button">{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section center flex flex-col">
        <div className="section-header">
          <h1>Frequently Asked Questions</h1>
          <p>
            Answers to common questions about our peer-to-peer communication
          </p>
        </div>

        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`faq-item ${activeFAQ === index ? "active" : ""}`}
            >
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{item.question}</h3>
                <span className="toggle-icon">
                  {activeFAQ === index ? "−" : "+"}
                </span>
              </div>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* User testmonicals */}
      <section className="testimonials-section">
        <div className="section-header">
          <h1>What Our Users Say</h1>
          <p className="subtitle">
            Don’t just take our word for it. Here’s what people are saying about
            FreeFlow
          </p>
        </div>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <div className="testimonial-content">
              <p className="testimonial-text">
                FreeFlow transformed our remote collaboration. Highly recommend!
              </p>
              <div className="rating">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
              </div>
              <div className="author">
                <h4 className="name">John Doe</h4>
                <p className="role">CEO @ TechCorp</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <div className="testimonial-content">
              <p className="testimonial-text">
                The encryption features give us peace of mind when sharing
                sensitive information.
              </p>
              <div className="rating">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
              </div>
              <div className="author">
                <h4 className="name">Sarah Johnson</h4>
                <p className="role">CFO @ SecureData</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            <div className="testimonial-content">
              <p className="testimonial-text">
                We’ve cut our communication overhead by 40% since switching to
                FreeFlow.
              </p>
              <div className="rating">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">☆</span>
              </div>
              <div className="author">
                <h4 className="name">Michael Chen</h4>
                <p className="role">Product Manager @ InnovateCo</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <h2 className="footer-brand">FreeFlow</h2>
            <p className="footer-tagline">
              Peer-to-peer communication without barriers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/features">Features</a>
              </li>
              <li>
                <a href="/pricing">Pricing</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links">
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms of Service</a>
              </li>
              <li>
                <a href="/cookies">Cookie Policy</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="footer-heading">Newsletter</h3>
            <p className="newsletter-text">
              Subscribe to our newsletter for updates and news.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="email-input"
              />
              <button className="subscribe-button">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright">© 2025 FreeFlow. All rights reserved.</div>
      </footer>
    </>
  );
}
