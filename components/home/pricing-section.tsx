"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/auth-modal"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started with crypto trading",
    features: [
      "Trade up to 5 cryptocurrencies",
      "Basic charting tools",
      "Email support",
      "Mobile app access",
      "Standard security",
    ],
    highlighted: false,
  },
  {
    name: "Advanced",
    price: "$29",
    period: "/month",
    description: "For serious traders who need more power",
    features: [
      "Trade unlimited cryptocurrencies",
      "Advanced charting & indicators",
      "Priority 24/7 support",
      "API access",
      "Lower trading fees (0.1%)",
      "Portfolio analytics",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "Enterprise-grade tools for professional traders",
    features: [
      "Everything in Advanced",
      "Dedicated account manager",
      "Custom API limits",
      "Zero trading fees",
      "Advanced order types",
      "Institutional-grade security",
      "Tax reporting tools",
    ],
    highlighted: false,
  },
]

export function PricingSection() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <>
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your trading needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative glass border-white/10 ${
                  plan.highlighted
                    ? "border-primary/50 shadow-lg shadow-primary/10 scale-105"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => setAuthModalOpen(true)}
                  >
                    {plan.price === "Free" ? "Get Started" : "Choose Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultTab="signup" />
    </>
  )
}
