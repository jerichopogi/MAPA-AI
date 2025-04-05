import { Feature } from "@/lib/types";

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent dark:border-gray-700">
      <div className="w-14 h-14 rounded-full bg-[#40A9BC]/10 dark:bg-[#40A9BC]/20 flex items-center justify-center text-[#40A9BC] mb-6">
        <i className={`fas fa-${feature.icon} text-2xl`}></i>
      </div>
      <h3 className="text-xl font-semibold font-sans mb-3 text-gray-800 dark:text-white">{feature.title}</h3>
      <p className="text-neutral-600 dark:text-gray-300">
        {feature.description}
      </p>
    </div>
  );
};

export default FeatureCard;
