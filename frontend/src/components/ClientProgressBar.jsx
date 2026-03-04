export default function ClientProgressBar({ currentStep }) {
  const steps = [
    { id: 1, label: "Intake" },
    { id: 2, label: "Claims" },
    { id: 3, label: "Evidence" },
    { id: 4, label: "Follow-Up" },
  ];

  return (
    <div className="w-full backdrop-blur-lg bg-white/80 rounded-3xl px-10 py-8 shadow-lg border border-white/40 mb-10">

      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
          Case Progress
        </h3>
        <span className="text-sm font-semibold text-[#5D90FF]">
          Step {currentStep} of {steps.length}
        </span>
      </div>

      <div className="relative">

        <div className="absolute top-6 left-0 w-full h-[6px] bg-gray-200 rounded-full" />

        <div
          className="absolute top-6 left-0 h-[6px] bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] rounded-full transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        <div className="flex justify-between relative z-10">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center w-1/4">
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                  ${
                    step.id < currentStep
                      ? "bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white"
                      : step.id === currentStep
                      ? "bg-white border-2 border-[#5D90FF] text-[#5D90FF] shadow-lg"
                      : "bg-white border border-gray-300 text-gray-400"
                  }`}
              >
                {step.id < currentStep ? "✓" : step.id}
              </div>

              <span
                className={`mt-4 text-sm font-semibold ${
                  step.id <= currentStep
                    ? "text-[#0F172A]"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}