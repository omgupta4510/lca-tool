import { Link } from 'react-router-dom'
import { ArrowRight, Upload, BarChart3, Brain, CheckCircle, Leaf, Zap, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

const HomePage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Smart Data Input',
      description: 'Upload CSV files or input data manually with intelligent validation and preprocessing.',
    },
    {
      icon: Brain,
      title: 'AI Processing',
      description: 'Advanced AI algorithms detect missing data and provide intelligent imputation.',
    },
    {
      icon: BarChart3,
      title: 'LCA Calculations',
      description: 'Comprehensive environmental impact analysis including carbon footprint and energy consumption.',
    },
    {
      icon: CheckCircle,
      title: 'Smart Recommendations',
      description: 'AI-powered suggestions for reducing environmental impact and optimizing sustainability.',
    },
  ]

  const benefits = [
    {
      icon: Leaf,
      title: 'Environmental Impact',
      description: 'Reduce your carbon footprint by up to 40% through data-driven insights.',
    },
    {
      icon: Zap,
      title: 'Energy Efficiency',
      description: 'Optimize energy consumption and identify renewable energy opportunities.',
    },
    {
      icon: Globe,
      title: 'Sustainability Goals',
      description: 'Align with global sustainability standards and achieve ESG objectives.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Leaf className="h-16 w-16 text-primary-600 mx-auto mb-6 animate-bounce-gentle" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6"
          >
            AI-Powered{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
              Life Cycle Assessment
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-secondary-600 mb-6 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your environmental impact analysis with intelligent data processing, 
            comprehensive LCA calculations, and AI-driven sustainability recommendations.
          </motion.p>

          {/* SIH 2025 Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-sm font-bold mr-2">🏆</span>
              <span className="text-sm font-semibold">Smart India Hackathon 2025</span>
              <span className="mx-2">•</span>
              <span className="text-sm font-medium">Team Hope</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/input"
              className="btn btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="btn btn-outline text-lg px-8 py-3"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-white/50 backdrop-blur-sm rounded-3xl mx-4 my-8"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our comprehensive toolkit makes environmental impact assessment accessible, 
              accurate, and actionable for organizations of all sizes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow text-center"
              >
                <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Environmental Benefits
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Make a measurable impact on the environment while improving your organization's 
              sustainability profile and operational efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="card hover:shadow-lg transition-all hover:scale-105 text-center"
              >
                <benefit.icon className="h-16 w-16 text-primary-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl mx-4 text-white text-center"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Environmental Impact?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join leading organizations using AI-powered LCA to drive sustainability and reduce environmental impact.
          </p>
          <Link
            to="/input"
            className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

export default HomePage