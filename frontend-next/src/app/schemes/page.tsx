"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Landmark, ArrowRight, CheckCircle2 } from "lucide-react"
import { GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SchemeVideo } from "@/components/SchemeVideo"

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<any[]>([])
  
  useEffect(() => {
    async function fetchSchemes() {
      try {
        const res = await fetch('/api/schemes/')
        const data = await res.json()
        setSchemes(data.schemes)
      } catch (err) {
         setSchemes([
           { name: "PM-Kisan Samman Nidhi", description: "Provides income support to all landholding farmers' families in the country rules out ₹6000 per year.", link: "#" },
           { name: "Pradhan Mantri Fasal Bima Yojana", description: "Comprehensive crop insurance scheme from pre-sowing to post-harvest duration against natural risks.", link: "#" }
         ])
      }
    }
    fetchSchemes()
  }, [])

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="text-center md:text-left">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-center md:justify-start gap-3">
          <Landmark className="text-blue-500 h-10 w-10" /> Government Schemes
        </h1>
        <p className="text-muted-foreground text-lg mt-3">Discover and apply for agricultural subsidies and benefits tailored for you.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
        {schemes.map((scheme, i) => (
          <motion.div 
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.4 } }
            }}
          >
            <GlassCard className="h-full flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className=" text-xl leading-tight group-hover:text-blue-500 transition-colors">
                  {scheme.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm flex-1 mb-6 leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  {scheme.description}
                </p>
                <SchemeVideo url={scheme.youtubeLink} title={scheme.name} />
                <a href={scheme.link} target="_blank" rel="noreferrer" className="mt-auto block">
                  <Button variant="outline" className="w-full group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all font-semibold">
                    Apply Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </a>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
