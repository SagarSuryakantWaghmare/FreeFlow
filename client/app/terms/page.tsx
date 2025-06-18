"use client";

import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function TermsPage() {
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
            <FileText className="h-8 w-8 text-[hsl(263.4,70%,50.4%)]" />
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
              Terms & Conditions
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
              <motion.section
                variants={itemVariants}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">
                    1. Acceptance of Terms
                  </h2>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11"
                >
                  By accessing and using FreeFlow, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </motion.p>
              </motion.section>

              <motion.section
                variants={itemVariants}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Shield className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">
                    2. Service Description
                  </h2>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11"
                >
                  FreeFlow provides peer-to-peer communication services including video calls, text chat, and group communication. 
                  Our services are provided "as is" and we reserve the right to modify or discontinue the service at any time.
                </motion.p>
              </motion.section>

              <motion.section
                variants={itemVariants}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">
                    3. User Responsibilities
                  </h2>
                </motion.div>
                <motion.ul 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="list-none space-y-3 pl-11"
                >
                  {[
                    "You must be at least 13 years old to use this service",
                    "You are responsible for maintaining the confidentiality of your account",
                    "You agree not to use the service for illegal or unauthorized purposes",
                    "You will not transmit harmful, offensive, or inappropriate content",
                    "You will respect other users' privacy and rights"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-3 text-[hsl(217.9,10.6%,64.9%)]"
                    >
                      <div className="w-2 h-2 bg-[hsl(263.4,70%,50.4%)] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.section>

              {/* Continue with remaining sections in similar enhanced style */}
              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Shield className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">4. Privacy and Data</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We are committed to protecting your privacy. Our peer-to-peer architecture ensures that your communications 
                  are direct between users. Please refer to our Privacy Policy for detailed information about data handling.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">5. Limitation of Liability</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  FreeFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <Shield className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">6. Termination</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We may terminate or suspend your account and access to the service immediately, without prior notice, 
                  for conduct that we believe violates these Terms of Service or is harmful to other users.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">7. Changes to Terms</h2>
                </motion.div>
                <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes 
                  via email or through the service. Continued use of the service constitutes acceptance of modified terms.
                </motion.p>
              </motion.section>

              <motion.section variants={itemVariants} className="group">
                <motion.div whileHover={{ scale: 1.02 }} className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)]/10 rounded-full flex items-center justify-center group-hover:bg-[hsl(263.4,70%,50.4%)]/20 transition-colors">
                    <FileText className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[hsl(263.4,70%,50.4%)] group-hover:text-purple-600 transition-colors">8. Contact Information</h2>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed pl-11 space-y-2">
                  <p>If you have any questions about these Terms & Conditions, please contact us at:</p>
                  <p className="font-medium">Email: legal@freeflow.com</p>
                  <p className="font-medium text-[hsl(263.4,70%,50.4%)]">Created by: Atharva Sagar and Akash</p>
                </motion.div>
              </motion.section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
