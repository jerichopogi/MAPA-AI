import { PARTNER_COMPANIES } from "@/lib/constants";

const PartnerLogos = () => {
  return (
    <section className="bg-white dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold text-neutral-600 dark:text-gray-300 mb-8 fade-in">Trusted by Leading Travel Companies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {PARTNER_COMPANIES.map((company, index) => (
            <div 
              key={index} 
              className="grayscale dark:brightness-[0.9] hover:grayscale-0 hover:brightness-100 transition-all opacity-70 hover:opacity-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={company.logo} 
                alt={company.alt} 
                className="h-10 md:h-12 w-auto object-contain dark:bg-white dark:p-2 dark:rounded" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
