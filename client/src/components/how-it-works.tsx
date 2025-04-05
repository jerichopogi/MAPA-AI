import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-sans text-neutral-800 mb-4">How MAPA<span className="text-primary">AI</span> Works</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our streamlined process makes planning your next adventure faster and easier than ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div className="text-center" key={step.step}>
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
