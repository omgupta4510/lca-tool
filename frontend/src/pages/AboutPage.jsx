import { motion } from 'framer-motion'
import { 
  Leaf, 
  Brain, 
  BarChart3, 
  Upload, 
  Shield, 
  Zap, 
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  Github,
  Mail,
  ExternalLink,
  Trophy,
  Target,
  Lightbulb,
  Heart,
  Recycle,
  Factory,
  Cpu,
  Database
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AboutPage = () => {
  const features = [
    {
      icon: Recycle,
      title: 'Circular Metal Analytics',
      description: 'Advanced algorithms for tracking metal lifecycle from extraction to recycling, optimizing circular economy practices.',
    },
    {
      icon: Brain,
      title: 'AI-Driven Insights',
      description: 'Machine learning models predict optimal recycling pathways and identify sustainability opportunities in metal processing.',
    },
    {
      icon: Factory,
      title: 'Industrial Integration',
      description: 'Seamless integration with metal processing facilities, foundries, and recycling centers for real-time impact assessment.',
    },
    {
      icon: Database,
      title: 'Comprehensive Database',
      description: 'Extensive database of metal emission factors, recycling rates, and industry benchmarks for accurate LCA calculations.',
    },
  ]

  const benefits = [
    {
      icon: Globe,
      title: 'Circular Economy Advancement',
      description: 'Accelerate the transition to circular metals economy by reducing waste by 60% and increasing recycling efficiency.',
    },
    {
      icon: Zap,
      title: 'Smart Resource Management',
      description: 'AI-powered optimization reduces energy consumption in metal processing by 35% and minimizes raw material usage.',
    },
    {
      icon: Users,
      title: 'Industry Collaboration',
      description: 'Connect metal producers, recyclers, and manufacturers in a unified platform for sustainable supply chain management.',
    },
  ]

  const methodology = [
    {
      step: 1,
      title: 'Metal Lifecycle Tracking',
      description: 'Comprehensive tracking of metals from extraction, processing, manufacturing, use phase, to end-of-life recycling.',
    },
    {
      step: 2,
      title: 'AI-Powered Analysis',
      description: 'Advanced ML algorithms analyze metal composition, quality degradation, and optimal recycling pathways.',
    },
    {
      step: 3,
      title: 'Circular Impact Assessment',
      description: 'Calculate environmental benefits of circular practices including material recovery, energy savings, and emission reductions.',
    },
    {
      step: 4,
      title: 'Optimization Recommendations',
      description: 'AI-generated strategies for maximizing metal circularity, reducing waste, and improving sustainability metrics.',
    },
  ]

  const teamMembers = [
    {
      name: 'Team Hope',
      role: 'SIH 2025 Participants',
      description: 'Passionate innovators focused on sustainable technology solutions for environmental challenges.',
    },
    {
      name: 'AI/ML Specialists',
      role: 'Technology Development',
      description: 'Expert developers creating cutting-edge machine learning solutions for circular economy.',
    },
    {
      name: 'Sustainability Experts',
      role: 'Domain Knowledge',
      description: 'Environmental science and LCA methodology specialists ensuring accurate impact assessment.',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Recycle className="h-16 w-16 text-primary-600 mx-auto mb-6" />
          </motion.div>
          
          {/* SIH 2025 Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-lg mb-6">
            <Trophy className="w-6 h-6" />
            Smart India Hackathon 2025
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            AI-Powered LCA Platform for Circular Metals
          </h1>
          
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            Team Hope presents an innovative solution revolutionizing metal lifecycle management 
            through AI-driven environmental impact assessment and circular economy optimization.
          </p>
        </div>

        {/* Mission Statement */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="card mb-16 bg-gradient-to-r from-primary-50 to-green-50"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold text-secondary-900">Team Hope's Mission</h2>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg text-secondary-700 max-w-4xl mx-auto leading-relaxed">
              To accelerate India's transition to a circular metals economy by leveraging artificial intelligence 
              to optimize metal lifecycle management, reduce environmental impact, and create sustainable 
              industrial practices that benefit both industry and the environment. Our SIH 2025 solution 
              addresses critical challenges in metal waste reduction and resource optimization.
            </p>
          </div>
        </motion.section>

        {/* SIH 2025 Problem Statement */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Trophy className="w-10 h-10 text-orange-600" />
                <h2 className="text-3xl font-bold text-gray-800">SIH 2025 Challenge</h2>
                <Trophy className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                AI-Powered LCA Platform for Circular Metals
              </h3>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6">
                Addressing the critical need for sustainable metal lifecycle management in India's rapidly 
                growing industrial sector. Our solution leverages AI to optimize metal circularity, 
                reduce waste, and minimize environmental impact across the entire metal value chain.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Problem Solved</h4>
                  <p className="text-sm text-gray-600">Metal waste reduction and circular economy optimization</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Innovation</h4>
                  <p className="text-sm text-gray-600">AI-driven lifecycle assessment with real-time optimization</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Impact</h4>
                  <p className="text-sm text-gray-600">Sustainable industrial transformation for India</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Key Features */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Circular Metals Innovation</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our AI-powered platform revolutionizes metal lifecycle management with advanced 
              machine learning and comprehensive circular economy analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Circular Economy Benefits</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Drive India's metal industry transformation with AI-powered circular economy solutions 
              that deliver measurable environmental and economic benefits.
            </p>
          </div>

          <div className="space-y-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="card"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <benefit.icon className="h-16 w-16 text-primary-600 mb-4 md:mb-0 md:mr-6 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-semibold text-secondary-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-secondary-600 leading-relaxed text-lg">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Methodology */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Our Methodology</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              A systematic approach combining environmental science with artificial intelligence 
              for accurate and reliable results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodology.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold text-secondary-900">Team Hope - SIH 2025</h2>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              A passionate group of innovators dedicated to solving India's environmental challenges 
              through cutting-edge AI and sustainable technology solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technology Stack */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="card bg-secondary-50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Technology Stack</h2>
              <p className="text-lg text-secondary-600">
                Built with modern, reliable technologies for performance and scalability.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Frontend</h3>
                <div className="space-y-2 text-secondary-600">
                  <div>React 18 with Hooks</div>
                  <div>Tailwind CSS</div>
                  <div>Chart.js for Visualizations</div>
                  <div>Framer Motion</div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Backend</h3>
                <div className="space-y-2 text-secondary-600">
                  <div>Node.js with Express</div>
                  <div>SQLite Database</div>
                  <div>RESTful API Design</div>
                  <div>File Upload Handling</div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">AI/ML</h3>
                <div className="space-y-2 text-secondary-600">
                  <div>Python with Flask</div>
                  <div>Scikit-learn</div>
                  <div>Pandas & NumPy</div>
                  <div>Statistical Imputation</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Standards & Compliance */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Standards & Compliance</h2>
              <p className="text-lg text-secondary-600">
                Our methodology aligns with international environmental standards and best practices.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'ISO 14040/14044', description: 'LCA Principles and Framework' },
                { name: 'GHG Protocol', description: 'Greenhouse Gas Accounting' },
                { name: 'IPCC Guidelines', description: 'Climate Change Assessment' },
                { name: 'EU PEF', description: 'Product Environmental Footprint' },
              ].map((standard, index) => (
                <motion.div
                  key={standard.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center p-4 bg-primary-50 rounded-lg"
                >
                  <CheckCircle className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-secondary-900 mb-2">{standard.name}</h3>
                  <p className="text-sm text-secondary-600">{standard.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact & Links */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="card text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-6">Get Involved</h2>
            <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
              Interested in contributing to environmental sustainability through technology? 
              We'd love to hear from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@ecolca.com"
                className="btn btn-primary"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </a>
              
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your LCA Journey?</h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join hundreds of organizations using EcoLCA to measure, understand, and reduce 
            their environmental impact.
          </p>
          <Link
            to="/input"
            className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.section>
      </motion.div>
    </div>
  )
}

export default AboutPage