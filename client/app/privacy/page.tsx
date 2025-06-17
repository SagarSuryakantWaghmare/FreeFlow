"use client";

import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle, Lock, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-[hsl(224,71.4%,4.1%)] dark:via-[hsl(263.4,70%,50.4%)]/5 dark:to-[hsl(224,71.4%,4.1%)] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 right-20 w-32 h-32 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full blur-3xl"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
          className="absolute bottom-40 left-20 w-40 h-40 bg-[hsl(263.4,70%,50.4%)]/5 rounded-full blur-3xl"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[hsl(263.4,70%,50.4%)]/3 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 md:px-6 py-12 max-w-4xl relative z-10"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-8">
          <Button variant="ghost" asChild className="group hover:bg-[hsl(263.4,70%,50.4%)]/10 transition-all duration-300">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowLeft className="h-4 w-4 group-hover:text-[hsl(263.4,70%,50.4%)] transition-colors" />
              </motion.div>
              <span className="group-hover:text-[hsl(263.4,70%,50.4%)] transition-colors">Back to Home</span>
            </Link>
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-12 text-center relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full mb-6"
          >
            <Shield className="h-8 w-8 text-[hsl(263.4,70%,50.4%)]" />
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)] mb-4 relative"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <motion.span
              initial={{ backgroundSize: "0% 100%" }}
              animate={{ backgroundSize: "100% 100%" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="bg-gradient-to-r from-[hsl(263.4,70%,50.4%)] to-purple-600 bg-clip-text text-transparent bg-no-repeat"
              style={{ backgroundImage: "linear-gradient(90deg, hsl(263.4,70%,50.4%), #9333ea)" }}
            >
              Privacy Policy
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-[hsl(217.9,10.6%,64.9%)] text-lg"
          >
            Last updated: June 18, 2025
          </motion.p>
        </motion.div>        {/* Content */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 bg-white/50 dark:bg-[hsl(215,27.9%,16.9%)]/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-[hsl(215,27.9%,16.9%)]/20 shadow-2xl" />
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="space-y-12">
              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Eye className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">1. Information We Collect</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed mb-4 pl-11">
                  FreeFlow is designed with privacy in mind. We collect minimal information necessary to provide our services:
                </motion.p>
                <motion.ul initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="list-none space-y-3 pl-11">
                  {[
                    "Account information (username, email for authentication)",
                    "Technical data (IP address, browser type, device information)",
                    "Usage data (connection logs, feature usage statistics)",
                    "Communications metadata (call duration, participant count - not content)"
                  ].map((item, index) => (
                    <motion.li key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="flex items-start space-x-3 text-[hsl(217.9,10.6%,64.9%)]">
                      <div className="w-2 h-2 bg-[hsl(263.4,70%,50.4%)] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Users className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">2. Peer-to-Peer Architecture</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  Our peer-to-peer communication system ensures that your video calls and messages are transmitted directly 
                  between participants. We do not store, record, or have access to the content of your communications. 
                  Your conversations remain private between you and your intended recipients.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">3. How We Use Your Information</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed mb-4 pl-11">
                  We use collected information solely for:
                </motion.p>
                <motion.ul initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="list-none space-y-3 pl-11">
                  {[
                    "Providing and maintaining our communication services",
                    "User authentication and account security",
                    "Technical support and troubleshooting",
                    "Service improvement and analytics (aggregated, non-personal data)",
                    "Legal compliance when required by law"
                  ].map((item, index) => (
                    <motion.li key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="flex items-start space-x-3 text-[hsl(217.9,10.6%,64.9%)]">
                      <div className="w-2 h-2 bg-[hsl(263.4,70%,50.4%)] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Lock className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">4. Data Storage and Security</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We implement industry-standard security measures to protect your data. Personal information is encrypted 
                  in transit and at rest. We retain account information only as long as necessary to provide services or 
                  as required by law. Communication content is never stored on our servers due to our P2P architecture.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Shield className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">5. Third Party Services</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We use minimal third-party services for authentication (Clerk) and basic analytics. These services 
                  have their own privacy policies and are selected based on their commitment to user privacy. 
                  We do not sell or share personal information with advertisers or marketing companies.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">6. Your Rights</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed mb-4 pl-11">
                  You have the right to:
                </motion.p>
                <motion.ul initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="list-none space-y-3 pl-11">
                  {[
                    "Access and download your personal data",
                    "Correct inaccurate information",
                    "Delete your account and associated data",
                    "Opt out of non-essential data collection",
                    "Data portability where technically feasible"
                  ].map((item, index) => (
                    <motion.li key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="flex items-start space-x-3 text-[hsl(217.9,10.6%,64.9%)]">
                      <div className="w-2 h-2 bg-[hsl(263.4,70%,50.4%)] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Eye className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">7. Cookies and Tracking</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We use essential cookies for authentication and basic functionality. We do not use tracking cookies 
                  for advertising purposes. You can control cookie preferences through your browser settings, though 
                  disabling essential cookies may impact service functionality.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Users className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">8. Children's Privacy</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  Our service is not intended for children under 13. We do not knowingly collect personal information 
                  from children under 13. If we become aware of such collection, we will delete the information immediately.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">9. Changes to Privacy Policy</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We may update this privacy policy from time to time. We will notify users of significant changes 
                  via email or service notifications. Continued use after changes indicates acceptance of the updated policy.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <FileText className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">10. Contact Us</h2>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11 space-y-2">
                  <p>For privacy-related questions or requests, contact us at:</p>
                  <p className="font-medium">Email: privacy@freeflow.com</p>
                  <p className="font-medium text-[hsl(263.4,70%,50.4%)]">Created by: Atharva Sagar and Akash</p>
                  <p>We are committed to protecting your privacy and will respond to inquiries within 30 days.</p>
                </motion.div>
              </motion.section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
