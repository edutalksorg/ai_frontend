import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, BookOpen, Phone, CheckSquare, ArrowRight, Star, Globe, Users, PlayCircle, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import { Logo } from '../../components/common/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick, cardHover, staggerContainer } from '../../constants/animations';
import { ThemeToggle } from '../../components/common/ThemeToggle';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-dvh bg-white dark:bg-[#030014] text-slate-900 dark:text-white selection:bg-primary-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Clean Background with Subtle Texture */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50/20 dark:bg-transparent">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 bg-white/70 dark:bg-[#030014]/60 backdrop-blur-xl border-b border-primary-500/10 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
          >
            <Logo />
          </motion.div>
          <div className="flex items-center gap-4 sm:gap-8">
            <ThemeToggle />
            <Link to="/login">
              <motion.span
                whileHover={{ y: -2 }}
                className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-primary-500 dark:hover:text-white transition-colors cursor-pointer hidden sm:block"
              >
                Login
              </motion.span>
            </Link>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-primary-600 dark:bg-white text-white dark:text-[#030014] hover:bg-primary-700 dark:hover:bg-slate-200 border-none rounded-full px-6 py-2 font-black uppercase tracking-widest text-[10px] shadow-lg">
                  Launch App
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center relative z-10"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
              Transforming Fluency with Artificial Intelligence
            </span>
          </motion.div>

          <motion.h1
            variants={slideUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight mb-8 text-slate-900 dark:text-white"
          >
            MASTER YOUR <br />
            <span className="text-primary-600 dark:text-primary-400">
              VOICE WITH AI
            </span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed tracking-tight"
          >
            The premium platform for mastering English. Real-time phonetic analysis,
            instant feedback, and global peer-to-peer practice sessions.
          </motion.p>

          <motion.div
            variants={slideUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.98 }}>
                <Button className="h-14 px-8 text-base font-black uppercase tracking-[0.2em] bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-xl border-none w-full sm:w-auto transition-all group">
                  Start Your Journey <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                className="h-14 px-8 border border-primary-500/20 dark:border-white/10 text-primary-600 dark:text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-4 w-full sm:w-auto backdrop-blur-md"
              >
                Watch Demo <PlayCircle className="w-6 h-6 text-primary-400" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div
            variants={fadeIn}
            className="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-500"
          >
            <div className="flex items-center gap-2 font-black tracking-widest text-[10px]">PREMIUM EXPERIENCE</div>
            <div className="flex items-center gap-2 font-black tracking-widest text-[10px]">AI-POWERED INSIGHTS</div>
            <div className="flex items-center gap-2 font-black tracking-widest text-[10px]">GLOBAL COMMUNITY</div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="text-primary-500 font-black uppercase tracking-[0.4em] text-[10px] block mb-4">Core Technology</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase">
              Engineered for <br /><span className="text-primary-600 dark:text-primary-400">Excellence</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Mic,
                title: 'AI PRONUNCIATION',
                description: 'State-of-the-art phonetic analysis providing pinpoint accuracy for every phoneme.',
                gradient: 'from-purple-500/20 to-transparent'
              },
              {
                icon: Globe,
                title: 'GLOBAL CONNECT',
                description: 'Instantly connect with native-level speakers and learners worldwide in high-fidelity audio.',
                gradient: 'from-blue-500/20 to-transparent'
              },
              {
                icon: BookOpen,
                title: 'ADAPTIVE MODULES',
                description: 'Curriculum that adapts dynamically to your progress and learning style.',
                gradient: 'from-emerald-500/20 to-transparent'
              },
              {
                icon: CheckSquare,
                title: 'PRECISION TESTS',
                description: 'Rigorous assessment protocols to certify your proficiency and track growth.',
                gradient: 'from-orange-500/20 to-transparent'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-10 bg-slate-50 dark:bg-white/[0.03] border border-primary-500/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-xl dark:shadow-2xl transition-colors duration-300"
              >
                <div className="absolute inset-0 bg-primary-500/5 dark:bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 border border-primary-500/10 dark:border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary-600 transition-colors duration-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <feature.icon className="w-7 h-7 text-primary-600 dark:text-white group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-1 bg-slate-50 dark:bg-white/[0.02] border-y border-primary-500/5 dark:border-white/5 relative overflow-hidden transition-colors">
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <p className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">12M+</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">Words Analyzed</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <p className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">150+</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-600 dark:text-secondary-400">Global Regions</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <p className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">98%</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Success Rate</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter uppercase leading-[1.1]">
            READY TO <br /><span className="text-primary-600 dark:text-primary-400">DOMINATE?</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 mb-16 font-medium max-w-2xl mx-auto leading-relaxed">
            The elite standard of English mastery is just one click away.
            Join the top 1% of language learners today.
          </p>
          <Link to="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="h-16 px-12 text-lg font-black uppercase tracking-[0.2em] rounded-full bg-primary-600 hover:bg-primary-700 text-white dark:bg-white dark:text-[#030014] dark:hover:bg-slate-100 border-none shadow-2xl transition-all">
                Get Started Now
              </Button>
            </motion.div>
          </Link>
          <p className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Secure Enrollment • Limited Time Offer
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-black text-slate-900 dark:text-white py-24 border-t border-primary-500/5 dark:border-white/5 transition-colors">
        <div className="container mx-auto px-10">
          <div className="grid md:grid-cols-4 gap-20 mb-20">
            <div className="space-y-8">
              <Logo />
              <p className="text-slate-500 text-xs font-bold leading-loose uppercase tracking-widest">
                The world's most advanced AI platform for English pronunciation and fluency.
              </p>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-primary-400">SYSTEM</h4>
              <ul className="space-y-4 text-slate-400 text-[10px] font-black tracking-[0.1em] uppercase">
                <li><a href="#" className="hover:text-white transition-colors">Core AI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Infrastructure</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-secondary-400">ECOSYSTEM</h4>
              <ul className="space-y-4 text-slate-400 text-[10px] font-black tracking-[0.1em] uppercase">
                <li><a href="#" className="hover:text-white transition-colors">Our Vision</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-emerald-400">LEGAL</h4>
              <ul className="space-y-4 text-slate-400 text-[10px] font-black tracking-[0.1em] uppercase">
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">
            <p>© 2025 EDUTALKS GLOBAL. EMPOWERING VOICES EVERYWHERE.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-white transition-colors">GITHUB</a>
              <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
              <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
