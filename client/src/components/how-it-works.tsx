import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-sans text-neutral-800 dark:text-white mb-4 fade-in">
            How MAPA<span className="text-[#40A9BC]">AI</span> Works
          </h2>
          <p className="text-lg text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto fade-in-up">
            Our streamlined process makes planning your next adventure faster and easier than ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div 
              className="text-center feature-item" 
              key={step.step} 
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-[#40A9BC] hover:bg-[#40A9BC]/90 dark:bg-[#40A9BC]/90 dark:hover:bg-[#40A9BC] flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-md transition-all duration-300">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{step.title}</h3>
              <p className="text-neutral-600 dark:text-gray-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
