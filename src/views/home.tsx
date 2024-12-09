import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, Sparkles, Zap, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <main className="container mx-auto px-4 py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Elevate Your Writing with{' '}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              QuillMate
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Unlock your creativity and boost your productivity with our AI-powered writing assistant.
          </p>
          <Button 
            size="lg" 
            className="mt-8 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => navigate('/app')}
          >
            Get Started with QuillMate <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Feature Cards */}
        <section className="space-y-8 max-w-2xl mx-auto">
          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                AI-Powered Suggestions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Get intelligent writing suggestions and improvements in real-time as you type with QuillMate.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Zap className="mr-2 h-5 w-5 text-purple-500" />
                Instant Content Generation
              </CardTitle>
              <CardDescription className="text-gray-600">
                Generate high-quality content for various purposes with just a few clicks using QuillMate's AI.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <RefreshCw className="mr-2 h-5 w-5 text-purple-500" />
                Style Adaptation
              </CardTitle>
              <CardDescription className="text-gray-600">
                Easily adapt your writing style for different audiences and purposes with QuillMate's intelligent assistance.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  )
}
