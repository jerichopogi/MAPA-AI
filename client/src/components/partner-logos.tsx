import { PARTNER_COMPANIES } from "@/lib/constants";

const PartnerLogos = () => {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold text-neutral-600 mb-8">Trusted by Leading Travel Companies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {PARTNER_COMPANIES.map((company, index) => (
            <div key={index} className="grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <img src={company.logo} alt={company.alt} className="h-10 md:h-12 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
