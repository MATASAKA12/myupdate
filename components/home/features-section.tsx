import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  Wallet,
  BarChart3,
  Lock
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your assets are protected with enterprise-grade encryption and cold storage solutions.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Trades",
    description: "Execute trades in milliseconds with our high-performance trading engine.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Advanced charting tools and market indicators to make informed decisions.",
  },
  {
    icon: Wallet,
    title: "Multi-Asset Wallet",
    description: "Store, send, and receive hundreds of cryptocurrencies in one secure wallet.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Monitor your investments with detailed performance metrics and insights.",
  },
  {
    icon: Lock,
    title: "2FA Protection",
    description: "Two-factor authentication adds an extra layer of security to your account.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose CryptoVault?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for traders who demand the best. Our platform combines cutting-edge 
            technology with user-friendly design.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass border-white/10 hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
