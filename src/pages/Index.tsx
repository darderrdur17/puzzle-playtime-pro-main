import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Settings } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Elephant Puzzle | Creative Learning Game</title>
        <meta name="description" content="An educational jigsaw puzzle game teaching creativity through four phases: Preparation, Incubation, Illumination, and Verification." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background elephant emoji */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-[400px]">🐘</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-8xl mb-6"
          >
            🐘
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
            Creativity is...
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            An educational puzzle game exploring the four phases of creativity
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/play">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Play Game
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/game-master">
                <Settings className="w-5 h-5 mr-2" />
                Game Master
              </Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { phase: "Preparation", color: "bg-phase-preparation", icon: "📚" },
              { phase: "Incubation", color: "bg-phase-incubation", icon: "💭" },
              { phase: "Illumination", color: "bg-phase-illumination", icon: "💡" },
              { phase: "Verification", color: "bg-phase-verification", icon: "✅" },
            ].map((item, i) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className={`${item.color}/20 rounded-xl p-4 border border-border`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-display font-bold text-sm">{item.phase}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating decorations */}
        <motion.div
          className="absolute top-20 left-10 text-4xl"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ☁️
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-4xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        >
          🪿
        </motion.div>
      </div>
    </>
  );
};

export default Index;
