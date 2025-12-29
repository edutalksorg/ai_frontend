import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, BookOpen, Phone, CheckSquare } from 'lucide-react';
import Button from '../../components/Button';
import { Logo } from '../../components/common/Logo';
import { LanguageSelector } from '../../components/common/LanguageSelector';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="cursor-pointer">
            <Logo className="!text-xl sm:!text-2xl" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="outline" size="md" className="!px-2.5 !py-1.5 !text-xs sm:!px-4 sm:!py-2.5 sm:!text-base">
                {t('landing.nav.login')}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="md" className="!px-2.5 !py-1.5 !text-xs sm:!px-4 sm:!py-2.5 sm:!text-base whitespace-nowrap">
                {t('landing.nav.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-500 max-w-2xl mx-auto">
            {t('landing.hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/register" className="flex-1 sm:flex-none">
              <Button variant="primary" size="lg" fullWidth>
                {t('landing.hero.getStartedFree')}
              </Button>
            </Link>
            <Link to="/login" className="flex-1 sm:flex-none">
              <Button variant="outline" size="lg" fullWidth>
                {t('landing.hero.alreadyHaveAccount')}
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('landing.hero.trialText')}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
          {t('landing.features.title')}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Mic,
              title: t('landing.features.aiPronunciation.title'),
              description: t('landing.features.aiPronunciation.description'),
            },
            {
              icon: BookOpen,
              title: t('landing.features.dailyTopics.title'),
              description: t('landing.features.dailyTopics.description'),
            },
            {
              icon: Phone,
              title: t('landing.features.voiceCalling.title'),
              description: t('landing.features.voiceCalling.description'),
            },
            {
              icon: CheckSquare,
              title: t('landing.features.dailyQuizzes.title'),
              description: t('landing.features.dailyQuizzes.description'),
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="card text-center hover:scale-105 transform transition-transform"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <p className="text-4xl font-bold">10K+</p>
              <p className="text-lg mt-2 opacity-90">{t('landing.stats.activeLearners')}</p>
            </div>
            <div>
              <p className="text-4xl font-bold">500+</p>
              <p className="text-lg mt-2 opacity-90">{t('landing.stats.dailyTopics')}</p>
            </div>
            <div>
              <p className="text-4xl font-bold">100+</p>
              <p className="text-lg mt-2 opacity-90">{t('landing.stats.quizQuestions')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
          {t('landing.cta.title')}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          {t('landing.cta.description')}
        </p>
        <Link to="/register">
          <Button variant="primary" size="lg">
            {t('landing.cta.button')}
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-800 text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">EduTalks</h3>
              <p className="text-slate-400 text-sm">{t('landing.footer.brandDesc')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.pricing')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.security')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.blog')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.careers')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white transition">{t('landing.footer.contact')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>{t('landing.footer.copyright')}</p>
            <p className="mt-2">{t('landing.footer.madeWith')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
